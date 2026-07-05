import { BookingAPIClient } from '../infrastructure/api/booking-api-client';

/**
 * Talks to the backend's "bookings" endpoints: creating bookings, listing
 * a renter's or provider's bookings, changing a booking's status, cancelling
 * a booking, and checking which dates are already blocked for a camper.
 * All the actual HTTP work is delegated to `BookingAPIClient`; this module
 * just exposes plain functions (and the shared shapes) for the rest of the
 * app to import.
 */

const client = new BookingAPIClient();

/** A single addon (e.g. "Bike rack") attached to a booking, with its price. */
export interface BookingAddonDetail {
  name: string;
  price: number;
}

/** A booking as returned by the backend, including resolved addon and location details. */
export interface BookingResponse {
  id: string;
  camper_id: string;
  camper_name: string;
  start_date: string;
  end_date: string;
  total_price: number;
  addons_price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  expires_at?: string | null;
  addons_detail: BookingAddonDetail[];
  pickup_location?: {
    city: string;
    street: string;
    name?: string;
  };
  return_location?: {
    city: string;
    street: string;
    name?: string;
  };
}

/**
 * Creates a new booking for a camper.
 * @param data Booking details: which camper/user, the date range, the
 *   pre-calculated total price, and any optional addons/locations.
 * @returns The newly created booking.
 */
export async function createBooking(data: {
  camper_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  addons?: string[];
  pickup_location_id?: string;
  return_location_id?: string;
}): Promise<BookingResponse> {
  return await client.createBooking(data);
}

/**
 * Fetches all bookings made by a renter (i.e. the user booking a camper).
 * @param userId ID of the renter.
 */
export async function fetchBookingsByRenter(
  userId: string,
): Promise<BookingResponse[]> {
  return await client.fetchBookingsByRenter(userId);
}

/**
 * Fetches all bookings for campers owned by a given provider.
 * @param providerId ID of the camper-owning provider.
 */
export async function fetchBookingsByProvider(
  providerId: string,
): Promise<BookingResponse[]> {
  return await client.fetchBookingsByProvider(providerId);
}

/**
 * Updates the status of an existing booking (e.g. confirming or completing it).
 * @param bookingId ID of the booking to update.
 * @param status New status to set.
 */
export async function updateBookingStatus(
  bookingId: string,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
): Promise<BookingResponse> {
  return await client.updateBookingStatus(bookingId, status);
}

/**
 * Cancels a booking on behalf of the given user.
 * @param bookingId ID of the booking to cancel.
 * @param userId ID of the user requesting the cancellation (used for authorization).
 */
export async function cancelBooking(
  bookingId: string,
  userId: string,
): Promise<BookingResponse> {
  return await client.cancelBooking(bookingId, userId);
}

/**
 * Fetches the date ranges during which a camper is already booked/unavailable,
 * so the UI can disable those dates in a date picker.
 * @param camperId ID of the camper to check.
 * @returns An object containing the list of blocked `{ from, to }` date ranges.
 */
export async function getBlockedDates(camperId: string): Promise<{ blockedRanges: { from: string; to: string }[] }> {
  return await client.getBlockedDates(camperId);
}
