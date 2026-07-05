import { BaseAPIClient } from '../infrastructure/api/base-api-client';
import type { Addon } from "../types/interface.ts";

/**
 * Talks to the backend's "addons" endpoints. Addons are optional extras
 * (e.g. bike rack, awning) that a renter can add to a camper booking.
 * All functions in this module fail "softly": instead of throwing, they
 * log the error and return an empty/fallback value so callers don't need
 * try/catch everywhere.
 */

const client = new BaseAPIClient();

/**
 * Fetches every addon available in the system.
 * @returns All addons, or an empty array if the request fails.
 */
export async function getAllAddons(): Promise<Addon[]> {
  try {
    return await client.request<Addon[]>('addons/all');
  } catch (error) {
    console.error('Error while loading the addons:', error);
    return [];
  }
}
