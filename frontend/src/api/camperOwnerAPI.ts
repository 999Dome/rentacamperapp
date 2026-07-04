import { CamperOwnerAPIClient } from '../infrastructure/api/camper-owner-api-client';
import type { CamperOwner, CamperOwnerInsert } from '../types/interface';

const client = new CamperOwnerAPIClient();

export async function getCamperOwnerByUserId(userId: string): Promise<CamperOwner[]> {
  return await client.getByUserId(userId);
}

export async function getCamperOwnerByCamperId(camperId: string): Promise<CamperOwner> {
  return await client.getByCamperId(camperId);
}

export async function assignCamperOwner(data: CamperOwnerInsert): Promise<CamperOwner> {
  return await client.assignOwner(data);
}

export async function removeCamperOwner(camperId: string): Promise<void> {
  return await client.removeOwner(camperId);
}
