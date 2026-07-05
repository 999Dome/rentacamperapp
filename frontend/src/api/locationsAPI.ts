import { LocationAPIClient, type LocationResponse } from '../infrastructure/api/location-api-client';

/**
 * Talks to the backend's "locations" endpoints. Locations are the
 * pickup/return addresses a renter can choose for a booking.
 */

const client = new LocationAPIClient();

/**
 * Fetches every available location.
 */
export async function getAllLocations(): Promise<LocationResponse[]> {
  return await client.fetchAllLocations();
}

/**
 * Fetches a single location by its ID.
 * @param id ID of the location.
 * @returns The location, or `null` if it doesn't exist.
 */
export async function getLocationById(id: string): Promise<LocationResponse | null> {
  return await client.fetchLocationById(id);
}
