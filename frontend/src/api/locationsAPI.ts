import { LocationAPIClient, LocationResponse } from '../infrastructure/api/location-api-client';

const client = new LocationAPIClient();

export async function getAllLocations(): Promise<LocationResponse[]> {
  return await client.fetchAllLocations();
}

export async function getLocationById(id: string): Promise<LocationResponse | null> {
  return await client.fetchLocationById(id);
}
