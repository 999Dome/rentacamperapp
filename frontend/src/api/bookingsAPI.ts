const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

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
  status: "pending" | "confirmed" | "completed" | "cancelled";
  addons_detail: BookingAddonDetail[];
}

export async function createBooking(data: {
  camper_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  addons?: string[];
}): Promise<unknown> {
  const url = new URL("bookings/create", API_BASE_URL).toString();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to create booking");
  }
  return await response.json();
}

export async function fetchBookingsByRenter(
  userId: string,
): Promise<BookingResponse[]> {
  const url = new URL(`bookings/renter/${userId}`, API_BASE_URL).toString();
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch bookings for renter");
  }
  return await response.json();
}

export async function fetchBookingsByProvider(
  providerId: string,
): Promise<BookingResponse[]> {
  const url = new URL(`bookings/provider/${providerId}`, API_BASE_URL).toString();
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch bookings for provider");
  }
  return await response.json();
}

export async function updateBookingStatus(
  bookingId: string,
  status: "pending" | "confirmed" | "completed" | "cancelled",
): Promise<unknown> {
  const url = new URL(`bookings/${bookingId}/status`, API_BASE_URL).toString();
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error("Failed to update booking status");
  }
  return await response.json();
}
