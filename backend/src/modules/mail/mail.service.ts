import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend, CreateEmailOptions } from 'resend';
import type { CancellationPdfData } from '../pdf/pdf.service';

export interface SendEmailOptions {
  to: string;
  from?: string;
  replyTo?: string;
  subject: string;
  html: string;
  attachments?: {
    filename: string;
    content: Buffer;
  }[];
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend;
  private readonly defaultFrom: string;
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

  async sendEmail(options: SendEmailOptions): Promise<void> {
    try {
      let recipient = options.to;
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
        const emailMatch = this.defaultFrom.match(/<([^>]+)>/);
        const verifiedEmail = emailMatch ? emailMatch[1] : this.defaultFrom.trim();
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

  async sendCancellationEmail(
    to: string,
    pdfBuffer: Buffer,
    data: CancellationPdfData,
  ): Promise<void> {
    const html = `
      <h1>Ihre Stornierungsbestätigung</h1>
      <p>Hallo ${data.customerName},</p>
      <p>hiermit bestätigen wir Ihnen die Stornierung Ihrer Buchung für das Wohnmobil "${data.camperName}".</p>
      <p>Im Anhang finden Sie Ihren Stornierungsbeleg als PDF-Dokument.</p>
      <p>Der Erstattungsbetrag von ${data.grossRefundAmount.toFixed(2)} € wird Ihnen in den nächsten Tagen gutgeschrieben.</p>
      <p>Wir hoffen, Sie bald wieder bei uns begrüßen zu dürfen.</p>
      <p>Viele Grüße,<br>Ihr Rent-A-Camper Team</p>
    `;

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
