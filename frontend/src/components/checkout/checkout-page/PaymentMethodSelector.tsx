import { createElement } from "../../../utils/createElement.ts";

/**
 * "Zahlungsart" card on the checkout page's left column: the Stripe/PayPal
 * radio choice, plus the (initially hidden) `#paypal-buttons-container` div
 * that the PayPal SDK renders its Smart Buttons into once PayPal is selected.
 *
 * This component only renders the static markup. Wiring up the "change"
 * listener that reacts to the radio selection, and initializing the PayPal
 * buttons, is done by `CheckoutPage.tsx` (via `paypal-checkout.ts`) because
 * both need access to state (`confirmButton`, `checkoutTermsAccepted`) that
 * lives in the page shell.
 *
 * @returns The card element.
 */
export function PaymentMethodSelector() {
  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
      <div className="card-body p-4 p-md-5">
        <h4 className="fw-bold mb-4">Zahlungsart</h4>
        <div className="d-flex flex-column gap-3">
          <label className="border rounded-3 p-3 d-flex align-items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="payment"
              value="stripe"
              className="form-check-input mt-0 payment-method"
              defaultChecked
            />
            <div>
              <span className="fw-medium d-block">💳 Kreditkarte (Stripe)</span>
              <small className="text-muted">Sicher bezahlen mit Mastercard, Visa oder American Express</small>
            </div>
          </label>
          <label className="border rounded-3 p-3 d-flex align-items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="payment"
              value="paypal"
              className="form-check-input mt-0 payment-method"
            />
            <div>
              <span className="fw-medium d-block">🅿️ PayPal</span>
              <small className="text-muted">Schnell und sicher mit deinem PayPal Konto</small>
            </div>
          </label>
        </div>
        <div id="paypal-buttons-container" className="paypal-buttons-box"></div>
      </div>
    </div>
  ) as HTMLElement;
}
