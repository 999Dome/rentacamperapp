import { CampersAPIClient } from '../infrastructure/api/camper-api-client';
import type { PriceCalculationResponse } from '../infrastructure/api/camper-api-client';
import type { Camper } from "../types/interface.ts";
import type { MockCamper } from "../utils/mockData.ts";
import { CamperDetailTransformer } from '../infrastructure/transformers/camper-detail-transformer';

/**
 * Talks to the backend's "campers" endpoints: fetching campers (raw or
 * enriched with extra display details), calculating a rental price, and
 * creating/updating/deleting campers. Most of the actual HTTP work is
 * delegated to `CampersAPIClient`; this module also runs the raw campers
 * returned by the backend through `CamperDetailTransformer` where the UI
 * needs the richer `MockCamper` shape.
 */

const client = new CampersAPIClient();

/**
 * Fetches the campers highlighted on the homepage.
 */
export async function getHighlightCampers(): Promise<Camper[]> {
  return await client.getHighlightCampers();
}

/**
 * Fetches a single camper by its ID.
 * @param id ID of the camper.
 */
export async function getCamperById(id: string): Promise<Camper> {
  return await client.getCamperById(id);
}

/**
 * Calculates the total rental price for a camper over a date range,
 * including any selected add-ons.
 * @param camperId ID of the camper to price.
 * @param startDate Rental start date (ISO string).
 * @param endDate Rental end date (ISO string).
 * @param selectedAddonIds IDs of the add-ons the user selected.
 * @returns The full price breakdown (base price, discounts, fees, total, etc.).
 */
export async function calculatePrice(camperId: string, startDate: string, endDate: string, selectedAddonIds: string[]): Promise<PriceCalculationResponse> {
  return await client.calculatePrice({ camperId, startDate, endDate, selectedAddonIds });
}

/**
 * Fetches all campers matching the given filters, transformed into the
 * richer `MockCamper` shape used by the display components.
 * @param filters Optional filters for required driver's license and/or emissions class.
 */
export async function getAllCampers(filters?: { requiredLicense?: string; emissionsClass?: string }): Promise<MockCamper[]> {
  const campers = await client.getAllCampers(filters);
  const transformer = new CamperDetailTransformer();
  return await transformer.transformMultipleCampersWithDetails(campers);
}

/**
 * Creates a new camper. Admin-only operation.
 * @param data Partial camper data to create.
 */
export async function createCamper(
  data: Partial<MockCamper>,
): Promise<MockCamper> {
  return await client.createCamper(data);
}

/**
 * Updates an existing camper. Admin-only operation.
 * @param id ID of the camper to update.
 * @param data Partial camper fields to update.
 */
export async function updateCamper(
  id: string,
  data: Partial<MockCamper>,
): Promise<MockCamper> {
  return await client.updateCamper(id, data);
}

/**
 * Deletes a camper. Admin-only operation.
 * @param id ID of the camper to delete.
 */
export async function deleteCamper(id: string): Promise<unknown> {
  return await client.deleteCamper(id);
}
