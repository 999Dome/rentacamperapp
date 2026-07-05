import { BaseAPIClient } from '../infrastructure/api/base-api-client';
import type { CamperFeature } from "../types/interface.ts";

/**
 * Talks to the backend's "camper features" endpoint. Camper features are
 * equipment/attributes attached to a specific camper (e.g. "solar panel",
 * "4 seats"). On failure this fails softly by logging and returning an
 * empty array instead of throwing.
 */

const client = new BaseAPIClient();

/**
 * Fetches all features belonging to a specific camper.
 * @param camperId ID of the camper to fetch features for.
 * @returns The camper's features, or an empty array if the request fails.
 */
export async function getCamperFeaturesByCamperId(
  camperId: string,
): Promise<CamperFeature[]> {
  try {
    return await client.request<CamperFeature[]>(`camper-features/${camperId}`);
  } catch (error) {
    console.error('Error while loading the camper features:', error);
    return [];
  }
}
