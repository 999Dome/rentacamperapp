import { createElement } from "../../../utils/createElement.ts";

/**
 * Shared error-display helper for the checkout page's payment flows
 * (Stripe's confirm-button click handler and PayPal's `onApprove` handler).
 * Both flows fail in the same way — an API call throws — and both need to
 * show the same kind of inline error and reset the confirm button, so that
 * logic lives here once instead of being duplicated in each flow.
 */

/**
 * Tries to pull a user-friendly message out of an error thrown by a booking
 * API call. The backend returns HTTP 400 errors as a JSON body with a
 * `message` field (sometimes an array of validation messages); if that
 * pattern is found in the error's text, it's used instead of the generic
 * `defaultMessage`.
 *
 * @param err The thrown error (any shape — it's normalized to a string first).
 * @param defaultMessage Fallback message used when no structured message can be extracted.
 * @returns The message to show to the user.
 */
function extractErrorMessage(err: unknown, defaultMessage: string): string {
  const errorMsg = err instanceof Error ? err.message : String(err);
  if (!errorMsg.includes("400")) return defaultMessage;

  try {
    const match = errorMsg.match(/\{.*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]) as { message?: string | string[] };
      if (parsed.message) {
        return Array.isArray(parsed.message) ? parsed.message.join(", ") : parsed.message;
      }
    }
  } catch {
    // Ignore JSON parse errors and fall back to defaultMessage below.
  }

  return defaultMessage;
}

/**
 * Shows (or replaces) an inline `#booking-error-alert` danger alert right
 * before the confirm button, logs the underlying error, and resets the
 * confirm button back to its clickable "Zahlungspflichtig buchen" state so
 * the user can retry.
 *
 * @param confirmButton The confirm-payment button; the alert is inserted right before it, and it is re-enabled.
 * @param err The error that was thrown by the failed payment/booking call.
 * @param defaultMessage Fallback message shown when the error has no structured message.
 */
export function showBookingErrorAlert(confirmButton: HTMLButtonElement, err: unknown, defaultMessage: string): void {
  console.error(err);
  const displayMsg = extractErrorMessage(err, defaultMessage);

  const existingAlert = document.getElementById("booking-error-alert");
  if (existingAlert) existingAlert.remove();

  const errorAlert = (
    <div id="booking-error-alert" className="alert alert-danger mt-3">
      <i className="bi bi-exclamation-triangle-fill me-2"></i>{displayMsg}
    </div>
  ) as HTMLElement;

  confirmButton.parentElement?.insertBefore(errorAlert, confirmButton);

  confirmButton.disabled = false;
  confirmButton.textContent = "Zahlungspflichtig buchen";
}
