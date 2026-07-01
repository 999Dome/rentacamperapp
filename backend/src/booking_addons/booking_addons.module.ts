import { Module } from '@nestjs/common';
import { BookingAddonsController } from './booking_addons.controller';
import { BookingAddonsService } from './booking_addons.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [BookingAddonsController],
  providers: [BookingAddonsService],
  exports: [BookingAddonsService],
})
export class BookingAddonsModule {}
