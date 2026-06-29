import { createElement } from "../../utils/createElement.ts";
import { getMockBookings } from "../../utils/mockData.ts";
import type { MockBooking } from "../../utils/mockData.ts";

export function BookingsTable() {
  const bookings = getMockBookings();

  const container = (
    <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
      <h3 className="fw-bold mb-4 text-dark custom-font-base">Meine Buchungen</h3>
      <div className="table-responsive">
        <table className="table align-middle">
          <thead className="table-light">
            <tr>
              <th>Fahrzeug</th>
              <th>Zeitraum</th>
              <th>Status</th>
              <th>Gesamtpreis</th>
              <th className="text-end">Preisdetails</th>
            </tr>
          </thead>
          <tbody id="bookings-tbody"></tbody>
        </table>
      </div>
    </div>
  ) as HTMLElement;

  const renderTable = () => {
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
          <div>{booking.start_date} bis {booking.end_date}</div>
        </td>
      );

      let badgeClass = "bg-warning-subtle text-warning";
      let badgeText = "Ausstehend";

      if (booking.status === "Confirmed") {
        badgeClass = "bg-primary-subtle text-primary";
        badgeText = "Bestätigt";
      } else if (booking.status === "Completed") {
        badgeClass = "bg-success-subtle text-success";
        badgeText = "Abgeschlossen";
      } else if (booking.status === "Cancelled") {
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

      row.appendChild(
        <td className="text-end">
          <button className="btn btn-sm btn-outline-secondary rounded-pill px-3" onclick={(e: Event) => toggleDetails(e, booking)}>
            Details
          </button>
        </td>
      );

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

  const toggleDetails = (e: Event, booking: MockBooking) => {
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

  setTimeout(renderTable, 0);

  return container;
}
