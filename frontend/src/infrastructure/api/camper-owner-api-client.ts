import { BaseAPIClient } from './base-api-client';
import type { CamperOwner, CamperOwnerInsert } from '../../types/interface';

export class CamperOwnerAPIClient extends BaseAPIClient {
  async getByUserId(userId: string): Promise<CamperOwner[]> {
    return await this.request<CamperOwner[]>(`camper-owner/user/${userId}`);
  }

  async getByCamperId(camperId: string): Promise<CamperOwner> {
    return await this.request<CamperOwner>(`camper-owner/camper/${camperId}`);
  }

  async assignOwner(data: CamperOwnerInsert): Promise<CamperOwner> {
    return await this.request<CamperOwner>('camper-owner', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async removeOwner(camperId: string): Promise<void> {
    return await this.request<void>(`camper-owner/camper/${camperId}`, {
      method: 'DELETE',
    });
  }
}
