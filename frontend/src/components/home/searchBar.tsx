import { createElement } from '../../utils/createElement.ts';
import { getAllLocations } from '../../api/locationsAPI.ts';
import flatpickr from 'flatpickr';
import type { Instance as FlatpickrInstance } from 'flatpickr/dist/types/instance';
import 'flatpickr/dist/flatpickr.min.css';
import { German } from 'flatpickr/dist/l10n/de.js';

/**
 * Quick-search card overlapping the hero section, letting visitors pick a
 * location and date range and jump straight into a filtered camper search.
 */
export function SearchBar() {
  const selectEl = (
    <select
      id="search-location"
      className="form-select bg-dark border-secondary text-white py-2"
      required
    >
      <option value="" disabled selected>Abholort wählen...</option>
    </select>
  ) as HTMLSelectElement;

  // Load locations asynchronously and populate options
  getAllLocations()
    .then((locations) => {
      locations.forEach((loc) => {
        const label = loc.name ? `${loc.name} (${loc.city})` : `${loc.street} ${loc.housenumber || ''}, ${loc.city}`;
        const option = (
          <option value={loc.id}>{label}</option>
        ) as HTMLOptionElement;
        selectEl.appendChild(option);
      });
    })
    .catch((err) => console.error("Failed to load locations in SearchBar:", err));

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const locationVal = selectEl.value;
    const startDateVal = (element.querySelector('#search-start-date') as HTMLInputElement).value;
    const endDateVal = (element.querySelector('#search-end-date') as HTMLInputElement).value;

    const params = new URLSearchParams();
    if (locationVal) params.append('location', locationVal);
    if (startDateVal) params.append('dateFrom', startDateVal);
    if (endDateVal) params.append('dateTo', endDateVal);

    window.location.href = `/pages/rent/?${params.toString()}`;
  };

  const element = (
    <div className="container">
      <div
        className="card shadow-lg border-0 p-4 position-relative search-bar-card"
      >
        <form id="quick-search-form" className="row g-3 align-items-end" onsubmit={handleSubmit}>
          <div className="col-12 col-md-4">
            <label
              htmlFor="search-location"
              className="form-label text-white-50 small text-uppercase fw-bold"
            >
              📍 Abholort
            </label>
            {selectEl}
          </div>
          <div className="col-6 col-md-3">
            <label
              htmlFor="search-start-date"
              className="form-label text-white-50 small text-uppercase fw-bold"
            >
              📅 Abholung
            </label>
            <input
              type="text"
              id="search-start-date"
              className="form-control bg-dark border-secondary text-white py-2"
              placeholder="tt.mm.jjjj"
              required
            />
          </div>
          <div className="col-6 col-md-3">
            <label
              htmlFor="search-end-date"
              className="form-label text-white-50 small text-uppercase fw-bold"
            >
              🏁 Rückgabe
            </label>
            <input
              type="text"
              id="search-end-date"
              className="form-control bg-dark border-secondary text-white py-2"
              placeholder="tt.mm.jjjj"
              required
            />
          </div>
          <div className="col-12 col-md-2">
            <button
              type="submit"
              className="btn btn-custom-yellow w-100 py-2 text-uppercase fw-bold shadow-sm"
            >
              Suchen
            </button>
          </div>
        </form>
      </div>
    </div>
  ) as HTMLElement;

  // Initialize Flatpickr
  const dateFromInput = element.querySelector('#search-start-date') as HTMLInputElement;
  const dateToInput = element.querySelector('#search-end-date') as HTMLInputElement;

  let dateToInstance: FlatpickrInstance | null = null;
  if (dateToInput) {
    dateToInstance = flatpickr(dateToInput, {
      locale: German,
      dateFormat: "Y-m-d",
      altInput: true,
      altFormat: "d.m.Y",
      minDate: "today"
    });
  }

  if (dateFromInput) {
    flatpickr(dateFromInput, {
      locale: German,
      dateFormat: "Y-m-d",
      altInput: true,
      altFormat: "d.m.Y",
      minDate: "today",
      onChange: (selectedDates) => {
        if (selectedDates.length > 0 && dateToInstance) {
          dateToInstance.set("minDate", selectedDates[0]);
        }
      }
    });
  }

  return element;
}

