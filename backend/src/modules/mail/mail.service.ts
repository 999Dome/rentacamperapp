import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend, CreateEmailOptions } from 'resend';
import type { CancellationPdfData } from '../pdf/pdf.service';

/**
 * Options describing a single outgoing email, passed to {@link MailService.sendEmail}.
 */
export interface SendEmailOptions {
  // Recipient address.
  to: string;
  // Optional display name/sender label; the actual verified address is substituted in.
  from?: string;
  // Optional reply-to address; defaults to the service's configured reply-to.
  replyTo?: string;
  // Email subject line.
  subject: string;
  // HTML body of the email.
  html: string;
  // Optional file attachments (e.g. a generated PDF invoice).
  attachments?: {
    filename: string;
    content: Buffer;
  }[];
}

/**
 * Thin wrapper around the Resend email API. Centralises sender/reply-to defaults,
 * sandbox-mode redirection, and error logging so callers just describe the email.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend;
  // Default "from" address used when a caller does not override it.
  private readonly defaultFrom: string;
  // Default "reply-to" address used when a caller does not override it.
  private readonly defaultReplyTo: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);

    this.defaultFrom =
      this.configService.get<string>('EMAIL_FROM') ||
      'noreply@rent-a-camper.me';
    this.defaultReplyTo =
      this.configService.get<string>('EMAIL_REPLY_TO') ||
      'service@rent-a-camper.me';
  }

  /**
   * Sends an email through Resend, applying sandbox redirection and sender defaults.
   *
   * @param options Recipient, subject, HTML body and optional attachments ({@link SendEmailOptions}).
   * @returns Resolves once the email has been accepted by Resend.
   * @throws Error If Resend reports a send failure (message propagated from the API).
   */
  async sendEmail(options: SendEmailOptions): Promise<void> {
    try {
      let recipient = options.to;
      // Resend's sandbox sender ("onboarding@resend.dev") may only deliver to the
      // verified developer address, so redirect everything else there in that mode.
      if (
        this.defaultFrom === 'onboarding@resend.dev' &&
        recipient !== 'xbydomex@gmail.com'
      ) {
        this.logger.warn(
          `Redirecting email from ${recipient} to verified developer email xbydomex@gmail.com due to Resend Sandbox restrictions.`,
        );
        recipient = 'xbydomex@gmail.com';
      }

      let sender = this.defaultFrom;
      if (options.from) {
        // We must send from a verified domain address, so we keep our own verified
        // email but display the caller's chosen name in front of it:
        //   "Caller Name" <verified@ourdomain>
        // Extract the address inside angle brackets of defaultFrom, or use it as-is.
        const emailMatch = this.defaultFrom.match(/<([^>]+)>/);
        const verifiedEmail = emailMatch
          ? emailMatch[1]
          : this.defaultFrom.trim();
        // Strip angle brackets from the caller-supplied name to avoid breaking the header.
        const cleanDisplayName = options.from.replace(/[<>]/g, '').trim();
        sender = `"${cleanDisplayName}" <${verifiedEmail}>`;
      }

      const payload: CreateEmailOptions = {
        from: sender,
        to: recipient,
        replyTo: options.replyTo || this.defaultReplyTo,
        subject: options.subject,
        html: options.html,
      };

      // Only attach the attachments key when there is at least one file, to keep
      // the payload minimal for plain emails.
      if (options.attachments && options.attachments.length > 0) {
        payload.attachments = options.attachments;
      }

      const { error } = await this.resend.emails.send(payload);

      if (error) {
        this.logger.error(`Failed to send email to ${recipient}`, error);
        throw new Error(error.message);
      }

      this.logger.log(`Email sent successfully to ${recipient}`);
    } catch (error) {
      this.logger.error(`Error sending email to ${options.to}`, error);
      throw error;
    }
  }

  /**
   * Sends the booking-cancellation confirmation email with the cancellation
   * receipt PDF attached.
   *
   * @param to Customer email address.
   * @param pdfBuffer The generated cancellation receipt PDF ({@link PdfService}).
   * @param data Cancellation details used to fill in the email text ({@link CancellationPdfData}).
   * @returns Resolves once the email has been dispatched.
   * @throws Error If the underlying {@link MailService.sendEmail} call fails.
   */
  async sendCancellationEmail(
    to: string,
    pdfBuffer: Buffer,
    data: CancellationPdfData,
  ): Promise<void> {
    // German-language HTML body; grossRefundAmount is formatted to two decimals
    // (fixed-currency display) and interpolated into the confirmation text.
    const html = `
      <h1>Ihre Stornierungsbestätigung</h1>
      <p>Hallo ${data.customerName},</p>
      <p>hiermit bestätigen wir Ihnen die Stornierung Ihrer Buchung für das Wohnmobil "${data.camperName}".</p>
      <p>Im Anhang finden Sie Ihren Stornierungsbeleg als PDF-Dokument.</p>
      <p>Der Erstattungsbetrag von ${data.grossRefundAmount.toFixed(2)} € wird Ihnen in den nächsten Tagen gutgeschrieben.</p>
      <p>Wir hoffen, Sie bald wieder bei uns begrüßen zu dürfen.</p>
      <p>Viele Grüße,<br>Ihr Rent-A-Camper Team</p>
    `;

    // Attach the PDF named after the cancellation number for easy reference.
    await this.sendEmail({
      to,
      subject: 'Deine Stornierungsbestätigung - Rent-A-Camper 🚐',
      html,
      attachments: [
        {
          filename: `Stornierung_${data.cancellationNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    });
  }
}
