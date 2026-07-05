/**
 * A manual availability block placed on a camper by its provider/owner.
 *
 * Unlike a booking, a blocking is not tied to a renter — the provider uses it
 * to mark periods when the camper is unavailable (maintenance, private use,
 * …). The booking flow treats overlapping blockings as "not available".
 */
export interface CamperBlocking {
  id: string;
  camper_id: string;
  /** Block start date, ISO `YYYY-MM-DD`. */
  start_date: string;
  /** Block end date, ISO `YYYY-MM-DD`. */
  end_date: string;
  /** Optional free-text reason (e.g. "Wartung"). */
  reason?: string;
}

/**
 * Payload for creating a new {@link CamperBlocking}. Same shape as the entity
 * minus the server-generated `id`.
 */
export interface CreateCamperBlockingDto {
  camper_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
}
