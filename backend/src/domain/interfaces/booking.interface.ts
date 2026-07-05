/**
 * The lifecycle states a booking can be in.
 *
 * - `pending`   – created but not yet paid/confirmed; holds the camper only
 *                 until `expires_at` passes.
 * - `confirmed` – paid/accepted; an invoice has been sent to the customer.
 * - `completed` – the rental period is over.
 * - `cancelled` – cancelled by the renter (or system); frees the camper again.
 */
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

/**
 * A booking row as stored in the database.
 *
 * This is the plain persistence shape (snake_case, matching the DB columns).
 * For the richer, UI-facing shape that joins in camper/addon/location data see
 * {@link BookingWithRelations}.
 */
export interface Booking {
  id: string;
  camper_id: string;
  user_id: string;
  /** Rental start date, ISO `YYYY-MM-DD`. */
  start_date: string;
  /** Rental end date, ISO `YYYY-MM-DD`. */
  end_date: string;
  /** Gross total price in EUR agreed at booking time. */
  total_price: number;
  status: BookingStatus;
  /**
   * When a `pending` booking stops holding the camper. `null` once the booking
   * is confirmed/completed. Used by the overlap check to ignore stale holds.
   */
  expires_at?: string | null;
  pickup_location_id?: string | null;
  return_location_id?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Command object describing everything needed to create a booking.
 *
 * Uses camelCase and is decoupled from the HTTP DTO on purpose: the service
 * translates the incoming request into this command before handing it to the
 * repository, so the persistence layer never depends on transport shapes.
 */
export interface CreateBookingCommand {
  camperId: string;
  userId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  /** Ids of optional add-ons (e.g. bike rack) selected for this booking. */
  addonIds?: string[];
  pickupLocationId?: string;
  returnLocationId?: string;
}

/**
 * A booking enriched with the related data the UI needs to render it without
 * further round-trips: camper name, priced add-ons, and pickup/return
 * locations. Produced by the repository from a joined query.
 */
export interface BookingWithRelations {
  id: string;
  camper_id: string;
  /** Display name of the booked camper, falling back to "Unbekannt". */
  camper_name: string;
  user_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: BookingStatus;
  expires_at?: string | null;
  /** Sum of all add-on prices captured at booking time. */
  addons_price: number;
  /** Per-add-on breakdown (name + price as charged). */
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
