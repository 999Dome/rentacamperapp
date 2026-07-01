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
  addons_detail: BookingAddonDetail[];
}

export async function createBooking(data: {
  camper_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  addons?: string[];
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
