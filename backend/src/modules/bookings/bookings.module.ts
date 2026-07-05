import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { BookingRepository } from '../../infrastructure/repositories/booking.repository';
import { SupabaseModule } from '../../supabase/supabase.module';
import { BOOKING_REPOSITORY_TOKEN } from '../../infrastructure/repositories/booking-repository.interface';
import { DriversLicenseModule } from '../drivers_license/drivers_license.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { CampersModule } from '../campers/camper.module';
import { CamperBlockingsModule } from '../camper_blockings/camper_blockings.module';
import { PdfModule } from '../pdf/pdf.module';
import { MailModule } from '../mail/mail.module';

/**
 * Wires up the bookings feature.
 *
 * Imports the collaborators the booking flow needs: Supabase (DB), license &
 * profile checks, camper lookups, blockings, and the PDF/mail services used for
 * invoices and cancellation notices. `BookingsService` is exported so other
 * modules can reuse it.
 */
@Module({
  imports: [
    SupabaseModule,
    DriversLicenseModule,
    ProfilesModule,
    CampersModule,
    CamperBlockingsModule,
    PdfModule,
    MailModule,
  ],
  controllers: [BookingsController],
  providers: [
    BookingsService,
    // Bind the repository interface token to the concrete Supabase class so the
    // service can depend on IBookingRepository rather than the implementation.
    {
      provide: BOOKING_REPOSITORY_TOKEN,
      useClass: BookingRepository,
    },
    // Also register the concrete class directly for anything that injects it
    // by type (e.g. this module's own internal wiring).
    BookingRepository,
  ],
  exports: [BookingsService],
})
export class BookingsModule {}
