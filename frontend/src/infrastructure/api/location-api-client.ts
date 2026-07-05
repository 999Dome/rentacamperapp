/**
 * API client for looking up physical pickup/drop-off locations for campers.
 *
 * Unlike the other `*-api-client.ts` files, this one does NOT extend
 * `BaseAPIClient` - it calls `fetch` directly and reads its base URL from
 * `VITE_API_URL` (with a localhost fallback) instead of `VITE_BACKEND_URL`.
 */

const envRaw = import.meta.env.VITE_API_URL as unknown;
const API_BASE_URL = (typeof envRaw === 'string' ? envRaw : '') || 'http://localhost:3000';

/** A single pickup/drop-off location as returned by the backend. */
export interface LocationResponse {
  id: string;
  name?: string;
  street: string;
  housenumber?: number;
  plz?: number;
  city: string;
  latitude?: number;
  longitude?: number;
}

export class LocationAPIClient {
  /**
   * Fetches all known locations.
   * @returns The list of all locations.
   */
  async fetchAllLocations(): Promise<LocationResponse[]> {
    const response = await fetch(`${API_BASE_URL}/locations`);
    if (!response.ok) {
      throw new Error(`Error fetching locations: ${response.statusText}`);
    }
    return await response.json() as LocationResponse[];
  }

  /**
   * Fetches a single location by its ID.
   * @param id - ID of the location to fetch.
   * @returns The matching location, or `null` if no location with that ID exists.
   */
  async fetchLocationById(id: string): Promise<LocationResponse | null> {
    const response = await fetch(`${API_BASE_URL}/locations/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Error fetching location: ${response.statusText}`);
    }
    return await response.json() as LocationResponse;
  }
}
