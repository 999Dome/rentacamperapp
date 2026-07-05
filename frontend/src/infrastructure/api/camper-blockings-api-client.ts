import { BaseAPIClient } from './base-api-client';

/**
 * Payload for blocking a camper's availability for a date range,
 * e.g. so it can't be booked while it's in maintenance.
 */
export interface CreateBlockingRequest {
  camper_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
}

/** A blocking record as stored/returned by the backend. */
export interface BlockingResponse {
  id: string;
  camper_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
}

/**
 * API client for managing camper "blockings" - date ranges during which
 * a camper is unavailable for booking (e.g. maintenance, owner use).
 *
 * This class is a singleton: use `getInstance()` instead of `new`.
 */
export class CamperBlockingsApiClient extends BaseAPIClient {
  private static instance: CamperBlockingsApiClient;

  private constructor() {
    super();
  }

  /**
   * Returns the shared singleton instance, creating it on first call.
   */
  public static getInstance(): CamperBlockingsApiClient {
    if (!CamperBlockingsApiClient.instance) {
      CamperBlockingsApiClient.instance = new CamperBlockingsApiClient();
    }
    return CamperBlockingsApiClient.instance;
  }

  /**
   * Creates a new blocking for a camper.
   * @param userId - ID of the user performing the request (sent for authorization).
   * @param data - Camper, date range, and optional reason for the blocking.
   * @returns The created blocking record.
   */
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

  /**
   * Fetches all blockings for a specific camper.
   * @param userId - ID of the user performing the request (sent for authorization).
   * @param camperId - ID of the camper whose blockings should be fetched.
   * @returns The list of blockings for that camper.
   */
  public async getBlockings(
    userId: string,
    camperId: string,
  ): Promise<BlockingResponse[]> {
    return this.request<BlockingResponse[]>(
      `/camper-blockings/camper/${encodeURIComponent(camperId)}?userId=${encodeURIComponent(userId)}`,
      { method: 'GET' }
    );
  }

  /**
   * Deletes an existing blocking.
   * @param userId - ID of the user performing the request (sent for authorization).
   * @param id - ID of the blocking to delete.
   */
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
