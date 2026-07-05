import { createElement, Fragment } from "../../utils/createElement.ts";

/**
 * A single row in a price breakdown list, e.g. "Reinigungsgebühr — 12.00 €".
 */
export interface PriceBreakdownRow {
  /** Text shown on the left side of the row (what the price is for). */
  label: string;
  /** Text shown on the right side of the row (the formatted amount, e.g. `"12.00 €"`). */
  value: string;
  /**
   * Bootstrap text-color utility class(es) applied to the row, e.g. `"text-danger"`
   * for a surcharge or `"text-success"` for a discount.
   * Defaults to `"text-muted"` when not given.
   */
  textClass?: string;
}

/** Props for {@link PriceBreakdownList}. */
interface PriceBreakdownListProps {
  /** The rows to render, in order. */
  rows: PriceBreakdownRow[];
}

/**
 * Renders a list of price-breakdown rows (`<li>` elements only — no wrapping
 * `<ul>`), used by both the booking widget's live price preview
 * (`BookingCard.tsx`) and the checkout page's receipt (`CheckoutPage.tsx`).
 *
 * It intentionally does NOT render the surrounding `<ul>` itself, because the
 * two call sites manage their `<ul>` wrapper differently: `BookingCard.tsx`
 * clears and re-fills an existing `<ul id="receipt-list">` each time the
 * price is recalculated, while `CheckoutPage.tsx` builds the full rows array
 * once and renders a brand new `<ul>` around it. Returning just the `<li>`
 * rows (as a `DocumentFragment`) lets both keep their own `<ul>`.
 *
 * @param rows The rows to render.
 * @returns A `DocumentFragment` containing one `<li>` per row.
 */
export function PriceBreakdownList({ rows }: PriceBreakdownListProps) {
  return (
    <Fragment>
      {rows.map(({ label, value, textClass = "text-muted" }) => (
        <li
          className={`list-group-item d-flex justify-content-between align-items-center px-0 py-2 border-0 bg-transparent ${textClass}`}
        >
          <span>{label}</span>
          <span>{value}</span>
        </li>
      ))}
    </Fragment>
  );
}
