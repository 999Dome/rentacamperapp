import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

/**
 * Service for the `booking_addons` join table, which records which add-ons a
 * booking selected and at what price. Talks directly to Supabase (Postgres)
 * via {@link SupabaseService}.
 */
@Injectable()
export class BookingAddonsService {
  /** Name of the Supabase/Postgres table this service operates on. */
  readonly table = 'booking_addons';

  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Fetches every add-on linked to a booking, including the add-on's name.
   *
   * @param bookingId - Id of the booking to look up add-ons for.
   * @returns A promise resolving to the matching join rows, each with the
   *   related add-on's `name` embedded.
   * @throws Error if the Supabase query fails.
   */
  async findByBookingId(bookingId: string) {
    const { data, error } = await this.supabase.client
      .from(this.table)
      // `addons(name)` performs a foreign-key join so each row carries the
      // human-readable add-on name, not just the addon_id.
      .select('*, addons(name)')
      .eq('booking_id', bookingId);

    // Supabase reports failures via the `error` field rather than throwing, so
    // translate it into a thrown Error to match normal control flow.
    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Links an add-on to a booking, snapshotting its price at booking time.
   *
   * @param bookingId - Id of the booking the add-on is attached to.
   * @param addonId - Id of the add-on being added.
   * @param priceAtBooking - The add-on's price captured at booking time, kept
   *   as a historical snapshot so later catalog price changes do not alter
   *   past bookings.
   * @returns A promise resolving to the newly created join row.
   * @throws Error if the Supabase insert fails.
   */
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
