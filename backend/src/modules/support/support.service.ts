import { Injectable, BadRequestException } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { ContactRequestDto } from './dto/contact-request.dto';

@Injectable()
export class SupportService {
  private readonly supportEmail: string;

  constructor(
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {
    this.supportEmail =
      this.configService.get<string>('EMAIL_TO') ||
      'service@rent-a-camper.me';
  }

  async sendContactEmail(
    dto: ContactRequestDto,
  ): Promise<{ success: boolean }> {
    if (!dto.name || !dto.email || !dto.subject || !dto.message) {
      throw new BadRequestException('All fields are required.');
    }

    const cleanEmail = dto.email.trim();
    const cleanName = dto.name.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      throw new BadRequestException('Invalid email format.');
    }

    const htmlContent = `
      <h2>Neue Support-Anfrage von ${cleanName}</h2>
      <p><strong>Email:</strong> ${cleanEmail}</p>
      <p><strong>Betreff:</strong> ${dto.subject}</p>
      <hr />
      <p><strong>Nachricht:</strong></p>
      <p>${dto.message.replace(/\n/g, '<br/>')}</p>
    `;

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
