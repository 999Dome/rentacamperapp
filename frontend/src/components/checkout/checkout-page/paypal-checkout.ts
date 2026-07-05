import { createPayPalOrder, capturePayPalOrder } from "../../../api/paymentsAPI.ts";
import { updateBookingStatus } from "../../../api/bookingsAPI.ts";
import type { MockCamper } from "../../../utils/mockData.ts";
import type { PendingBookingData, PriceCalculationResult } from "./types.ts";
import { showBookingErrorAlert } from "./booking-error.tsx";

/** Options for {@link initPayPalButtons}. */
export interface PayPalCheckoutOptions {
  /** The camper being booked (only `id` is used, for the order amount lookup). */
  camper: MockCamper;
  /** The calculated price for the booking; `totalAmount` is what's charged. */
  priceData: PriceCalculationResult;
  /** The pending (not-yet-paid) booking this checkout is for. */
  pendingData: PendingBookingData;
  /** The single confirm-payment button shared with the Stripe flow; PayPal's callbacks mutate it (disabled/spinner text) instead of creating their own. */
  confirmButton: HTMLButtonElement;
  /** Getter for whether the user has accepted the terms checkbox — read live at click time so PayPal always sees the current value, not a stale snapshot from when `initPayPalButtons` was called. */
  getTermsAccepted: () => boolean;
}

/**
 * Dynamically loads the PayPal SDK `<script>` and renders the PayPal Smart
 * Buttons into `#paypal-buttons-container`, wiring up the full order
 * lifecycle:
 * - `onClick`: blocks the flow with an alert if the terms checkbox isn't
 *   checked (checked live via `getTermsAccepted`).
 * - `createOrder`: creates the PayPal order via the backend.
 * - `onApprove`: captures the order, marks the booking confirmed, and
 *   redirects to the success page; on failure shows an inline error.
 * - `onError`: shows an alert and re-enables the confirm button.
 *
 * Is a no-op if `#paypal-buttons-container` is missing, or already has
 * buttons rendered into it (`innerHTML !== ""`), so it's safe to call every
 * time the user switches the payment method to PayPal.
 *
 * @param options See {@link PayPalCheckoutOptions}.
 */
export async function initPayPalButtons(options: PayPalCheckoutOptions): Promise<void> {
  const { camper, priceData, pendingData, confirmButton, getTermsAccepted } = options;

  const container = document.getElementById("paypal-buttons-container");
  if (!container || container.innerHTML !== "") return;

  try {
    const paypalScript = document.createElement("script");
    paypalScript.src =
      "https://www.paypal.com/sdk/js?client-id=" +
      (import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb") +
      "&currency=EUR";
    paypalScript.async = true;
    paypalScript.onload = () => {
      const paypalWindow = window as unknown as {
        paypal?: {
          Buttons: (options: {
            onClick?: (data: unknown, actions: { resolve: () => Promise<void>; reject: () => Promise<void> }) => void | Promise<void>;
            createOrder: () => Promise<string>;
            onApprove: (data: { orderID: string }) => Promise<void>;
            onError: () => void;
          }) => {
            render: (container: HTMLElement | null) => void;
          };
        };
      };

      if (paypalWindow.paypal) {
        paypalWindow.paypal
          .Buttons({
            onClick: (_data: unknown, actions: { resolve: () => Promise<void>; reject: () => Promise<void> }) => {
              if (!getTermsAccepted()) {
                alert("Bitte akzeptieren Sie die AGB und Datenschutzerklärung, um fortzufahren.");
                return actions.reject();
              }
              return actions.resolve();
            },
            createOrder: async () => {
              const response = await createPayPalOrder(
                camper.id,
                priceData.totalAmount,
                pendingData.apiStartDate,
                pendingData.apiEndDate
              );
              return response.id;
            },
            onApprove: async (data: { orderID: string }) => {
              try {
                confirmButton.disabled = true;
                confirmButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Zahlung wird verarbeitet...';

                await capturePayPalOrder(data.orderID);

                await updateBookingStatus(pendingData.bookingId, "confirmed");

                alert("Zahlung erfolgreich! Buchung abgeschlossen.");
                sessionStorage.removeItem("pendingCheckout");
                window.location.href = `/pages/checkout-success/?bookingId=${pendingData.bookingId}&camper=${pendingData.camperId}`;
              } catch (err) {
                showBookingErrorAlert(confirmButton, err, "Fehler bei der Zahlungsbestätigung. Bitte versuchen Sie es erneut.");
              }
            },
            onError: () => {
              alert("Fehler bei der PayPal-Zahlung. Bitte versuchen Sie es erneut.");
              confirmButton.disabled = false;
              confirmButton.textContent = "Zahlungspflichtig buchen";
            },
          })
          .render(container);
      }
    };
    document.head.appendChild(paypalScript);
  } catch (err) {
    console.error("Error initializing PayPal buttons:", err);
  }
}
