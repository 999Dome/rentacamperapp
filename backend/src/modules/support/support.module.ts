import { Module } from '@nestjs/common';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { MailModule } from '../mail/mail.module';

/**
 * Handles customer support / contact-form requests. Imports {@link MailModule}
 * so {@link SupportService} can send the incoming request on to the support inbox,
 * and registers {@link SupportController} to expose the HTTP endpoint.
 */
@Module({
  imports: [MailModule],
  controllers: [SupportController],
  providers: [SupportService],
})
export class SupportModule {}
