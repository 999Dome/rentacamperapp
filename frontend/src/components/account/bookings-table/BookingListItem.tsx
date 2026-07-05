import { createElement } from "../../../utils/createElement.ts";
import type { BookingResponse } from "../../../api/bookingsAPI.ts";
import { BookingPriceBreakdown } from "./BookingPriceBreakdown.tsx";

/** Props for {@link BookingListItem}. */
interface BookingListItemProps {
  /** The booking to display. */
  booking: BookingResponse;
  /** Called when the "Preisdetails anzeigen" toggle button is clicked. */
  onToggleDetails: (e: Event, booking: BookingResponse) => void;
  /** Called when the "Buchung stornieren" button is clicked (only shown for "confirmed" bookings). */
  onCancelClick: (e: Event, booking: BookingResponse) => void;
}

/**
 * A single booking card in the account page's bookings list. Shows the
 * booking id and status badge in the header, the camper name/dates/pickup
 * and return locations/total price in the body, and a footer with a
 * "show details" toggle plus a conditional "cancel booking" button (only
 * for bookings with status "confirmed"). The collapsible price breakdown
 * itself is rendered by {@link BookingPriceBreakdown}.
 *
 * The toggle button's chevron icon (`#chevron-{booking.id}`) and the
 * details section it controls (`#details-{booking.id}`, inside
 * `BookingPriceBreakdown`) keep their ids because `BookingsTable.tsx`'s
 * `toggleDetails` function looks them up by id.
 *
 * @param booking The booking to display.
 * @param onToggleDetails Click handler for the details toggle button.
 * @param onCancelClick Click handler for the cancel-booking button.
 * @returns The booking card element.
 */
export function BookingListItem({ booking, onToggleDetails, onCancelClick }: BookingListItemProps) {
  let badgeClass = "bg-warning-subtle text-warning";
  let badgeText = "Ausstehend";

  if (booking.status === "confirmed") {
    badgeClass = "bg-primary-subtle text-primary";
    badgeText = "Bestätigt";
  } else if (booking.status === "completed") {
    badgeClass = "bg-success-subtle text-success";
    badgeText = "Abgeschlossen";
  } else if (booking.status === "cancelled") {
    badgeClass = "bg-danger-subtle text-danger";
    badgeText = "Storniert";
  }

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-3 bg-white transition-transform">
      {/* Card Header */}
      <div className="card-header border-0 bg-light d-flex justify-content-between align-items-center px-4 py-3">
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small">Buchungs-ID:</span>
          <span className="fw-bold text-dark small">#{booking.id.slice(0, 8)}</span>
        </div>
        <span className={`badge rounded-pill px-3 py-1 fs-12px ${badgeClass}`}>{badgeText}</span>
      </div>

      {/* Card Body */}
      <div className="card-body p-4">
        <div className="row g-3 align-items-center">

          {/* Camper Details */}
          <div className="col-12 col-md-4">
            <span className="text-muted small text-uppercase d-block mb-1 fs-11px">Fahrzeug</span>
            <h4 className="fw-bold text-dark mb-0 custom-font-base">{booking.camper_name}</h4>
          </div>

          {/* Dates & Locations */}
          <div className="col-12 col-md-5">
            <span className="text-muted small text-uppercase d-block mb-1 fs-11px">Zeitraum & Orte</span>
            <div className="d-flex align-items-center gap-2 fw-bold text-dark mb-2 fs-15px">
              <i className="bi bi-calendar3 text-custom-light-blue"></i>
              <span>{booking.start_date}</span>
              <i className="bi bi-arrow-right text-muted"></i>
              <span>{booking.end_date}</span>
            </div>

            {booking.pickup_location && (
              <div className="small text-muted d-flex align-items-start gap-1 mb-1 fs-12px">
                <i className="bi bi-geo-alt-fill text-custom-light-blue mt-1 fs-12px"></i>
                <div><strong>Abholung:</strong> {booking.pickup_location.name || `${booking.pickup_location.city} Station`} ({booking.pickup_location.street}, {booking.pickup_location.city})</div>
              </div>
            )}
            {booking.return_location && (
              <div className="small text-muted d-flex align-items-start gap-1 fs-12px">
                <i className="bi bi-geo-alt text-custom-light-blue mt-1 fs-12px"></i>
                <div><strong>Rückgabe:</strong> {booking.return_location.name || `${booking.return_location.city} Station`} ({booking.return_location.street}, {booking.return_location.city})</div>
              </div>
            )}
          </div>

          {/* Total Price */}
          <div className="col-12 col-md-3 text-md-end">
            <span className="text-muted small text-uppercase d-block mb-1 fs-11px">Gesamtpreis</span>
            <h3 className="fw-bold text-dark mb-0">{booking.total_price.toFixed(2)} €</h3>
          </div>

        </div>
      </div>

      {/* Card Footer */}
      <div className="card-footer bg-white border-0 px-4 py-3 d-flex justify-content-between align-items-center border-top">
        <button className="btn btn-sm btn-link text-decoration-none p-0 text-muted fw-bold d-flex align-items-center gap-1 fs-13px" onclick={(e: Event) => onToggleDetails(e, booking)}>
          <span>Preisdetails anzeigen</span>
          <i className="bi bi-chevron-down" id={`chevron-${booking.id}`}></i>
        </button>

        <div className="d-flex gap-2">
          {booking.status === "confirmed" && (
            <button className="btn btn-sm btn-outline-danger rounded-pill px-3 fs-12px" onclick={(e: Event) => onCancelClick(e, booking)}>
              Buchung stornieren
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Details */}
      <BookingPriceBreakdown booking={booking} />

    </div>
  ) as HTMLElement;
}
