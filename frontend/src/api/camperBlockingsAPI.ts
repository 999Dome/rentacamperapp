import {
  CamperBlockingsApiClient,
  CreateBlockingRequest,
  BlockingResponse,
} from '../infrastructure/api/camper-blockings-api-client';

const apiClient = CamperBlockingsApiClient.getInstance();

export async function createCamperBlocking(
  userId: string,
  data: CreateBlockingRequest,
): Promise<BlockingResponse> {
  return apiClient.createBlocking(userId, data);
}

export async function fetchCamperBlockings(
  userId: string,
  camperId: string,
): Promise<BlockingResponse[]> {
  return apiClient.getBlockings(userId, camperId);
}

export async function deleteCamperBlocking(
  userId: string,
  id: string,
): Promise<void> {
  return apiClient.deleteBlocking(userId, id);
}
