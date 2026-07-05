import { createElement, Fragment } from '../../../utils/createElement.ts';

/**
 * Renders the booking card's call-to-action: the "Reservieren" button and
 * the disclaimer text below it.
 *
 * The button starts disabled (`BookingCard` enables it once a valid price
 * calculation succeeds) and is looked up afterwards via `#bookButton`, both
 * to attach its click handler and to insert an optional driver's-license
 * warning `<div>` directly before it.
 *
 * @returns A fragment containing the button and disclaimer paragraph.
 */
export function BookButton() {
  return (
    <Fragment>
      <button className="btn btn-lg w-100 mb-3 fw-bold custom-font-base fs-3 text-white book-button-bg letter-spacing-2" id="bookButton">
        Reservieren
      </button>
      <p className="text-center text-muted small mb-4">Das ist nur eine Anfrage. Dir wird noch nichts berechnet.</p>
    </Fragment>
  );
}
