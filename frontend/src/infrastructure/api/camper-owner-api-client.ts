import { BaseAPIClient } from './base-api-client';
import type { CamperOwner, CamperOwnerInsert } from '../../types/interface';

/**
 * API client for managing the ownership link between a camper and the
 * user (private owner) who provides it.
 */
export class CamperOwnerAPIClient extends BaseAPIClient {
  /**
   * Fetches all camper-ownership records belonging to a user.
   * @param userId - ID of the user (owner) to look up.
   * @returns The campers owned by that user.
   */
  async getByUserId(userId: string): Promise<CamperOwner[]> {
    return await this.request<CamperOwner[]>(`camper-owner/user/${userId}`);
  }

  /**
   * Fetches the ownership record for a specific camper.
   * @param camperId - ID of the camper to look up.
   * @returns The ownership record for that camper.
   */
  async getByCamperId(camperId: string): Promise<CamperOwner> {
    return await this.request<CamperOwner>(`camper-owner/camper/${camperId}`);
  }

  /**
   * Assigns an owner to a camper, creating a new ownership record.
   * @param data - The camper/owner pair (and any other insert fields) to create.
   * @returns The created ownership record.
   */
  async assignOwner(data: CamperOwnerInsert): Promise<CamperOwner> {
    return await this.request<CamperOwner>('camper-owner', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Removes the ownership record for a camper.
   * @param camperId - ID of the camper whose ownership link should be removed.
   */
  async removeOwner(camperId: string): Promise<void> {
    return await this.request<void>(`camper-owner/camper/${camperId}`, {
      method: 'DELETE',
    });
  }
}
