import { Injectable, BadRequestException } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { ContactRequestDto } from './dto/contact-request.dto';

/**
 * Business logic for the support/contact feature: validates the submitted
 * contact form and relays it to the configured support inbox via {@link MailService}.
 */
@Injectable()
export class SupportService {
  // Destination address for support requests; overridable via the EMAIL_TO env var.
  private readonly supportEmail: string;

  constructor(
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {
    // Fall back to a hard-coded service inbox if EMAIL_TO is not configured.
    this.supportEmail =
      this.configService.get<string>('EMAIL_TO') || 'service@rent-a-camper.me';
  }

  /**
   * Validates a contact-form submission and forwards it to the support inbox.
   *
   * @param dto The submitted contact request ({@link ContactRequestDto}).
   * @returns `{ success: true }` after the email has been sent.
   * @throws BadRequestException If any field is empty or the email format is invalid.
   */
  async sendContactEmail(
    dto: ContactRequestDto,
  ): Promise<{ success: boolean }> {
    // Reject early if any required field is missing/empty.
    if (!dto.name || !dto.email || !dto.subject || !dto.message) {
      throw new BadRequestException('All fields are required.');
    }

    // Trim surrounding whitespace so validation and display use clean values.
    const cleanEmail = dto.email.trim();
    const cleanName = dto.name.trim();

    // Basic sanity check: "something@something.something" with no spaces.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      throw new BadRequestException('Invalid email format.');
    }

    // Compose the support-inbox email body. Newlines in the free-text message
    // are converted to <br/> so line breaks survive in the HTML email.
    const htmlContent = `
      <h2>Neue Support-Anfrage von ${cleanName}</h2>
      <p><strong>Email:</strong> ${cleanEmail}</p>
      <p><strong>Betreff:</strong> ${dto.subject}</p>
      <hr />
      <p><strong>Nachricht:</strong></p>
      <p>${dto.message.replace(/\n/g, '<br/>')}</p>
    `;

    // Send to the support inbox. `from` carries the customer's display name and
    // `replyTo` is set to the customer so support staff can reply directly.
    await this.mailService.sendEmail({
      to: this.supportEmail,
      from: `${cleanName} (${cleanEmail})`,
      replyTo: cleanEmail,
      subject: `Support-Anfrage: ${dto.subject}`,
      html: htmlContent,
    });

    return { success: true };
  }
}
