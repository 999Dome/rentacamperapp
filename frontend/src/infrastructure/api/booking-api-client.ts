/**
 * Client for the booking endpoints: creating bookings, listing them per
 * renter/provider, updating their status, cancelling them, and checking
 * which dates are already booked for a camper.
 */

import { BaseAPIClient } from './base-api-client';

/** Payload for creating a new booking. */
export interface BookingCreateRequest {
  camper_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  addons?: string[];
  pickup_location_id?: string;
  return_location_id?: string;
}

/** A single addon selected for a booking, with its name and price. */
export interface BookingAddonDetail {
  name: string;
  price: number;
}

/** A booking as returned by the backend. */
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

export class BookingAPIClient extends BaseAPIClient {
  /**
   * Creates a new booking.
   *
   * @param data Booking details (camper, renter, dates, price, addons, locations).
   * @returns The created booking.
   */
  async createBooking(data: BookingCreateRequest): Promise<BookingResponse> {
    return await this.request<BookingResponse>('bookings/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Fetches all bookings made by a given renter (user renting a camper).
   *
   * @param userId Id of the renter.
   * @returns The renter's bookings.
   */
  async fetchBookingsByRenter(userId: string): Promise<BookingResponse[]> {
    return await this.request<BookingResponse[]>(`bookings/renter/${userId}`);
  }

  /**
   * Fetches all bookings for campers owned by a given provider.
   *
   * @param providerId Id of the provider.
   * @returns The provider's incoming bookings.
   */
  async fetchBookingsByProvider(providerId: string): Promise<BookingResponse[]> {
    return await this.request<BookingResponse[]>(`bookings/provider/${providerId}`);
  }

  /**
   * Updates the status of a booking (e.g. confirming or completing it).
   *
   * @param bookingId Id of the booking to update.
   * @param status New status to set.
   * @returns The updated booking.
   */
  async updateBookingStatus(bookingId: string, status: BookingResponse['status']): Promise<BookingResponse> {
    return await this.request<BookingResponse>(`bookings/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  /**
   * Cancels a booking on behalf of a user.
   *
   * @param bookingId Id of the booking to cancel.
   * @param userId Id of the user requesting the cancellation.
   * @returns The updated (cancelled) booking.
   */
  async cancelBooking(bookingId: string, userId: string): Promise<BookingResponse> {
    return await this.request<BookingResponse>(`bookings/${bookingId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  /**
   * Fetches the date ranges during which a camper is already booked, so the
   * UI can block those dates in a date picker.
   *
   * @param camperId Id of the camper to check.
   * @returns The list of blocked date ranges (`from`/`to`, both ISO strings).
   */
  async getBlockedDates(camperId: string): Promise<{ blockedRanges: { from: string; to: string }[] }> {
    return await this.request<{ blockedRanges: { from: string; to: string }[] }>(`bookings/campers/${camperId}/blocked-dates`);
  }
}
