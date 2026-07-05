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

/**
 * Shape of a raw joined booking row as returned by Supabase.
 *
 * This mirrors the exact structure of the `select(...)` join used in the
 * "with relations" queries below (nested `campers`, `booking_addons`,
 * `pickup_location`, `return_location`). It is an internal type — the mapper
 * flattens it into the public {@link BookingWithRelations}.
 */
interface BookingRawData {
  id: string;
  camper_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: BookingStatus;
  expires_at: string | null;
  pickup_location_id: string | null;
  return_location_id: string | null;
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
  pickup_location?: {
    city: string;
    street: string;
    name?: string;
  } | null;
  return_location?: {
    city: string;
    street: string;
    name?: string;
  } | null;
}

/**
 * Supabase-backed implementation of {@link IBookingRepository}.
 *
 * Besides plain CRUD it encapsulates two booking-specific concerns:
 *  - a 15-minute expiry hold on `pending` bookings, and
 *  - a manual add-on attachment with rollback (Supabase has no multi-table
 *    transactions here, so atomicity is enforced in code).
 */
@Injectable()
export class BookingRepository implements IBookingRepository {
  private readonly tableName = 'bookings';

  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Creates a booking and attaches any selected add-ons.
   *
   * New bookings start as `pending` with a 15-minute `expires_at` hold, so an
   * abandoned checkout releases the camper automatically. If add-on
   * attachment fails, the just-created booking is deleted again to avoid a
   * half-written booking (manual rollback in lieu of a DB transaction).
   *
   * @param command Everything needed to create the booking.
   * @returns The created booking row.
   * @throws Error If the insert fails, or if add-on attachment fails (after
   *         the partial booking has been rolled back).
   */
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
        // Hold the camper for 15 minutes; after that an unpaid booking expires
        // and stops counting as an overlap (see findOverlappingBookings).
        expires_at: new Date(Date.now() + 15 * 60000).toISOString(),
        pickup_location_id: command.pickupLocationId,
        return_location_id: command.returnLocationId,
      })
      .select()
      .single();

    if (bookingError) {
      throw new Error(`Failed to create booking: ${bookingError.message}`);
    }

    if (command.addonIds && command.addonIds.length > 0) {
      try {
        await this.attachAddons(booking.id, command.addonIds);
      } catch (error) {
        // Manual rollback to ensure atomicity
        await this.supabase.client
          .from(this.tableName)
          .delete()
          .eq('id', booking.id);
        throw new Error(
          `Booking aborted because addon attachment failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return booking as Booking;
  }

  /**
   * Returns bookings that currently "occupy" a camper.
   *
   * A booking counts as valid/occupying when it is `confirmed`, `completed`,
   * or still-`pending` with an unexpired hold. Expired pending bookings are
   * excluded because their hold has lapsed.
   *
   * @param camperId The camper to check.
   * @returns The occupying bookings.
   * @throws Error If the query fails.
   */
  async findValidBookingsByCamperId(camperId: string): Promise<Booking[]> {
    const now = new Date().toISOString();

    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('*')
      .eq('camper_id', camperId)
      // confirmed OR completed OR (pending AND not yet expired)
      .or(
        `status.eq.confirmed,status.eq.completed,and(status.eq.pending,expires_at.gt.${now})`,
      );

    if (error) {
      throw new Error(`Failed to fetch valid bookings: ${error.message}`);
    }

    return (data || []) as Booking[];
  }

  /**
   * Finds active bookings that clash with a requested date range.
   *
   * Overlap rule: an existing booking clashes when it starts on/before the
   * requested end AND ends on/after the requested start. Only "occupying"
   * bookings are considered (see {@link findValidBookingsByCamperId}), so an
   * expired pending hold does not block a new booking.
   *
   * @param camperId  The camper to check.
   * @param startDate Requested range start (ISO `YYYY-MM-DD`).
   * @param endDate   Requested range end (ISO `YYYY-MM-DD`).
   * @returns Clashing bookings; empty if the range is free.
   * @throws Error If the query fails.
   */
  async findOverlappingBookings(
    camperId: string,
    startDate: string,
    endDate: string,
  ): Promise<Booking[]> {
    const now = new Date().toISOString();

    // Condition: existing.start_date <= new.endDate AND existing.end_date >= new.startDate
    // And (status == 'confirmed' OR status == 'completed' OR (status == 'pending' AND expires_at > NOW))
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('*')
      .eq('camper_id', camperId)
      .or(
        `status.eq.confirmed,status.eq.completed,and(status.eq.pending,expires_at.gt.${now})`,
      )
      .lte('start_date', endDate)
      .gte('end_date', startDate);

    if (error) {
      throw new Error(`Failed to check overlapping bookings: ${error.message}`);
    }

    return (data || []) as Booking[];
  }

  /**
   * Looks up a single booking by id.
   *
   * @param bookingId The booking id.
   * @returns The booking, or `null` if none exists.
   * @throws Error If the query fails.
   */
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

  /**
   * Lists a renter's bookings with everything the UI needs.
   *
   * The join pulls in the camper name, priced add-ons, and both locations in a
   * single query. The two `locations!...fkey` aliases are required because the
   * booking references the `locations` table twice (pickup and return), so the
   * specific foreign key must be named to disambiguate the joins.
   *
   * @param userId The renter's user id.
   * @returns The renter's bookings, flattened via {@link mapToBookingsWithRelations}.
   * @throws Error If the query fails.
   */
  async findByRenterId(userId: string): Promise<BookingWithRelations[]> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select(
        '*, campers(name), booking_addons(price_at_booking, addons(name)), pickup_location:locations!bookings_pickup_location_id_fkey(city, street), return_location:locations!bookings_return_location_id_fkey(city, street)',
      )
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to find bookings: ${error.message}`);
    }

    return this.mapToBookingsWithRelations(data as BookingRawData[]);
  }

  /**
   * Lists bookings for the provider dashboard.
   *
   * Currently returns *all* bookings (the `providerId` parameter is accepted
   * for interface compatibility but not yet used to scope results to a single
   * provider's campers).
   *
   * @param _providerId Reserved for future per-provider filtering; unused.
   * @returns All bookings, flattened via {@link mapToBookingsWithRelations}.
   * @throws Error If the query fails.
   */
  async findByProviderId(
    _providerId?: string,
  ): Promise<BookingWithRelations[]> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select(
        '*, campers(name), booking_addons(price_at_booking, addons(name)), pickup_location:locations!bookings_pickup_location_id_fkey(city, street), return_location:locations!bookings_return_location_id_fkey(city, street)',
      );

    if (error) {
      throw new Error(`Failed to find bookings: ${error.message}`);
    }

    return this.mapToBookingsWithRelations(data as BookingRawData[]);
  }

  /**
   * Transitions a booking to a new status.
   *
   * @param bookingId The booking to update.
   * @param status    The new status.
   * @returns The updated booking row.
   * @throws EntityNotFoundException If no booking matches the id.
   * @throws Error If the update itself fails.
   */
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

  /**
   * Links the selected add-ons to a booking.
   *
   * Prices are read from the `addons` table and stored on each link as
   * `price_at_booking`, capturing the price *at the time of booking* so later
   * price changes never retroactively alter an existing booking's total.
   *
   * @param bookingId The booking to attach add-ons to.
   * @param addonIds  Ids of the add-ons to attach.
   * @throws Error If reading the add-ons or inserting the links fails.
   */
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

  /**
   * Flattens raw joined rows into the UI-facing {@link BookingWithRelations}.
   *
   * Responsibilities: sum the add-on prices into `addons_price`, build the
   * per-add-on `addons_detail` list, and apply German display fallbacks
   * ("Unbekannt", "Zusatz", "<city> Station") wherever a joined value is
   * missing, so the client never has to render nulls.
   *
   * @param rawData Raw joined booking rows from Supabase.
   * @returns The flattened bookings; empty array if `rawData` is falsy.
   */
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
      expires_at: booking.expires_at,
      pickup_location_id: booking.pickup_location_id,
      return_location_id: booking.return_location_id,
      created_at: booking.created_at,
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
      pickup_location: booking.pickup_location
        ? {
            city: booking.pickup_location.city,
            street: booking.pickup_location.street,
            name:
              booking.pickup_location.name ||
              `${booking.pickup_location.city} Station`,
          }
        : undefined,
      return_location: booking.return_location
        ? {
            city: booking.return_location.city,
            street: booking.return_location.street,
            name:
              booking.return_location.name ||
              `${booking.return_location.city} Station`,
          }
        : undefined,
    }));
  }
}
