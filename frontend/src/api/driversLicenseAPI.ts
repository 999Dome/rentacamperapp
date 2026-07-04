import { BaseAPIClient } from '../infrastructure/api/base-api-client';
import type { DriversLicense } from "../types/interface.ts";

const client = new BaseAPIClient();

export async function getDriversLicenseById(id: string): Promise<DriversLicense | null> {
  try {
    return await client.request<DriversLicense>(`drivers-license/${id}`);
  } catch (error) {
    console.error('Error while loading the drivers license:', error);
    return null;
  }
}
