import { createElement } from "../../utils/createElement.ts";
import { getAllCampers } from "../../api/campersAPI.ts";
import { fetchBookingsByProvider, updateBookingStatus } from "../../api/bookingsAPI.ts";
import type { BookingResponse } from "../../api/bookingsAPI.ts";
import type { MockCamper } from "../../utils/mockData.ts";

interface ProviderDashboardProps {
  ownerId: string;
  onDataChanged: () => void;
}

/**
 * Renders the provider's analytics dashboard: total earnings, occupancy
 * rate (filterable by vehicle and time period) and a list of pending rental
 * requests ("Mietanfragen") that the provider can accept or decline.
 *
 * The camper/time filter dropdowns and the requests list are populated
 * imperatively after data is fetched, since there is no reactive state
 * system in this app - `loadData` re-fetches everything and re-renders the
 * affected DOM sections directly.
 *
 * @param props.ownerId ID of the provider whose campers/bookings are shown.
 * @param props.onDataChanged Callback invoked after a booking's status changes, so the parent can refresh sibling components.
 * @returns The dashboard's root element.
 */
export function ProviderDashboard({ ownerId, onDataChanged }: ProviderDashboardProps) {
  let campers: MockCamper[] = [];
  let camperIds: string[] = [];
  let bookings: BookingResponse[] = [];

  const container = (
    <div className="row g-4">
      <div className="col-12">
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h3 className="fw-bold mb-1 text-dark custom-font-base">Analysen &amp; Übersicht</h3>
              <p className="text-muted mb-0 small">Übersicht über deine Einnahmen und Auslastung.</p>
            </div>
            <div className="d-flex gap-2">
              <select id="statsCamperSelect" className="form-select form-select-sm rounded-pill w-180px">
                <option value="all">Alle Fahrzeuge</option>
              </select>
              <select id="statsTimeSelect" className="form-select form-select-sm rounded-pill w-130px">
                <option value="year">Dieses Jahr</option>
                <option value="month">Diesen Monat</option>
                <option value="week">Diese Woche</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-md-6">
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white text-center h-100">
          <h5 className="text-muted small text-uppercase fw-bold mb-3">Gesamteinnahmen</h5>
          <div className="display-4 fw-bold text-custom-light-blue mb-2 custom-font-base" id="total-earnings-val">0.00 €</div>
          <p className="text-muted small mb-0" id="earnings-sub">Umsatz in den letzten 365 Tagen</p>
        </div>
      </div>

      <div className="col-12 col-md-6">
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white text-center h-100">
          <h5 className="text-muted small text-uppercase fw-bold mb-3">Auslastungsgrad (Buchungsgrad)</h5>
          <div className="display-4 fw-bold text-custom-red mb-2 custom-font-base" id="occupancy-val">0 %</div>
          <div className="progress rounded-pill mb-2 occupancy-progress-track">
            <div className="progress-bar bg-custom-red occupancy-progress-initial" role="progressbar" id="occupancy-progress"></div>
          </div>
          <p className="text-muted small mb-0" id="occupancy-sub">Buchungsgrad in den letzten 365 Tagen</p>
        </div>
      </div>

      <div className="col-12">
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <h4 className="fw-bold text-dark mb-4 custom-font-base">Mietanfragen</h4>
          <div className="row g-3" id="inquiries-container">
            {Array.from({ length: 2 }, () => (
              <div className="col-12 col-md-6">
                <div className="card border rounded-3 p-3 bg-light h-100 placeholder-glow">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="placeholder rounded-pill dashboard-skel-badge" />
                    <span className="placeholder rounded dashboard-skel-date" />
                  </div>
                  <div className="placeholder rounded mb-1 dashboard-skel-title" />
                  <div className="placeholder rounded mb-3 dashboard-skel-subtitle" />
                  <div className="d-flex gap-2">
                    <span className="placeholder rounded-pill w-50 dashboard-skel-btn" />
                    <span className="placeholder rounded-pill w-50 dashboard-skel-btn" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ) as HTMLElement;

  const calculateStats = () => {
    const selectedCamper = (container.querySelector("#statsCamperSelect") as HTMLSelectElement).value;
    const selectedTime = (container.querySelector("#statsTimeSelect") as HTMLSelectElement).value;

    const filteredBookings = bookings.filter(b => {
      if (selectedCamper === "all") {
        return camperIds.includes(b.camper_id);
      } else {
        return b.camper_id === selectedCamper;
      }
    });

    let daysInPeriod = 365;
    if (selectedTime === "week") daysInPeriod = 7;
    else if (selectedTime === "month") daysInPeriod = 30;

    let earnings = 0;
    let rentedDays = 0;

    const now = new Date();

    filteredBookings.forEach(b => {
      if (b.status === "cancelled") return;

      const start = new Date(b.start_date);
      const end = new Date(b.end_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

      let isInPeriod = false;
      const msDiff = now.getTime() - start.getTime();
      const daysAgo = msDiff / (1000 * 60 * 60 * 24);

      if (selectedTime === "week" && daysAgo <= 7) isInPeriod = true;
      else if (selectedTime === "month" && daysAgo <= 30) isInPeriod = true;
      else if (selectedTime === "year" && daysAgo <= 365) isInPeriod = true;

      if (isInPeriod) {
        earnings += b.total_price;
        rentedDays += diffDays;
      }
    });

    const activeCamperCount = selectedCamper === "all" ? campers.length : 1;
    const totalPossibleDays = daysInPeriod * activeCamperCount;
    let occupancyRate = 0;
    if (totalPossibleDays > 0) {
      occupancyRate = Math.min(Math.round((rentedDays / totalPossibleDays) * 100), 100);
    }

    container.querySelector("#total-earnings-val")!.textContent = `${earnings.toFixed(2)} €`;
    container.querySelector("#occupancy-val")!.textContent = `${occupancyRate} %`;
    (container.querySelector("#occupancy-progress") as HTMLElement).style.width = `${occupancyRate}%`;

    let timeText = "in den letzten 365 Tagen";
    if (selectedTime === "week") timeText = "in den letzten 7 Tagen";
    else if (selectedTime === "month") timeText = "in den letzten 30 Tagen";

    container.querySelector("#earnings-sub")!.textContent = `Umsatz ${timeText}`;
    container.querySelector("#occupancy-sub")!.textContent = `Buchungsgrad ${timeText}`;
  };

  const renderInquiries = () => {
    const listContainer = container.querySelector("#inquiries-container") as HTMLElement;
    listContainer.innerHTML = "";

    const pendingList = bookings.filter(b => b.status === "pending" && camperIds.includes(b.camper_id));

    if (pendingList.length === 0) {
      listContainer.innerHTML = `
        <div class="col-12 text-center py-4 text-muted">
          Aktuell liegen keine ausstehenden Mietanfragen vor.
        </div>
      `;
      return;
    }

    pendingList.forEach((inq) => {
      const inqCard = (
        <div className="col-12 col-md-6 fade-in">
          <div className="card border rounded-3 p-3 bg-light h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="badge bg-custom-red text-white">{inq.camper_name}</span>
                <span className="text-muted small">{inq.start_date} bis {inq.end_date}</span>
              </div>
              <h5 className="fw-bold text-dark mb-1">Mietanfrage #{inq.id.slice(0, 8)}</h5>
              <p className="text-muted small mb-3">Gesamtsumme der Buchungsanfrage: {inq.total_price.toFixed(2)} €</p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-success w-50 rounded-pill py-2" onclick={() => handleDecision(inq.id, true)}>
                Akzeptieren
              </button>
              <button className="btn btn-sm btn-outline-danger w-50 rounded-pill py-2" onclick={() => handleDecision(inq.id, false)}>
                Ablehnen
              </button>
            </div>
          </div>
        </div>
      );
      listContainer.appendChild(inqCard);
    });
  };

  const handleDecision = async (id: string, accept: boolean) => {
    try {
      const nextStatus = accept ? "confirmed" : "cancelled";
      await updateBookingStatus(id, nextStatus);
      await loadData();
      onDataChanged();
    } catch (err) {
      console.error(err);
      alert("Fehler bei der Aktualisierung des Buchungsstatus.");
    }
  };

  const loadData = async () => {
    try {
      const allCampers = await getAllCampers();
      campers = allCampers.filter(c => c.ownerId === ownerId || c.owner_id === ownerId);
      camperIds = campers.map(c => c.id);

      const select = container.querySelector("#statsCamperSelect") as HTMLSelectElement;
      if (select) {
        select.replaceChildren(
          <option value="all">Alle Fahrzeuge</option>,
          ...campers.map((c) => <option value={c.id}>{c.name}</option>),
        );
      }

      bookings = await fetchBookingsByProvider(ownerId);

      calculateStats();
      renderInquiries();
    } catch (err) {
      console.error(err);
      const listContainer = container.querySelector("#inquiries-container") as HTMLElement;
      listContainer.innerHTML = `
        <div class="col-12 text-center py-4 text-danger">
          Fehler beim Laden des Dashboards.
        </div>
      `;
    }
  };

  const camperSelect = container.querySelector("#statsCamperSelect") as HTMLSelectElement;
  const timeSelect = container.querySelector("#statsTimeSelect") as HTMLSelectElement;

  camperSelect.addEventListener("change", calculateStats);
  timeSelect.addEventListener("change", calculateStats);

  loadData();

  return container;
}
