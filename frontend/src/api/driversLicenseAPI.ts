import { BaseAPIClient } from '../infrastructure/api/base-api-client';
import type { DriversLicense } from "../types/interface.ts";

/**
 * Talks to the backend's "drivers license" endpoint. A drivers-license
 * record describes which license class (e.g. "Klasse B") is required to
 * drive a given camper. Fails softly: logs the error and returns `null`
 * instead of throwing.
 */

const client = new BaseAPIClient();

/**
 * Fetches a drivers-license record by its ID.
 * @param id ID of the drivers-license record.
 * @returns The drivers-license record, or `null` if not found or the request fails.
 */
export async function getDriversLicenseById(id: string): Promise<DriversLicense | null> {
  try {
    return await client.request<DriversLicense>(`drivers-license/${id}`);
  } catch (error) {
    console.error('Error while loading the drivers license:', error);
    return null;
  }
}
