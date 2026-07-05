/**
 * API functions for reading and updating a user's profile
 * (personal info and role flags such as provider/renter/admin).
 */

import { BaseAPIClient } from '../infrastructure/api/base-api-client';

const client = new BaseAPIClient();

/** Shape of a user profile as stored/returned by the backend. */
export interface ProfileData {
  id: string;
  first_name: string;
  last_name: string;
  drivers_license_class: string | null;
  is_provider: boolean;
  is_renter: boolean;
  is_admin: boolean;
  updated_at: string | null;
}

/**
 * Fetches the profile belonging to a given user.
 *
 * @param userId Id of the user whose profile should be loaded.
 * @returns The user's profile data.
 */
export async function fetchProfile(userId: string): Promise<ProfileData> {
  return await client.request<ProfileData>(`profiles/${userId}`);
}

/**
 * Updates (partially or fully) the profile belonging to a given user.
 *
 * @param userId Id of the user whose profile should be updated.
 * @param data Fields to update; any field left out is unchanged.
 * @returns The updated profile data.
 */
export async function updateProfile(
  userId: string,
  data: Partial<ProfileData>,
): Promise<ProfileData> {
  return await client.request<ProfileData>(`profiles/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
