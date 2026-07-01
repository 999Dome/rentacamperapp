import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { IBookingRepository } from './booking-repository.interface';
import {
  Booking,
  BookingStatus,
  BookingWithRelations,
  CreateBookingCommand,
} from '../../domain/interfaces/booking.interface';
import { EntityNotFoundException } from '../../domain/exceptions/domain.exception';

interface BookingRawData {
  id: string;
  camper_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
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
export class BookingRepository implements IBookingRepository {
  private readonly tableName = 'bookings';

  constructor(private readonly supabase: SupabaseService) {}

  async create(command: CreateBookingCommand): Promise<Booking> {
    const { data: booking, error: bookingError } = await this.supabase.client
      .from(this.tableName)
      .insert({
        camper_id: command.camperId,
        user_id: command.userId,
        start_date: command.startDate,
        end_date: command.endDate,
        total_price: command.totalPrice,
        status: 'pending' as BookingStatus,
      })
      .select()
      .single();

    if (bookingError) {
      throw new Error(`Failed to create booking: ${bookingError.message}`);
    }

    if (command.addonIds && command.addonIds.length > 0) {
      await this.attachAddons(booking.id, command.addonIds);
    }

    return booking as Booking;
  }

  async findById(bookingId: string): Promise<Booking | null> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('*')
      .eq('id', bookingId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to find booking: ${error.message}`);
    }

    return data as Booking | null;
  }

  async findByRenterId(userId: string): Promise<BookingWithRelations[]> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select(
        '*, campers(name), booking_addons(price_at_booking, addons(name))',
      )
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to find bookings: ${error.message}`);
    }

    return this.mapToBookingsWithRelations(data as BookingRawData[]);
  }

  async findByProviderId(
    _providerId?: string,
  ): Promise<BookingWithRelations[]> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select(
        '*, campers(name), booking_addons(price_at_booking, addons(name))',
      );

    if (error) {
      throw new Error(`Failed to find bookings: ${error.message}`);
    }

    return this.mapToBookingsWithRelations(data as BookingRawData[]);
  }

  async updateStatus(
    bookingId: string,
    status: BookingStatus,
  ): Promise<Booking> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .update({ status })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update booking status: ${error.message}`);
    }

    if (!data) {
      throw new EntityNotFoundException('Booking', bookingId);
    }

    return data as Booking;
  }

  private async attachAddons(
    bookingId: string,
    addonIds: string[],
  ): Promise<void> {
    const { data: addonsList, error: addonsError } = await this.supabase.client
      .from('addons')
      .select('id, price')
      .in('id', addonIds);

    if (addonsError) {
      throw new Error(`Failed to fetch addons: ${addonsError.message}`);
    }

    if (addonsList && addonsList.length > 0) {
      const bookingAddonsInserts = addonsList.map(
        (addon: { id: string; price: number }) => ({
          booking_id: bookingId,
          addon_id: addon.id,
          price_at_booking: addon.price,
        }),
      );

      const { error: insertError } = await this.supabase.client
        .from('booking_addons')
        .insert(bookingAddonsInserts);

      if (insertError) {
        throw new Error(`Failed to attach addons: ${insertError.message}`);
      }
    }
  }

  private mapToBookingsWithRelations(
    rawData: BookingRawData[],
  ): BookingWithRelations[] {
    if (!rawData) {
      return [];
    }

    return rawData.map((booking) => ({
      id: booking.id,
      camper_id: booking.camper_id,
      camper_name: booking.campers?.name || 'Unbekannt',
      user_id: booking.user_id,
      start_date: booking.start_date,
      end_date: booking.end_date,
      total_price: booking.total_price,
      status: booking.status,
      addons_price:
        booking.booking_addons?.reduce(
          (sum: number, ba) => sum + ba.price_at_booking,
          0,
        ) || 0,
      addons_detail:
        booking.booking_addons?.map((ba) => ({
          name: ba.addons?.name || 'Zusatz',
          price: ba.price_at_booking,
        })) || [],
    }));
  }
}
