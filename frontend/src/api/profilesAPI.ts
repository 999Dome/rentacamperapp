import { BaseAPIClient } from '../infrastructure/api/base-api-client';

const client = new BaseAPIClient();

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

export async function fetchProfile(userId: string): Promise<ProfileData> {
  return await client.request<ProfileData>(`profiles/${userId}`);
}

export async function updateProfile(
  userId: string,
  data: Partial<ProfileData>,
): Promise<ProfileData> {
  return await client.request<ProfileData>(`profiles/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
