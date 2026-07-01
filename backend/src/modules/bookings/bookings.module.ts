import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { BookingRepository } from '../../infrastructure/repositories/booking.repository';
import { SupabaseModule } from '../../supabase/supabase.module';
import { BOOKING_REPOSITORY_TOKEN } from '../../infrastructure/repositories/booking-repository.interface';
import { DriversLicenseModule } from '../drivers_license/drivers_license.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { CampersModule } from '../campers/camper.module';

@Module({
  imports: [
    SupabaseModule,
    DriversLicenseModule,
    ProfilesModule,
    CampersModule,
  ],
  controllers: [BookingsController],
  providers: [
    BookingsService,
    {
      provide: BOOKING_REPOSITORY_TOKEN,
      useClass: BookingRepository,
    },
    BookingRepository,
  ],
  exports: [BookingsService],
})
export class BookingsModule {}
