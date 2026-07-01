import { createElement } from "../../utils/createElement.ts";
import flatpickr from "flatpickr";
import type { Instance as FlatpickrInstance } from "flatpickr/dist/types/instance";
import "flatpickr/dist/flatpickr.min.css";
import { German } from "flatpickr/dist/l10n/de.js";

interface FilterBarProps {
  onFilterChange: () => void;
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
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

  const handleSelect = (name: string, val: string, label: string, container: HTMLElement) => {
    const btnTextEl = container.querySelector(`#btn-text-${name}`) as HTMLElement;
    const inputEl = container.querySelector(`input[name="${name}"]`) as HTMLInputElement;
    if (btnTextEl && inputEl) {
      inputEl.value = val;
      btnTextEl.textContent = label;
      onFilterChange();
    }
  };

  const renderDropdown = (
    name: string,
    iconClass: string,
    options: { value: string; label: string }[],
    defaultLabel: string
  ) => {
    return (
      <div className="dropdown filter-input-group w-100">
        <i className={`${iconClass} input-icon`}></i>
        <button
          className="form-select filter-control text-start w-100 dropdown-toggle d-flex align-items-center justify-content-between"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <span id={`btn-text-${name}`}>{defaultLabel}</span>
        </button>
        <input type="hidden" name={name} value="" />
        <ul className="dropdown-menu w-100 shadow-sm p-1">
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                className="dropdown-item rounded-2 py-2"
                type="button"
                onclick={(e: Event) => {
                  e.preventDefault();
                  const target = e.currentTarget as HTMLElement;
                  const dropdownContainer = target.closest(".dropdown") as HTMLElement;
                  if (dropdownContainer) {
                    handleSelect(name, opt.value, opt.label, dropdownContainer);
                  }
                }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const element = (
    <div className="card filter-card p-4 mb-4 bg-white">
      <div className="d-flex justify-content-between align-items-center mb-0 mb-lg-4 border-bottom pb-2">
        <h4 className="fw-bold mb-0 text-dark custom-font-base">Filter</h4>
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-sm btn-reset-filter" onclick={handleReset}>
            Zurücksetzen
          </button>
          <button
            className="btn btn-outline-custom-light-blue btn-sm d-lg-none"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#filterFormCollapse"
            aria-expanded="false"
            aria-controls="filterFormCollapse"
          >
            <i className="bi bi-funnel-fill"></i> Toggle
          </button>
        </div>
      </div>

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
                { value: "Folkwagen", label: "Folkwagen" },
                { value: "Mercedenz-Bonz", label: "Mercedenz-Bonz" },
                { value: "Avdi", label: "Avdi" },
                { value: "DYB", label: "DYB" },
                { value: "Tayota", label: "Tayota" },
                { value: "Lamberghini", label: "Lamberghini" }
              ],
              "Alle Hersteller"
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
              "Alle Kraftstoffe"
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
              "Alle Klassen"
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
              "Alle Anbieter"
            )}
          </div>

          <div className="mb-4">
            <label className="form-label small text-uppercase text-muted fw-bold">Preis pro Nacht (€)</label>
            <div className="row g-2">
              <div className="col-6">
                <div className="filter-input-group">
                  <i className="bi bi-currency-euro input-icon"></i>
                  <input type="number" name="priceMin" className="form-control filter-control" placeholder="Min" min="0" />
                </div>
              </div>
              <div className="col-6">
                <div className="filter-input-group">
                  <i className="bi bi-currency-euro input-icon"></i>
                  <input type="number" name="priceMax" className="form-control filter-control" placeholder="Max" min="0" />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small text-uppercase text-muted fw-bold">Schlafplätze (Bettanzahl)</label>
            <div className="row g-2">
              <div className="col-6">
                <div className="filter-input-group">
                  <i className="bi bi-door-closed input-icon"></i>
                  <input type="number" name="bedsMin" className="form-control filter-control" placeholder="Min" min="1" />
                </div>
              </div>
              <div className="col-6">
                <div className="filter-input-group">
                  <i className="bi bi-door-closed input-icon"></i>
                  <input type="number" name="bedsMax" className="form-control filter-control" placeholder="Max" min="1" />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small text-uppercase text-muted fw-bold">Fahrzeugabmessungen (max. cm)</label>
            <div className="row g-2 mb-2">
              <div className="col-6">
                <div className="filter-input-group">
                  <i className="bi bi-arrows-expand input-icon"></i>
                  <input type="number" name="heightMax" className="form-control filter-control" placeholder="Höhe" min="0" />
                </div>
              </div>
              <div className="col-6">
                <div className="filter-input-group">
                  <i className="bi bi-arrows-collapse input-icon"></i>
                  <input type="number" name="widthMax" className="form-control filter-control" placeholder="Breite" min="0" />
                </div>
              </div>
            </div>
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
            <div className="d-flex flex-column gap-2">
              {[
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
              ].map((feat) => (
                <div className="form-check" key={feat}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="features"
                    value={feat}
                    id={`feat-${feat}`}
                  />
                  <label className="form-check-label text-muted small" htmlFor={`feat-${feat}`}>
                    {feat}
                  </label>
                </div>
              ))}
            </div>
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
      onChange: () => {
        onFilterChange();
      }
    });
  }

  if (dateToInput) {
    flatpickr(dateToInput, {
      locale: German,
      dateFormat: "d.m.Y",
      onChange: () => {
        onFilterChange();
      }
    });
  }

  return element;
}
