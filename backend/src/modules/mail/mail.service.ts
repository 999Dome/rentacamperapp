import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend, CreateEmailOptions } from 'resend';

export interface SendEmailOptions {
  to: string;
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
      const payload: CreateEmailOptions = {
        from: this.defaultFrom,
        to: options.to,
        reply_to: options.replyTo || this.defaultReplyTo,
        subject: options.subject,
        html: options.html,
      };

      if (options.attachments && options.attachments.length > 0) {
        payload.attachments = options.attachments;
      }

      const { error } = await this.resend.emails.send(payload);

      if (error) {
        this.logger.error(`Failed to send email to ${options.to}`, error);
        throw new Error(error.message);
      }

      this.logger.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      this.logger.error(`Error sending email to ${options.to}`, error);
      throw error;
    }
  }
}
