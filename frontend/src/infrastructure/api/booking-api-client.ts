import { BaseAPIClient } from './base-api-client';

export interface BookingCreateRequest {
  camper_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  addons?: string[];
}

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

export class BookingAPIClient extends BaseAPIClient {
  async createBooking(data: BookingCreateRequest): Promise<BookingResponse> {
    return await this.request<BookingResponse>('bookings/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async fetchBookingsByRenter(userId: string): Promise<BookingResponse[]> {
    return await this.request<BookingResponse[]>(`bookings/renter/${userId}`);
  }

  async fetchBookingsByProvider(providerId: string): Promise<BookingResponse[]> {
    return await this.request<BookingResponse[]>(`bookings/provider/${providerId}`);
  }

  async updateBookingStatus(bookingId: string, status: BookingResponse['status']): Promise<BookingResponse> {
    return await this.request<BookingResponse>(`bookings/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }
}
