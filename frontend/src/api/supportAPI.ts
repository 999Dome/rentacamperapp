/**
 * API function for sending a message through the "contact support" form.
 */

import { SupportAPIClient } from '../infrastructure/api/support-api-client';
import type { ContactRequestPayload } from '../infrastructure/api/support-api-client';

const client = new SupportAPIClient();

/**
 * Sends a contact/support request email.
 *
 * @param data Sender's name, email, subject and message.
 * @returns Whether the email was sent successfully.
 */
export async function sendContactEmail(data: ContactRequestPayload): Promise<{ success: boolean }> {
  return await client.sendContact(data);
}
