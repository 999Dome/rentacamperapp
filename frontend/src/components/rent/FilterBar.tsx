import { createElement } from "../../utils/createElement.ts";
import flatpickr from "flatpickr";
import type { Instance as FlatpickrInstance } from "flatpickr/dist/types/instance";
import "flatpickr/dist/flatpickr.min.css";
import { German } from "flatpickr/dist/l10n/de.js";
import { renderDropdown } from "./filter-bar/FilterDropdown.tsx";
import { FilterHeader } from "./filter-bar/FilterHeader.tsx";
import { RangeInputPair } from "./filter-bar/RangeInputPair.tsx";
import { FeatureCheckboxList } from "./filter-bar/FeatureCheckboxList.tsx";
import type { LocationResponse } from "../../infrastructure/api/location-api-client.ts";

interface FilterBarProps {
  onFilterChange: () => void;
  locations: LocationResponse[];
}

/** Feature names shown in the "Ausstattung & Features" checkbox list. */
const FEATURE_OPTIONS = [
  "Spülbecken",
  "Kühlschrank",
  "Gasherd",
  "Backofen",
  "Toilette",
  "Innendusche",
  "Außendusche",
  "Warmwasser-Boiler",
  "Standheizung",
  "Klimaanlage",
  "Navigationssystem",
  "Rückfahrkamera",
  "Zusatzbatterie",
  "WLAN / LTE Router"
];

/**
 * The camper rental filter sidebar/card. Renders a form (search term, date
 * range, dropdown filters, numeric ranges, tow-hitch switch, feature
 * checkboxes) and notifies the caller via `onFilterChange` whenever any
 * field changes, so `RentPage` can re-run filtering against the camper list.
 *
 * The heavier, repeated pieces of markup are extracted into
 * `./filter-bar/*` components (dropdowns, header, min/max input rows,
 * feature checkboxes); this file wires them together and owns the
 * behaviors that need direct DOM access (form reset, flatpickr setup).
 *
 * @param onFilterChange Called whenever a filter input changes (including
 *   dropdown selection, date pick, and form reset).
 * @returns The filter card's root `<div>` element.
 */
export function FilterBar({ onFilterChange, locations }: FilterBarProps) {
  const urlParams = new URLSearchParams(window.location.search);
  const qLocation = urlParams.get("location");
  const qDateFrom = urlParams.get("dateFrom");
  const qDateTo = urlParams.get("dateTo");

  const locationOptions = [
    { value: "", label: "Alle Abholorte" },
    ...locations.map((loc) => ({
      value: loc.id,
      label: loc.name ? `${loc.name} (${loc.city})` : `${loc.street} ${loc.housenumber || ''}, ${loc.city}`
    }))
  ];

  const handleReset = (e: Event) => {
    e.preventDefault();
    const card = (e.target as HTMLElement).closest(".filter-card") as HTMLElement;
    const form = card?.querySelector("form") as HTMLFormElement;
    if (form) {
      form.reset();

      // Reset custom dropdown labels
      const manufacturerText = card.querySelector("#btn-text-manufacturer");
      if (manufacturerText) manufacturerText.textContent = "Alle Hersteller";

      const fuelTypeText = card.querySelector("#btn-text-fuelType");
      if (fuelTypeText) fuelTypeText.textContent = "Alle Kraftstoffe";

      const emissionsClassText = card.querySelector("#btn-text-emissionsClass");
      if (emissionsClassText) emissionsClassText.textContent = "Alle Klassen";

      const providerTypeText = card.querySelector("#btn-text-providerType");
      if (providerTypeText) providerTypeText.textContent = "Alle Anbieter";

      const locationText = card.querySelector("#btn-text-location");
      if (locationText) locationText.textContent = "Alle Abholorte";

      // Reset hidden inputs
      const hiddenInputs = form.querySelectorAll("input[type='hidden']");
      hiddenInputs.forEach((inp) => {
        (inp as HTMLInputElement).value = "";
      });

      // Reset flatpickr inputs
      const fpInputs = form.querySelectorAll(".flatpickr-input");
      fpInputs.forEach((inp) => {
        const fpInstance = (inp as HTMLInputElement & { _flatpickr?: FlatpickrInstance })._flatpickr;
        if (fpInstance) {
          fpInstance.clear();
        }
      });

      onFilterChange();
    }
  };

  const element = (
    <div className="card filter-card p-4 mb-4 bg-white">
      <FilterHeader onReset={handleReset} />

      <div className="collapse d-lg-block mt-3 mt-lg-0" id="filterFormCollapse">
        <form oninput={onFilterChange} onchange={onFilterChange}>
          <div className="mb-3">
            <label className="form-label small text-uppercase text-muted fw-bold">Suchbegriff</label>
            <div className="filter-input-group">
              <i className="bi bi-search input-icon"></i>
              <input
                type="text"
                name="searchQuery"
                className="form-control filter-control"
                placeholder="Suchen..."
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small text-uppercase text-muted fw-bold">Abholort</label>
            {renderDropdown(
              "location",
              "bi bi-geo-alt",
              locationOptions,
              "Alle Abholorte",
              onFilterChange,
              qLocation || undefined
            )}
          </div>

          <div className="mb-4">
            <label className="form-label small text-uppercase text-muted fw-bold">Reisezeitraum</label>
            <div className="row g-2">
              <div className="col-6">
                <div className="filter-input-group">
                  <i className="bi bi-calendar-event input-icon"></i>
                  <input type="text" name="dateFrom" className="form-control filter-control" placeholder="ab..." />
                </div>
              </div>
              <div className="col-6">
                <div className="filter-input-group">
                  <i className="bi bi-calendar-event input-icon"></i>
                  <input type="text" name="dateTo" className="form-control filter-control" placeholder="bis..." />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small text-uppercase text-muted fw-bold">Hersteller</label>
            {renderDropdown(
              "manufacturer",
              "bi bi-car-front",
              [
                { value: "", label: "Alle Hersteller" },
                { value: "Rolls-Boyce", label: "Rolls-Boyce" },
                { value: "Folkwagen", label: "Folkwagen" },
                { value: "Mercedenz-Bonz", label: "Mercedenz-Bonz" },
                { value: "Avdi", label: "Avdi" },
                { value: "DYB", label: "DYB" },
                { value: "Tayota", label: "Tayota" },
                { value: "Sabaru", label: "Sabaru" },
                { value: "Chervolet", label: "Chervolet" },
                { value: "Ferraro", label: "Ferraro" },
                { value: "Lamberghini", label: "Lamberghini" }
              ],
              "Alle Hersteller",
              onFilterChange
            )}
          </div>

          <div className="mb-4">
            <label className="form-label small text-uppercase text-muted fw-bold">Führerschein</label>
            {renderDropdown(
              "requiredLicense",
              "bi bi-card-heading",
              [
                { value: "", label: "Alle Klassen" },
                { value: "Klasse B", label: "Klasse B" },
                { value: "Klasse B96", label: "Klasse B96" },
                { value: "Klasse BE", label: "Klasse BE" },
                { value: "Klasse C1", label: "Klasse C1" },
                { value: "Klasse C1E", label: "Klasse C1E" },
                { value: "Klasse C", label: "Klasse C" },
                { value: "Klasse CE", label: "Klasse CE" },
                { value: "alte Klasse 3", label: "alte Klasse 3" },
                { value: "alte Klasse 2", label: "alte Klasse 2" }
              ],
              "Alle Klassen",
              onFilterChange
            )}
          </div>

          <div className="mb-4">
            <label className="form-label small text-uppercase text-muted fw-bold">Antrieb & Kraftstoff</label>
            {renderDropdown(
              "fuelType",
              "bi bi-fuel-pump",
              [
                { value: "", label: "Alle Kraftstoffe" },
                { value: "Diesel", label: "Diesel" },
                { value: "Benzine", label: "Benzin (Super/Plus)" },
                { value: "Electric", label: "Elektrisch" }
              ],
              "Alle Kraftstoffe",
              onFilterChange
            )}
          </div>

          <div className="mb-4">
            <label className="form-label small text-uppercase text-muted fw-bold">Schadstoffklasse</label>
            {renderDropdown(
              "emissionsClass",
              "bi bi-globe",
              [
                { value: "", label: "Alle Klassen" },
                { value: "Euro 6", label: "Euro 6" },
                { value: "Euro 5", label: "Euro 5" },
                { value: "Elektro", label: "Elektro" }
              ],
              "Alle Klassen",
              onFilterChange
            )}
          </div>

          <div className="mb-4">
            <label className="form-label small text-uppercase text-muted fw-bold">Anbieter</label>
            {renderDropdown(
              "providerType",
              "bi bi-person-badge",
              [
                { value: "", label: "Alle Anbieter" },
                { value: "original", label: "Rent-A-Camper Original" },
                { value: "privat", label: "Privatanbieter" }
              ],
              "Alle Anbieter",
              onFilterChange
            )}
          </div>

          <div className="mb-4">
            <label className="form-label small text-uppercase text-muted fw-bold">Preis pro Nacht (€)</label>
            <RangeInputPair
              fields={[
                { icon: "bi bi-currency-euro", name: "priceMin", placeholder: "Min", min: "0" },
                { icon: "bi bi-currency-euro", name: "priceMax", placeholder: "Max", min: "0" }
              ]}
            />
          </div>

          <div className="mb-4">
            <label className="form-label small text-uppercase text-muted fw-bold">Schlafplätze (Bettanzahl)</label>
            <RangeInputPair
              fields={[
                { icon: "bi bi-door-closed", name: "bedsMin", placeholder: "Min", min: "1" },
                { icon: "bi bi-door-closed", name: "bedsMax", placeholder: "Max", min: "1" }
              ]}
            />
          </div>

          <div className="mb-4">
            <label className="form-label small text-uppercase text-muted fw-bold">Fahrzeugabmessungen (max. cm)</label>
            <RangeInputPair
              rowClassName="row g-2 mb-2"
              fields={[
                { icon: "bi bi-arrows-expand", name: "heightMax", placeholder: "Höhe", min: "0" },
                { icon: "bi bi-arrows-collapse", name: "widthMax", placeholder: "Breite", min: "0" }
              ]}
            />
            <div className="filter-input-group">
              <i className="bi bi-speedometer2 input-icon"></i>
              <input type="number" name="weightMax" className="form-control filter-control" placeholder="Max Gewicht (kg)" min="0" />
            </div>
          </div>

          <div className="mb-4 border-top pt-3">
            <div className="form-check form-switch mb-3">
              <input className="form-check-input" type="checkbox" name="hasTowHitch" id="filterTowHitch" />
              <label className="form-check-label text-dark fw-medium" htmlFor="filterTowHitch">Anhängerkupplung</label>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small text-uppercase text-muted fw-bold mb-2">Ausstattung & Features</label>
            <FeatureCheckboxList features={FEATURE_OPTIONS} />
          </div>
        </form>
      </div>
    </div>
  ) as HTMLElement;

  // Initialize Flatpickr
  const dateFromInput = element.querySelector("input[name='dateFrom']") as HTMLInputElement;
  const dateToInput = element.querySelector("input[name='dateTo']") as HTMLInputElement;

  if (dateFromInput) {
    flatpickr(dateFromInput, {
      locale: German,
      dateFormat: "d.m.Y",
      defaultDate: qDateFrom || undefined,
      onChange: () => {
        onFilterChange();
      }
    });
  }

  if (dateToInput) {
    flatpickr(dateToInput, {
      locale: German,
      dateFormat: "d.m.Y",
      defaultDate: qDateTo || undefined,
      onChange: () => {
        onFilterChange();
      }
    });
  }

  return element;
}
