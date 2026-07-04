export class CreateBookingDto {
  camper_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  addons?: string[];
  pickup_location_id?: string;
  return_location_id?: string;
}

export class UpdateBookingStatusDto {
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export class CancelBookingDto {
  user_id: string;
}
