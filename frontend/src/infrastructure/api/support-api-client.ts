import { BaseAPIClient } from './base-api-client';

export interface ContactRequestPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export class SupportAPIClient extends BaseAPIClient {
  async sendContact(data: ContactRequestPayload): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/support/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}
