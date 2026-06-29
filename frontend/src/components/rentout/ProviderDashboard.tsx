import { createElement } from "../../utils/createElement.ts";
import {
  getMockCampers,
  getMockBookings,
  saveMockBookings,
  getMockInquiries,
  saveMockInquiries
} from "../../utils/mockData.ts";
import type { MockBooking } from "../../utils/mockData.ts";

interface ProviderDashboardProps {
  ownerId: string;
  onDataChanged: () => void;
}

export function ProviderDashboard({ ownerId, onDataChanged }: ProviderDashboardProps) {
  const campers = getMockCampers().filter(c => c.owner_id === ownerId || c.owner_id === "user-1");
  const camperIds = campers.map(c => c.id);

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
              <select id="statsCamperSelect" className="form-select form-select-sm rounded-pill" style={{ width: "180px" }}>
                <option value="all">Alle Fahrzeuge</option>
                {campers.map(c => (
                  <option value={c.id}>{c.name}</option>
                ))}
              </select>
              <select id="statsTimeSelect" className="form-select form-select-sm rounded-pill" style={{ width: "130px" }}>
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
          <p className="text-muted small mb-0" id="earnings-sub">Basierend auf bestätigten und abgeschlossenen Buchungen</p>
        </div>
      </div>

      <div className="col-12 col-md-6">
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white text-center h-100">
          <h5 className="text-muted small text-uppercase fw-bold mb-3">Auslastungsgrad (Buchungsgrad)</h5>
          <div className="display-4 fw-bold text-custom-red mb-2 custom-font-base" id="occupancy-val">0 %</div>
          <div className="progress rounded-pill mb-2" style={{ height: "10px" }}>
            <div className="progress-bar bg-custom-red" role="progressbar" style={{ width: "0%" }} id="occupancy-progress"></div>
          </div>
          <p className="text-muted small mb-0" id="occupancy-sub">Auslastung im gewählten Zeitraum</p>
        </div>
      </div>

      <div className="col-12">
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <h4 className="fw-bold text-dark mb-4 custom-font-base">Mietanfragen</h4>
          <div className="row g-3" id="inquiries-container"></div>
        </div>
      </div>
    </div>
  ) as HTMLElement;

  const calculateStats = () => {
    const selectedCamper = (container.querySelector("#statsCamperSelect") as HTMLSelectElement).value;
    const selectedTime = (container.querySelector("#statsTimeSelect") as HTMLSelectElement).value;

    const bookings = getMockBookings().filter(b => {
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

    bookings.forEach(b => {
      if (b.status === "Cancelled") return;

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
    const list = getMockInquiries().filter(inq => camperIds.includes(inq.camper_id));
    const listContainer = container.querySelector("#inquiries-container") as HTMLElement;
    listContainer.innerHTML = "";

    const pendingList = list.filter(i => i.status === "Pending");

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
        <div className="col-12 col-md-6">
          <div className="card border rounded-3 p-3 bg-light h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="badge bg-custom-red text-white">{inq.camper_name}</span>
                <span className="text-muted small">{inq.start_date} bis {inq.end_date}</span>
              </div>
              <h5 className="fw-bold text-dark mb-1">{inq.renter_name}</h5>
              <p className="text-muted small mb-3">{inq.message}</p>
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

  const handleDecision = (id: string, accept: boolean) => {
    const inquiries = getMockInquiries();
    const inq = inquiries.find(i => i.id === id);
    if (!inq) return;

    if (accept) {
      inq.status = "Accepted";
      const campersList = getMockCampers();
      const camper = campersList.find(c => c.id === inq.camper_id) || campers[0];

      const start = new Date(inq.start_date);
      const end = new Date(inq.end_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

      const baseCost = camper.price_per_night_base * nights;
      const totalCost = baseCost + camper.cleaning_fee;

      const bookings = getMockBookings();
      const newBooking: MockBooking = {
        id: `booking-${Date.now()}`,
        camper_id: inq.camper_id,
        camper_name: inq.camper_name,
        start_date: inq.start_date,
        end_date: inq.end_date,
        total_price: totalCost,
        addons_price: 0,
        status: "Confirmed",
        addons_detail: []
      };

      bookings.push(newBooking);
      saveMockBookings(bookings);
    } else {
      inq.status = "Declined";
    }

    saveMockInquiries(inquiries);
    renderInquiries();
    calculateStats();
    onDataChanged();
  };

  const camperSelect = container.querySelector("#statsCamperSelect") as HTMLSelectElement;
  const timeSelect = container.querySelector("#statsTimeSelect") as HTMLSelectElement;

  camperSelect.addEventListener("change", calculateStats);
  timeSelect.addEventListener("change", calculateStats);

  setTimeout(() => {
    calculateStats();
    renderInquiries();
  }, 0);

  return container;
}
