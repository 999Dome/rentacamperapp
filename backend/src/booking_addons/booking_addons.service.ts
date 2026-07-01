import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class BookingAddonsService {
  readonly table = 'booking_addons';

  constructor(private readonly supabase: SupabaseService) {}

  async findByBookingId(bookingId: string) {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .select('*, addons(name)')
      .eq('booking_id', bookingId);

    if (error) throw new Error(error.message);
    return data;
  }

  async create(bookingId: string, addonId: string, priceAtBooking: number) {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .insert({
        booking_id: bookingId,
        addon_id: addonId,
        price_at_booking: priceAtBooking,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
