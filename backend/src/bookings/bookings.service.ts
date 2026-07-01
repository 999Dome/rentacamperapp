import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export class CreateBookingDto {
  camper_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  addons?: string[];
}

interface BookingWithRelations {
  id: string;
  camper_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  campers: {
    name: string | null;
  } | null;
  booking_addons: Array<{
    price_at_booking: number;
    addons: {
      name: string;
    } | null;
  }>;
}

@Injectable()
export class BookingsService {
  readonly table = 'bookings';

  constructor(private readonly supabase: SupabaseService) {}

  async create(dto: CreateBookingDto) {
    const { data: booking, error: bookingError } = await this.supabase.client
      .from(this.table)
      .insert({
        camper_id: dto.camper_id,
        user_id: dto.user_id,
        start_date: dto.start_date,
        end_date: dto.end_date,
        total_price: dto.total_price,
        status: 'pending',
      })
      .select()
      .single();

    if (bookingError) throw new Error(bookingError.message);

    if (dto.addons && dto.addons.length > 0) {
      const { data: addonsList, error: addonsError } =
        await this.supabase.client
          .from('addons')
          .select('id, price')
          .in('id', dto.addons);

      if (addonsError) throw new Error(addonsError.message);

      if (addonsList && addonsList.length > 0) {
        const bookingAddonsInserts = addonsList.map((addon) => ({
          booking_id: booking.id,
          addon_id: addon.id,
          price_at_booking: addon.price,
        }));

        const { error: insertError } = await this.supabase.client
          .from('booking_addons')
          .insert(bookingAddonsInserts);

        if (insertError) throw new Error(insertError.message);
      }
    }

    return booking;
  }

  async findAllByRenter(userId: string) {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .select(
        '*, campers(name), booking_addons(price_at_booking, addons(name))',
      )
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    if (!data) return [];

    const bookings = data as unknown as BookingWithRelations[];

    return bookings.map((b) => ({
      id: b.id,
      camper_id: b.camper_id,
      camper_name: b.campers?.name || 'Unbekannt',
      start_date: b.start_date,
      end_date: b.end_date,
      total_price: b.total_price,
      status: b.status,
      addons_price:
        b.booking_addons?.reduce(
          (sum: number, ba) => sum + ba.price_at_booking,
          0,
        ) || 0,
      addons_detail:
        b.booking_addons?.map((ba) => ({
          name: ba.addons?.name || 'Zusatz',
          price: ba.price_at_booking,
        })) || [],
    }));
  }

  async findAllByProvider(providerId: string) {
    void providerId;
    const { data, error } = await this.supabase.client
      .from(this.table)
      .select(
        '*, campers(name), booking_addons(price_at_booking, addons(name))',
      );

    if (error) throw new Error(error.message);
    if (!data) return [];

    const bookings = data as unknown as BookingWithRelations[];

    return bookings.map((b) => ({
      id: b.id,
      camper_id: b.camper_id,
      camper_name: b.campers?.name || 'Unbekannt',
      start_date: b.start_date,
      end_date: b.end_date,
      total_price: b.total_price,
      status: b.status,
      addons_price:
        b.booking_addons?.reduce(
          (sum: number, ba) => sum + ba.price_at_booking,
          0,
        ) || 0,
      addons_detail:
        b.booking_addons?.map((ba) => ({
          name: ba.addons?.name || 'Zusatz',
          price: ba.price_at_booking,
        })) || [],
    }));
  }

  async updateStatus(
    id: string,
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  ) {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
