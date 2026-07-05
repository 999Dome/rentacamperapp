import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

/**
 * Wires up the email subsystem. Provides {@link MailService} and exports it so
 * other modules (e.g. support, bookings) can inject it to send transactional mail.
 */
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
