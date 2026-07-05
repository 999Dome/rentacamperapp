/**
 * Request body for creating a booking (`POST /bookings/create`).
 *
 * Uses snake_case to match the JSON the frontend sends. The service maps this
 * into the internal `CreateBookingCommand` before persisting.
 *
 * NOTE: there are no `class-validator` decorators yet, so these fields are not
 * automatically validated at the HTTP boundary — the service performs the
 * business validation (dates, license, availability) explicitly.
 */
export class CreateBookingDto {
  camper_id: string;
  user_id: string;
  /** Requested rental start, ISO `YYYY-MM-DD`. */
  start_date: string;
  /** Requested rental end, ISO `YYYY-MM-DD`. */
  end_date: string;
  /** Gross total price (EUR) as calculated by the client. */
  total_price: number;
  /** Ids of optional add-ons selected for the booking. */
  addons?: string[];
  pickup_location_id?: string;
  return_location_id?: string;
}

/**
 * Request body for changing a booking's status (`PUT /bookings/:id/status`).
 */
export class UpdateBookingStatusDto {
  /** Target lifecycle state to transition the booking to. */
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

/**
 * Request body for cancelling a booking (`POST /bookings/:id/cancel`).
 */
export class CancelBookingDto {
  /** Id of the user requesting the cancellation; must own the booking. */
  user_id: string;
}
