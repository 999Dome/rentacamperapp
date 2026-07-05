import { createElement } from "../../../utils/createElement.ts";

/**
 * The initial skeleton markup shown by `CheckoutPage.tsx` while the user,
 * camper and price data are still being fetched.
 *
 * It renders the page title/subtitle, an (initially empty) countdown-timer
 * placeholder (`#countdown-timer-container`, filled in later by
 * `startCheckoutCountdownTimer`), and a loading spinner inside
 * `#checkout-content` (replaced once `renderContent` runs).
 *
 * @returns The page container element.
 */
export function CheckoutLoadingState() {
  return (
    <div className="container my-5 min-vh-80">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold custom-font-burbank text-white">Checkout</h1>
        <p className="text-white-50 fs-5">
          Fast geschafft! Überprüfe deine Daten und schließe die Buchung ab.
        </p>
        <div id="countdown-timer-container" className="mt-3"></div>
      </div>
      <div className="row g-5" id="checkout-content">
        <div className="col-12 text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  ) as HTMLElement;
}
