import { CampersAPIClient } from '../infrastructure/api/camper-api-client';
import type { Camper } from "../types/interface.ts";
import type { MockCamper } from "../utils/mockData.ts";
import { CamperDetailTransformer } from '../infrastructure/transformers/camper-detail-transformer';

const client = new CampersAPIClient();

export async function getHighlightCampers(): Promise<Camper[]> {
  return await client.getHighlightCampers();
}

export async function getCamperById(id: string): Promise<Camper> {
  return await client.getCamperById(id);
}

export async function calculatePrice(camperId: string, startDate: string, endDate: string, selectedAddonIds: string[]): Promise<unknown> {
  return await client.calculatePrice({ camperId, startDate, endDate, selectedAddonIds });
}

export async function getAllCampers(): Promise<MockCamper[]> {
  const campers = await client.getAllCampers();
  const transformer = new CamperDetailTransformer();
  return await transformer.transformMultipleCampersWithDetails(campers);
}

export async function createCamper(
  data: Partial<MockCamper>,
): Promise<MockCamper> {
  return await client.createCamper(data);
}

export async function updateCamper(
  id: string,
  data: Partial<MockCamper>,
): Promise<MockCamper> {
  return await client.updateCamper(id, data);
}

export async function deleteCamper(id: string): Promise<unknown> {
  return await client.deleteCamper(id);
}
