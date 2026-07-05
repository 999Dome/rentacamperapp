import { createElement } from "../../../utils/createElement.ts";
import type { BookingResponse } from "../../../api/bookingsAPI.ts";

/** Props for {@link BookingPriceBreakdown}. */
interface BookingPriceBreakdownProps {
  /** The booking whose price breakdown should be shown. */
  booking: BookingResponse;
}

/**
 * Collapsible section listing how a booking's total price is made up:
 * the base rental price (base price minus addons), each booked addon (or a
 * placeholder "0.00 €" row if there are none), and the final total.
 *
 * Hidden by default (`d-none`); `BookingsTable.tsx`'s `toggleDetails`
 * function shows/hides it by looking up `#details-{booking.id}`, so that id
 * must stay exactly as-is.
 *
 * @param booking The booking whose price breakdown should be shown.
 * @returns The collapsible details `<div>` element.
 */
export function BookingPriceBreakdown({ booking }: BookingPriceBreakdownProps) {
  return (
    <div className="d-none border-top bg-light p-4" id={`details-${booking.id}`}>
      <div className="p-3 border rounded-3 bg-white shadow-sm fs-14px">
        <h6 className="fw-bold mb-3 text-dark">Aufschlüsselung des Gesamtbetrags:</h6>
        <ul className="list-group list-group-flush mb-0">
          <li className="list-group-item d-flex justify-content-between px-0 py-2 bg-transparent text-dark">
            <span>Mietpreis (inkl. Saisonzuschlag/Rabatt)</span>
            <span>{(booking.total_price - booking.addons_price).toFixed(2)} €</span>
          </li>
          {booking.addons_detail && booking.addons_detail.length > 0 ? (
            booking.addons_detail.map((add) => (
              <li className="list-group-item d-flex justify-content-between px-0 py-2 bg-transparent text-muted">
                <span>{add.name}</span>
                <span>+{add.price.toFixed(2)} €</span>
              </li>
            ))
          ) : (
            <li className="list-group-item d-flex justify-content-between px-0 py-2 bg-transparent text-muted">
              <span>Zusatzleistungen (Addons)</span>
              <span>0.00 €</span>
            </li>
          )}
          <li className="list-group-item d-flex justify-content-between px-0 py-2 bg-transparent fw-bold border-top mt-1 text-dark">
            <span>Gesamtsumme</span>
            <span>{booking.total_price.toFixed(2)} €</span>
          </li>
        </ul>
      </div>
    </div>
  ) as HTMLElement;
}
