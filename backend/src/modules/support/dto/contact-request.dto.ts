/**
 * Shape of the JSON body a client sends to the "contact support" endpoint.
 * Used by {@link SupportController} and validated in {@link SupportService}.
 */
export interface ContactRequestDto {
  // Display name of the person submitting the contact form.
  name: string;
  // Sender's email address; also used as the reply-to on the outgoing mail.
  email: string;
  // Short subject line for the support request.
  subject: string;
  // Free-text message body (newlines are converted to <br/> before sending).
  message: string;
}
