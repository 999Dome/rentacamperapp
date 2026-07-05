import { CamperBlockingsApiClient } from '../infrastructure/api/camper-blockings-api-client';
import type {
  CreateBlockingRequest,
  BlockingResponse,
} from '../infrastructure/api/camper-blockings-api-client';

/**
 * Talks to the backend's "camper blockings" endpoints. A blocking is a
 * date range during which a camper owner manually marks their camper as
 * unavailable (e.g. for maintenance), separate from actual bookings.
 * The underlying `CamperBlockingsApiClient` is a singleton, so this module
 * just forwards calls to its shared instance.
 */

const apiClient = CamperBlockingsApiClient.getInstance();

/**
 * Creates a new blocking for a camper.
 * @param userId ID of the user (camper owner) creating the blocking.
 * @param data Camper, date range and optional reason for the blocking.
 * @returns The newly created blocking.
 */
export async function createCamperBlocking(
  userId: string,
  data: CreateBlockingRequest,
): Promise<BlockingResponse> {
  return apiClient.createBlocking(userId, data);
}

/**
 * Fetches all blockings for a given camper.
 * @param userId ID of the user requesting the blockings (used for authorization).
 * @param camperId ID of the camper to fetch blockings for.
 */
export async function fetchCamperBlockings(
  userId: string,
  camperId: string,
): Promise<BlockingResponse[]> {
  return apiClient.getBlockings(userId, camperId);
}

/**
 * Deletes an existing blocking.
 * @param userId ID of the user requesting the deletion (used for authorization).
 * @param id ID of the blocking to delete.
 */
export async function deleteCamperBlocking(
  userId: string,
  id: string,
): Promise<void> {
  return apiClient.deleteBlocking(userId, id);
}
