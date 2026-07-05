import { createElement } from '../../../utils/createElement.ts';

/**
 * Renders the check-in/check-out date row at the top of the booking card's
 * date box.
 *
 * The outer `<div>` carries the `date-picker-wrapper` class, which
 * `BookingCard` looks up afterwards (`querySelector('.date-picker-wrapper')`)
 * and hands to flatpickr as the range picker's anchor element. The two inner
 * text elements (`#checkin-display` / `#checkout-display`) start out as
 * placeholders and get their text replaced by flatpickr's `onChange` handler
 * once dates are picked (see `booking-date-range-picker.ts`).
 *
 * @returns The date range display row element.
 */
export function DateRangeDisplay() {
  return (
    <div className="d-flex border-bottom border-dark-subtle date-picker-wrapper cursor-pointer">
      <div className="p-2 pt-1 w-50 border-end border-dark-subtle position-relative bg-white cursor-pointer">
        <label className="form-label mb-0 text-uppercase fw-bold text-dark fs-10px ps-4px pe-none">Abholdatum</label>
        <div id="checkin-display" className="fw-medium text-dark text-truncate ps-4px fs-15px min-h-22px">Datum auswählen</div>
      </div>
      <div className="p-2 pt-1 w-50 position-relative bg-white cursor-pointer">
        <label className="form-label mb-0 text-uppercase fw-bold text-dark fs-10px ps-4px pe-none">Rückgabedatum</label>
        <div id="checkout-display" className="fw-medium text-dark text-truncate ps-4px fs-15px min-h-22px">Datum auswählen</div>
      </div>
    </div>
  ) as HTMLElement;
}
