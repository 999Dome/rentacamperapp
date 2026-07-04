import { createElement } from "../../utils/createElement.ts";
import { fetchCurrentUser } from "../../auth/auth.ts";
import { fetchBookingsByRenter, cancelBooking } from "../../api/bookingsAPI.ts";
import type { BookingResponse } from "../../api/bookingsAPI.ts";
import { SkeletonTableRow } from "../common/SkeletonTableRow.tsx";

export function BookingsTable() {
  const container = (
    <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-beige">
      <h3 className="fw-bold mb-4 text-dark custom-font-base">Meine Buchungen</h3>
      <div className="table-responsive">
        <table className="table align-middle">
          <thead className="table-light">
            <tr>
              <th>Fahrzeug</th>
              <th>Zeitraum & Orte</th>
              <th>Status</th>
              <th>Gesamtpreis</th>
              <th className="text-end">Preisdetails</th>
            </tr>
          </thead>
          <tbody id="bookings-tbody">
            {Array.from({ length: 3 }, () => SkeletonTableRow(5))}
          </tbody>
        </table>
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
          <div className="modal-body">
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

      await cancelBooking(bookingToCancel.id, user.id);
      
      closeCancelModal();
      await loadBookings(); // Reload to update status and hide button
    } catch (err) {
      console.error("Cancel failed", err);
      errorEl.textContent = err instanceof Error ? err.message : "Stornierung fehlgeschlagen.";
      errorEl.classList.remove('d-none');
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  };


  const renderTable = (bookings: BookingResponse[]) => {
    const tbody = container.querySelector("#bookings-tbody") as HTMLElement;
    tbody.innerHTML = "";

    if (bookings.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted py-4">Du hast noch keine Buchungen vorgenommen.</td>
        </tr>
      `;
      return;
    }

    bookings.forEach((booking) => {
      const row = document.createElement("tr");

      row.appendChild(
        <td>
          <span className="fw-bold text-dark">{booking.camper_name}</span>
        </td>
      );

      row.appendChild(
        <td>
          <div className="fw-medium mb-1">{booking.start_date} <i className="bi bi-arrow-right mx-1 text-muted"></i> {booking.end_date}</div>
          {booking.pickup_location && (
            <div className="small text-muted mb-1">
              <i className="bi bi-geo-alt-fill text-primary me-1"></i>
              <strong>Abholung:</strong> {booking.pickup_location.name} ({booking.pickup_location.street}, {booking.pickup_location.city})
            </div>
          )}
          {booking.return_location && (
            <div className="small text-muted">
              <i className="bi bi-geo-alt me-1"></i>
              <strong>Rückgabe:</strong> {booking.return_location.name} ({booking.return_location.street}, {booking.return_location.city})
            </div>
          )}
        </td>
      );

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

      row.appendChild(
        <td>
          <span className={`badge rounded-pill px-3 py-1 ${badgeClass}`}>{badgeText}</span>
        </td>
      );

      row.appendChild(
        <td>
          <span className="fw-bold text-dark">{booking.total_price.toFixed(2)} €</span>
        </td>
      );

      const actionsTd = (<td className="text-end"></td>) as HTMLElement;

      if (booking.status === "confirmed") {
        const cancelBtn = (
          <button className="btn btn-sm btn-outline-danger rounded-pill px-3 me-2" onclick={(e: Event) => showCancelModal(e, booking)}>
            Buchung stornieren
          </button>
        ) as HTMLElement;
        actionsTd.appendChild(cancelBtn);
      }

      const detailsBtn = (
        <button className="btn btn-sm btn-outline-secondary rounded-pill px-3" onclick={(e: Event) => toggleDetails(e, booking)}>
          Details
        </button>
      ) as HTMLElement;
      actionsTd.appendChild(detailsBtn);

      row.appendChild(actionsTd);

      tbody.appendChild(row);

      const detailsRow = (
        <tr className="d-none bg-light" id={`details-${booking.id}`}>
          <td colspan={5} className="p-3">
            <div className="p-3 border rounded-3 bg-white shadow-sm" style={{ fontSize: "14px" }}>
              <h6 className="fw-bold mb-2">Aufschlüsselung des Gesamtbetrags:</h6>
              <ul className="list-group list-group-flush mb-0">
                <li className="list-group-item d-flex justify-content-between px-0 py-1 bg-transparent">
                  <span>Mietpreis (inkl. Saisonzuschlag/Rabatt)</span>
                  <span>{(booking.total_price - booking.addons_price).toFixed(2)} €</span>
                </li>
                {booking.addons_detail && booking.addons_detail.length > 0 ? (
                  booking.addons_detail.map((add) => (
                    <li className="list-group-item d-flex justify-content-between px-0 py-1 bg-transparent text-muted">
                      <span>{add.name}</span>
                      <span>+{add.price.toFixed(2)} €</span>
                    </li>
                  ))
                ) : (
                  <li className="list-group-item d-flex justify-content-between px-0 py-1 bg-transparent text-muted">
                    <span>Zusatzleistungen (Addons)</span>
                    <span>0.00 €</span>
                  </li>
                )}
                <li className="list-group-item d-flex justify-content-between px-0 py-1 bg-transparent fw-bold border-top mt-1">
                  <span>Gesamtsumme</span>
                  <span>{booking.total_price.toFixed(2)} €</span>
                </li>
              </ul>
            </div>
          </td>
        </tr>
      ) as HTMLElement;

      tbody.appendChild(detailsRow);
    });
  };

  const toggleDetails = (e: Event, booking: BookingResponse) => {
    const btn = e.target as HTMLButtonElement;
    const detailRow = container.querySelector(`#details-${booking.id}`) as HTMLElement;
    if (detailRow.classList.contains("d-none")) {
      detailRow.classList.remove("d-none");
      btn.textContent = "Schließen";
      btn.className = "btn btn-sm btn-secondary rounded-pill px-3";
    } else {
      detailRow.classList.add("d-none");
      btn.textContent = "Details";
      btn.className = "btn btn-sm btn-outline-secondary rounded-pill px-3";
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
      const tbody = container.querySelector("#bookings-tbody") as HTMLElement;
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-danger py-4">Fehler beim Laden der Buchungen.</td>
        </tr>
      `;
    }
  };

  loadBookings();

  return container;
}
