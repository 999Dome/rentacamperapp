import { BaseAPIClient } from '../infrastructure/api/base-api-client';
import type { CamperFeature } from "../types/interface.ts";

const client = new BaseAPIClient();

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
