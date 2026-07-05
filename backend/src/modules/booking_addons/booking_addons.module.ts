import { Module } from '@nestjs/common';
import { BookingAddonsController } from './booking_addons.controller';
import { BookingAddonsService } from './booking_addons.service';
import { SupabaseModule } from '../../supabase/supabase.module';

/**
 * Wires together the booking-add-ons feature: the
 * {@link BookingAddonsController} (HTTP layer) and {@link BookingAddonsService}
 * (data access). Imports {@link SupabaseModule} for DB access and exports the
 * service so other modules (e.g. bookings) can attach add-ons to a booking.
 */
@Module({
  imports: [SupabaseModule],
  controllers: [BookingAddonsController],
  providers: [BookingAddonsService],
  exports: [BookingAddonsService],
})
export class BookingAddonsModule {}
