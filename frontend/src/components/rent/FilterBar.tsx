import { createElement } from "../../utils/createElement.ts";

interface FilterBarProps {
  onFilterChange: () => void;
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const handleReset = (e: Event) => {
    e.preventDefault();
    const form = (e.target as HTMLElement).closest("form") as HTMLFormElement;
    if (form) {
      form.reset();
      onFilterChange();
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
      <form oninput={onFilterChange} onchange={onFilterChange}>
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
          <h4 className="fw-bold mb-0 text-dark custom-font-base">Filter</h4>
          <button className="btn btn-sm btn-link text-custom-red text-decoration-none p-0" onclick={handleReset}>
            Zurücksetzen
          </button>
        </div>

        <div className="mb-3">
          <label className="form-label small text-uppercase text-muted fw-bold">Suchbegriff</label>
          <input
            type="text"
            name="searchQuery"
            className="form-control rounded-3"
            placeholder="Suchen..."
          />
        </div>

        <div className="mb-4">
          <label className="form-label small text-uppercase text-muted fw-bold">Reisezeitraum</label>
          <div className="row g-2">
            <div className="col-6">
              <input type="date" name="dateFrom" className="form-control rounded-3" />
            </div>
            <div className="col-6">
              <input type="date" name="dateTo" className="form-control rounded-3" />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label small text-uppercase text-muted fw-bold">Hersteller</label>
          <select name="manufacturer" className="form-select rounded-3">
            <option value="">Alle Hersteller</option>
            <option value="Folkwagen">Folkwagen</option>
            <option value="Mercedenz-Bonz">Mercedenz-Bonz</option>
            <option value="Avdi">Avdi</option>
            <option value="DYB">DYB</option>
            <option value="Tayota">Tayota</option>
            <option value="Lamberghini">Lamberghini</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="form-label small text-uppercase text-muted fw-bold">Antrieb & Kraftstoff</label>
          <select name="fuelType" className="form-select rounded-3">
            <option value="">Alle Kraftstoffe</option>
            <option value="Diesel">Diesel</option>
            <option value="Benzine">Benzin (Super/Plus)</option>
            <option value="Electric">Elektrisch</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="form-label small text-uppercase text-muted fw-bold">Schadstoffklasse</label>
          <select name="emissionsClass" className="form-select rounded-3">
            <option value="">Alle Klassen</option>
            <option value="Euro 6">Euro 6</option>
            <option value="Euro 5">Euro 5</option>
            <option value="Elektro">Elektro</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="form-label small text-uppercase text-muted fw-bold">Preis pro Nacht (€)</label>
          <div className="row g-2">
            <div className="col-6">
              <input type="number" name="priceMin" className="form-control rounded-3" placeholder="Min" min="0" />
            </div>
            <div className="col-6">
              <input type="number" name="priceMax" className="form-control rounded-3" placeholder="Max" min="0" />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label small text-uppercase text-muted fw-bold">Schlafplätze (Bettanzahl)</label>
          <div className="row g-2">
            <div className="col-6">
              <input type="number" name="bedsMin" className="form-control rounded-3" placeholder="Min" min="1" />
            </div>
            <div className="col-6">
              <input type="number" name="bedsMax" className="form-control rounded-3" placeholder="Max" min="1" />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label small text-uppercase text-muted fw-bold">Fahrzeugabmessungen (max. cm)</label>
          <div className="row g-2 mb-2">
            <div className="col-6">
              <input type="number" name="heightMax" className="form-control rounded-3" placeholder="Max Höhe" min="0" />
            </div>
            <div className="col-6">
              <input type="number" name="widthMax" className="form-control rounded-3" placeholder="Max Breite" min="0" />
            </div>
          </div>
          <div>
            <input type="number" name="weightMax" className="form-control rounded-3" placeholder="Max Gewicht (kg)" min="0" />
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
            {["Küche", "Toilette", "Dusche", "Klimaanlage", "Heizung", "Fahrradträger", "Solaranlage", "Dachzelt"].map((feat) => (
              <div className="form-check">
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
  );
}
