import { createElement } from "../../utils/createElement.ts";
import { fetchCurrentUser } from "../../auth/auth.ts";
import { fetchBookingsByRenter, cancelBooking } from "../../api/bookingsAPI.ts";
import type { BookingResponse } from "../../api/bookingsAPI.ts";

export function BookingsTable() {
  const SkeletonBookingCard = () => (
    <div className="card border-0 shadow-sm rounded-4 p-4 mb-3 bg-white placeholder-glow">
      <div className="d-flex justify-content-between mb-3">
        <span className="placeholder col-3 rounded" style={{ height: "16px" }}></span>
        <span className="placeholder col-2 rounded-pill" style={{ height: "24px" }}></span>
      </div>
      <div className="row g-3">
        <div className="col-12 col-md-4">
          <span className="placeholder col-8 mb-2 d-block rounded" style={{ height: "14px" }}></span>
          <span className="placeholder col-10 rounded" style={{ height: "24px" }}></span>
        </div>
        <div className="col-12 col-md-5">
          <span className="placeholder col-6 mb-2 d-block rounded" style={{ height: "14px" }}></span>
          <span className="placeholder col-8 rounded" style={{ height: "20px" }}></span>
        </div>
        <div className="col-12 col-md-3 text-md-end">
          <span className="placeholder col-6 mb-2 d-block rounded" style={{ height: "14px" }}></span>
          <span className="placeholder col-8 rounded" style={{ height: "24px" }}></span>
        </div>
      </div>
    </div>
  ) as HTMLElement;

  const container = (
    <div className="p-0">
      <h3 className="fw-bold mb-4 text-white custom-font-burbank" style={{ letterSpacing: "1px" }}>Meine Buchungen</h3>
      <div id="bookings-list" className="d-flex flex-column gap-3">
        {Array.from({ length: 3 }, () => SkeletonBookingCard())}
      </div>
    </div>
  ) as HTMLElement;

  let bookingToCancel: BookingResponse | null = null;

  const modalHTML = (
    <div className="modal" id="cancelBookingModal" tabIndex={-1} aria-hidden="true" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title text-danger"><i className="bi bi-exclamation-triangle-fill me-2"></i>Buchung stornieren</h5>
            <button type="button" className="btn-close" aria-label="Schließen" onclick={() => closeCancelModal()}></button>
          </div>
          <div className="modal-body text-dark">
            <p>Möchtest du diese Buchung wirklich unwiderruflich stornieren?</p>
            <p className="small text-muted">Es wird automatisch ein Stornierungsbeleg generiert und an deine E-Mail-Adresse gesendet.</p>
            <div id="cancel-error" className="text-danger small d-none mt-2"></div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onclick={() => closeCancelModal()}>Abbrechen</button>
            <button type="button" className="btn btn-danger" id="btn-confirm-cancel" onclick={(e: Event) => handleCancelConfirm(e)}>Stornieren</button>
          </div>
        </div>
      </div>
    </div>
  ) as HTMLElement;

  container.appendChild(modalHTML);

  const showCancelModal = (e: Event, booking: BookingResponse) => {
    e.preventDefault();
    bookingToCancel = booking;
    modalHTML.classList.add('show', 'd-block');
    const errorEl = modalHTML.querySelector('#cancel-error') as HTMLElement;
    errorEl.classList.add('d-none');
    errorEl.textContent = '';
  };

  const closeCancelModal = () => {
    bookingToCancel = null;
    modalHTML.classList.remove('show', 'd-block');
    const btnConfirm = modalHTML.querySelector('#btn-confirm-cancel') as HTMLButtonElement;
    btnConfirm.disabled = false;
    btnConfirm.innerHTML = 'Stornieren';
  };

  const handleCancelConfirm = async (e: Event) => {
    e.preventDefault();
    if (!bookingToCancel) return;

    const btn = e.target as HTMLButtonElement;
    const originalText = btn.innerHTML;
    const errorEl = modalHTML.querySelector('#cancel-error') as HTMLElement;

    try {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Bitte warten...';
      errorEl.classList.add('d-none');

      const user = await fetchCurrentUser();
      if (!user || !user.id) throw new Error("Not logged in");

      await cancelBooking(bookingToCancel.id, user.id as string);
      
      closeCancelModal();
      await loadBookings(); // Reload to update status
    } catch (err) {
      console.error("Cancel failed", err);
      errorEl.textContent = err instanceof Error ? err.message : "Stornierung fehlgeschlagen.";
      errorEl.classList.remove('d-none');
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  };

  const renderTable = (bookings: BookingResponse[]) => {
    const listContainer = container.querySelector("#bookings-list") as HTMLElement;
    listContainer.innerHTML = "";

    if (bookings.length === 0) {
      listContainer.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <i class="bi bi-calendar-x fs-1 text-muted mb-3 d-block"></i>
          <span class="text-muted fs-5">Du hast noch keine Buchungen vorgenommen.</span>
        </div>
      `;
      return;
    }

    bookings.forEach((booking) => {
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

      const cardEl = (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-3 bg-white" style={{ transition: "transform 0.2s ease" }}>
          {/* Card Header */}
          <div className="card-header border-0 bg-light d-flex justify-content-between align-items-center px-4 py-3">
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small">Buchungs-ID:</span>
              <span className="fw-bold text-dark small">#{booking.id.slice(0, 8)}</span>
            </div>
            <span className={`badge rounded-pill px-3 py-1 ${badgeClass}`} style={{ fontSize: "12px" }}>{badgeText}</span>
          </div>

          {/* Card Body */}
          <div className="card-body p-4">
            <div className="row g-3 align-items-center">
              
              {/* Camper Details */}
              <div className="col-12 col-md-4">
                <span className="text-muted small text-uppercase d-block mb-1" style={{ fontSize: "11px" }}>Fahrzeug</span>
                <h4 className="fw-bold text-dark mb-0 custom-font-base">{booking.camper_name}</h4>
              </div>

              {/* Dates & Locations */}
              <div className="col-12 col-md-5">
                <span className="text-muted small text-uppercase d-block mb-1" style={{ fontSize: "11px" }}>Zeitraum & Orte</span>
                <div className="d-flex align-items-center gap-2 fw-bold text-dark mb-2" style={{ fontSize: "15px" }}>
                  <i className="bi bi-calendar3 text-custom-light-blue"></i>
                  <span>{booking.start_date}</span>
                  <i className="bi bi-arrow-right text-muted"></i>
                  <span>{booking.end_date}</span>
                </div>
                
                {booking.pickup_location && (
                  <div className="small text-muted d-flex align-items-start gap-1 mb-1" style={{ fontSize: "12px" }}>
                    <i className="bi bi-geo-alt-fill text-custom-light-blue mt-1" style={{ fontSize: "12px" }}></i>
                    <div><strong>Abholung:</strong> {booking.pickup_location.name || `${booking.pickup_location.city} Station`} ({booking.pickup_location.street}, {booking.pickup_location.city})</div>
                  </div>
                )}
                {booking.return_location && (
                  <div className="small text-muted d-flex align-items-start gap-1" style={{ fontSize: "12px" }}>
                    <i className="bi bi-geo-alt text-custom-light-blue mt-1" style={{ fontSize: "12px" }}></i>
                    <div><strong>Rückgabe:</strong> {booking.return_location.name || `${booking.return_location.city} Station`} ({booking.return_location.street}, {booking.return_location.city})</div>
                  </div>
                )}
              </div>

              {/* Total Price */}
              <div className="col-12 col-md-3 text-md-end">
                <span className="text-muted small text-uppercase d-block mb-1" style={{ fontSize: "11px" }}>Gesamtpreis</span>
                <h3 className="fw-bold text-dark mb-0">{booking.total_price.toFixed(2)} €</h3>
              </div>

            </div>
          </div>

          {/* Card Footer */}
          <div className="card-footer bg-white border-0 px-4 py-3 d-flex justify-content-between align-items-center border-top">
            <button className="btn btn-sm btn-link text-decoration-none p-0 text-muted fw-bold d-flex align-items-center gap-1" onclick={(e: Event) => toggleDetails(e, booking)} style={{ fontSize: "13px" }}>
              <span>Preisdetails anzeigen</span>
              <i className="bi bi-chevron-down" id={`chevron-${booking.id}`}></i>
            </button>
            
            <div className="d-flex gap-2">
              {booking.status === "confirmed" && (
                <button className="btn btn-sm btn-outline-danger rounded-pill px-3" onclick={(e: Event) => showCancelModal(e, booking)} style={{ fontSize: "12px" }}>
                  Buchung stornieren
                </button>
              )}
            </div>
          </div>

          {/* Collapsible Details */}
          <div className="d-none border-top bg-light p-4" id={`details-${booking.id}`}>
            <div className="p-3 border rounded-3 bg-white shadow-sm" style={{ fontSize: "14px" }}>
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

        </div>
      ) as HTMLElement;

      listContainer.appendChild(cardEl);
    });
  };

  const toggleDetails = (e: Event, booking: BookingResponse) => {
    const btn = e.currentTarget as HTMLButtonElement;
    const detailRow = container.querySelector(`#details-${booking.id}`) as HTMLElement;
    const chevron = btn.querySelector("i") as HTMLElement;
    
    if (detailRow.classList.contains("d-none")) {
      detailRow.classList.remove("d-none");
      if (chevron) {
        chevron.classList.remove("bi-chevron-down");
        chevron.classList.add("bi-chevron-up");
      }
    } else {
      detailRow.classList.add("d-none");
      if (chevron) {
        chevron.classList.remove("bi-chevron-up");
        chevron.classList.add("bi-chevron-down");
      }
    }
  };

  const loadBookings = async () => {
    try {
      const user = await fetchCurrentUser();
      if (!user) return;
      const bookings = await fetchBookingsByRenter(user.id as string);
      renderTable(bookings);
    } catch (err) {
      console.error(err);
      const listContainer = container.querySelector("#bookings-list") as HTMLElement;
      listContainer.innerHTML = `
        <div class="alert alert-danger rounded-4 p-4 text-center">
          <i class="bi bi-exclamation-octagon fs-2 d-block mb-2"></i>
          Fehler beim Laden der Buchungen.
        </div>
      `;
    }
  };

  loadBookings();

  return container;
}
