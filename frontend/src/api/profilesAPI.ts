const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

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
  const url = new URL(`profiles/${userId}`, API_BASE_URL).toString();
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }
  return await response.json();
}

export async function updateProfile(
  userId: string,
  data: Partial<ProfileData>,
): Promise<ProfileData> {
  const url = new URL(`profiles/${userId}`, API_BASE_URL).toString();
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update profile");
  }
  return await response.json();
}
