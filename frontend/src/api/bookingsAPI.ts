import { BookingAPIClient } from '../infrastructure/api/booking-api-client';

const client = new BookingAPIClient();

export interface BookingAddonDetail {
  name: string;
  price: number;
}

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

export async function fetchBookingsByRenter(
  userId: string,
): Promise<BookingResponse[]> {
  return await client.fetchBookingsByRenter(userId);
}

export async function fetchBookingsByProvider(
  providerId: string,
): Promise<BookingResponse[]> {
  return await client.fetchBookingsByProvider(providerId);
}

export async function updateBookingStatus(
  bookingId: string,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
): Promise<BookingResponse> {
  return await client.updateBookingStatus(bookingId, status);
}

export async function cancelBooking(
  bookingId: string,
  userId: string,
): Promise<BookingResponse> {
  return await client.cancelBooking(bookingId, userId);
}

export async function getBlockedDates(camperId: string): Promise<{ blockedRanges: { from: string; to: string }[] }> {
  return await client.getBlockedDates(camperId);
}
