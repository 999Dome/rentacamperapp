import { SupportAPIClient } from '../infrastructure/api/support-api-client';
import type { ContactRequestPayload } from '../infrastructure/api/support-api-client';

const client = new SupportAPIClient();

export async function sendContactEmail(data: ContactRequestPayload): Promise<{ success: boolean }> {
  return await client.sendContact(data);
}
