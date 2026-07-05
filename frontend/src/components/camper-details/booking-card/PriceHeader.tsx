import { createElement } from '../../../utils/createElement.ts';

/**
 * Renders the price-per-night header shown at the top of the booking card
 * (e.g. "45 € / Nacht").
 *
 * @param pricePerNight The camper's price per night in Euro, already
 *   resolved by the caller (falls back to engine power or `0` upstream in
 *   `BookingCard`).
 * @returns The price header element.
 */
export function PriceHeader(pricePerNight: number) {
  return (
    <div className="mb-4 d-flex align-items-baseline gap-2">
      <span className="fs-1 fw-bold custom-font-base text-custom-light-blue lh-1">{pricePerNight} €</span>
      <span className="fs-5 text-muted lh-1">/ Nacht</span>
    </div>
  ) as HTMLElement;
}
