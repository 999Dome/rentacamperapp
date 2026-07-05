import { BaseAPIClient } from './base-api-client';

/** Payload for a user-submitted contact/support request. */
export interface ContactRequestPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * API client for the support/contact form.
 */
export class SupportAPIClient extends BaseAPIClient {
  /**
   * Sends a contact request to the support team.
   * @param data - Name, email, subject and message of the request.
   * @returns Whether the request was sent successfully.
   */
  async sendContact(data: ContactRequestPayload): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/support/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}
