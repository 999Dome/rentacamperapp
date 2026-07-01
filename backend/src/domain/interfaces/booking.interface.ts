export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  camper_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: BookingStatus;
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
  addons_price: number;
  addons_detail: Array<{
    name: string;
    price: number;
  }>;
}
