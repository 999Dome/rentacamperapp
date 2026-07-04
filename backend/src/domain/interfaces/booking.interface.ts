export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  camper_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: BookingStatus;
  expires_at?: string | null;
  pickup_location_id?: string | null;
  return_location_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBookingCommand {
  camperId: string;
  userId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  addonIds?: string[];
  pickupLocationId?: string;
  returnLocationId?: string;
}

export interface BookingWithRelations {
  id: string;
  camper_id: string;
  camper_name: string;
  user_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: BookingStatus;
  expires_at?: string | null;
  addons_price: number;
  addons_detail: Array<{
    name: string;
    price: number;
  }>;
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
