import { CamperOwnerAPIClient } from '../infrastructure/api/camper-owner-api-client';
import type { CamperOwner, CamperOwnerInsert } from '../types/interface';

/**
 * Talks to the backend's "camper owner" endpoints. A "camper owner" record
 * links a camper to the user (provider) who owns/manages it, which is used
 * to control who can edit a camper and who receives its bookings.
 */

const client = new CamperOwnerAPIClient();

/**
 * Fetches all camper-ownership records for a given user, i.e. every camper
 * that user owns.
 * @param userId ID of the user (provider).
 */
export async function getCamperOwnerByUserId(userId: string): Promise<CamperOwner[]> {
  return await client.getByUserId(userId);
}

/**
 * Fetches the ownership record for a given camper, i.e. who owns it.
 * @param camperId ID of the camper.
 */
export async function getCamperOwnerByCamperId(camperId: string): Promise<CamperOwner> {
  return await client.getByCamperId(camperId);
}

/**
 * Assigns a camper to an owner, creating a new ownership record.
 * @param data The camper/user pair (and any other insert fields) to link.
 */
export async function assignCamperOwner(data: CamperOwnerInsert): Promise<CamperOwner> {
  return await client.assignOwner(data);
}

/**
 * Removes the ownership record for a camper, unlinking it from its owner.
 * @param camperId ID of the camper to unlink.
 */
export async function removeCamperOwner(camperId: string): Promise<void> {
  return await client.removeOwner(camperId);
}
