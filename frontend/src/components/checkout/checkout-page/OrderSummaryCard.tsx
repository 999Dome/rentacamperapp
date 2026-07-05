import { createElement } from "../../../utils/createElement.ts";
import type { MockCamper } from "../../../utils/mockData.ts";
import { PriceBreakdownList, type PriceBreakdownRow } from "../../common/PriceBreakdownList.tsx";
import { TripDatesBox } from "./TripDatesBox.tsx";
import { DepositBox } from "./DepositBox.tsx";
import { TermsCheckbox } from "./TermsCheckbox.tsx";
import type { PendingBookingData, PriceCalculationResult } from "./types.ts";

/** Props for {@link OrderSummaryCard}. */
interface OrderSummaryCardProps {
  /** The booked camper (image, name, manufacturer). */
  camper: MockCamper;
  /** The pending booking (used for the pickup/return dates). */
  pendingData: PendingBookingData;
  /** The calculated price (used for the total and deposit amount). */
  priceData: PriceCalculationResult;
  /** Pre-built receipt rows (base price, surcharges, discounts, add-ons, ...). */
  receiptRows: PriceBreakdownRow[];
  /**
   * The single confirm-payment button built by `CheckoutPage.tsx`. It's
   * embedded as-is (not recreated here) so the same `HTMLButtonElement`
   * instance is shared with the Stripe/PayPal flows that mutate it.
   */
  confirmButton: HTMLButtonElement;
  /** Called whenever the terms checkbox's checked state changes. */
  onTermsChange: (accepted: boolean) => void;
}

/**
 * Sticky order-summary card on the checkout page's right column: camper
 * image/name, trip dates, price breakdown, total, deposit note, terms
 * checkbox, and finally the confirm-payment button.
 *
 * @param props See {@link OrderSummaryCardProps}.
 * @returns The order-summary card element.
 */
export function OrderSummaryCard({
  camper,
  pendingData,
  priceData,
  receiptRows,
  confirmButton,
  onTermsChange,
}: OrderSummaryCardProps) {
  return (
    <div className="card border-0 shadow-lg rounded-4 overflow-hidden position-sticky bg-beige booking-card-sticky">
      <img
        src={camper.image_url || "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7"}
        alt={camper.name || "Camper"}
        className="card-img-top checkout-summary-img"
      />
      <div className="card-body p-4 p-md-5">
        <h4 className="fw-bold custom-font-base mb-1">{camper.name}</h4>
        <p className="text-muted small mb-4">{camper.manufacturer}</p>

        <TripDatesBox startDate={pendingData.startDate} endDate={pendingData.endDate} />

        <h6 className="fw-bold text-uppercase small text-muted mb-3">
          Preisdetails
        </h6>
        <ul className="list-group list-group-flush fs-6 mb-3">
          {PriceBreakdownList({ rows: receiptRows })}
        </ul>

        <hr className="my-3" />

        <div className="d-flex justify-content-between align-items-center fw-bold fs-3 mb-2">
          <span>Gesamt</span>
          <span className="blue">{priceData.totalAmount.toFixed(2)} €</span>
        </div>

        <DepositBox depositAmount={priceData.depositAmount} />

        <TermsCheckbox onChange={onTermsChange} />

        {confirmButton}
      </div>
    </div>
  ) as HTMLElement;
}
