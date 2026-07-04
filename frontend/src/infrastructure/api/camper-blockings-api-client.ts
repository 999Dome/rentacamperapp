import { BaseAPIClient } from './base-api-client';

export interface CreateBlockingRequest {
  camper_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
}

export interface BlockingResponse {
  id: string;
  camper_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
}

export class CamperBlockingsApiClient extends BaseAPIClient {
  private static instance: CamperBlockingsApiClient;

  private constructor() {
    super();
  }

  public static getInstance(): CamperBlockingsApiClient {
    if (!CamperBlockingsApiClient.instance) {
      CamperBlockingsApiClient.instance = new CamperBlockingsApiClient();
    }
    return CamperBlockingsApiClient.instance;
  }

  public async createBlocking(
    userId: string,
    data: CreateBlockingRequest,
  ): Promise<BlockingResponse> {
    return this.request<BlockingResponse>(
      `/camper-blockings?userId=${encodeURIComponent(userId)}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  public async getBlockings(
    userId: string,
    camperId: string,
  ): Promise<BlockingResponse[]> {
    return this.request<BlockingResponse[]>(
      `/camper-blockings/camper/${encodeURIComponent(camperId)}?userId=${encodeURIComponent(userId)}`,
      { method: 'GET' }
    );
  }

  public async deleteBlocking(
    userId: string,
    id: string,
  ): Promise<void> {
    return this.request<void>(
      `/camper-blockings/${encodeURIComponent(id)}?userId=${encodeURIComponent(userId)}`,
      { method: 'DELETE' }
    );
  }
}
