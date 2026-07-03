const envRaw = import.meta.env.VITE_API_URL as unknown;
const API_BASE_URL = (typeof envRaw === 'string' ? envRaw : '') || 'http://localhost:3000';

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
  async fetchAllLocations(): Promise<LocationResponse[]> {
    const response = await fetch(`${API_BASE_URL}/locations`);
    if (!response.ok) {
      throw new Error(`Error fetching locations: ${response.statusText}`);
    }
    return await response.json() as LocationResponse[];
  }

  async fetchLocationById(id: string): Promise<LocationResponse | null> {
    const response = await fetch(`${API_BASE_URL}/locations/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Error fetching location: ${response.statusText}`);
    }
    return await response.json() as LocationResponse;
  }
}
