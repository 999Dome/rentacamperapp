import { createElement } from "../../utils/createElement.ts";
import { getMockCampers, saveMockCampers } from "../../utils/mockData.ts";
import type { MockCamper } from "../../utils/mockData.ts";

interface CamperCRUDProps {
  ownerId: string;
  onDataChanged: () => void;
}

export function CamperCRUD({ ownerId, onDataChanged }: CamperCRUDProps) {
  let campers = getMockCampers().filter(c => c.owner_id === ownerId || c.owner_id === "user-1");
  let activeEditId: string | null = null;
  let container: HTMLElement;

  function renderTable() {
    const tbody = container.querySelector("#camper-crud-tbody") as HTMLElement;
    if (!tbody) return;
    tbody.innerHTML = "";

    if (campers.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-muted py-4">Keine inserierten Fahrzeuge gefunden.</td>
        </tr>
      `;
      return;
    }

    campers.forEach((camper) => {
      const row = document.createElement("tr");

      row.appendChild(
        <td>
          <div className="d-flex align-items-center gap-3">
            <img
              src={camper.image_url || "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7"}
              alt={camper.name || ""}
              className="rounded-3"
              style={{ width: "60px", height: "45px", objectFit: "cover" }}
            />
            <span className="fw-bold text-dark">{camper.name}</span>
          </div>
        </td>
      );

      row.appendChild(<td>{camper.manufacturer}</td>);
      row.appendChild(<td className="fw-bold">{camper.price_per_night_base} €</td>);
      row.appendChild(<td>{camper.beds} Betten</td>);
      row.appendChild(<td><span className="badge bg-light text-dark border">Klasse {camper.required_license}</span></td>);

      const statusBadge = camper.is_blocked ? (
        <span className="badge bg-danger-subtle text-danger rounded-pill px-3 py-1">Gesperrt</span>
      ) : (
        <span className="badge bg-success-subtle text-success rounded-pill px-3 py-1">Aktiv</span>
      );
      row.appendChild(<td>{statusBadge}</td>);

      const blockBtnText = camper.is_blocked ? "Freigeben" : "Blockieren";
      const blockBtnClass = camper.is_blocked ? "btn-outline-success" : "btn-outline-warning";

      row.appendChild(
        <td className="text-end">
          <div className="d-inline-flex gap-2">
            <button className={`btn btn-sm ${blockBtnClass} rounded-pill px-3`} onclick={() => toggleBlock(camper.id)}>
              {blockBtnText}
            </button>
            <button className="btn btn-sm btn-outline-primary rounded-pill px-3" onclick={() => openModal(camper.id)}>
              Edit
            </button>
            <button className="btn btn-sm btn-outline-danger rounded-pill px-3" onclick={() => deleteCamper(camper.id)}>
              Löschen
            </button>
          </div>
        </td>
      );

      tbody.appendChild(row);
    });
  }

  function openModal(id: string | null) {
    activeEditId = id;
    const modal = container.querySelector("#crud-modal") as HTMLElement;
    const backdrop = container.querySelector("#crud-modal-backdrop") as HTMLElement;
    const title = container.querySelector("#modal-title-text") as HTMLElement;
    const submitBtn = container.querySelector("#submit-btn-text") as HTMLElement;
    const form = container.querySelector("#camper-form") as HTMLFormElement;

    form.reset();

    if (id) {
      const camper = campers.find((c) => c.id === id);
      if (camper) {
        title.textContent = "Camper bearbeiten";
        submitBtn.textContent = "Änderungen speichern";

        (form.elements.namedItem("camperName") as HTMLInputElement).value = camper.name || "";
        (form.elements.namedItem("camperManufacturer") as HTMLSelectElement).value = camper.manufacturer;
        (form.elements.namedItem("camperPrice") as HTMLInputElement).value = String(camper.price_per_night_base);
        (form.elements.namedItem("camperCleaning") as HTMLInputElement).value = String(camper.cleaning_fee);
        (form.elements.namedItem("camperDeposit") as HTMLInputElement).value = String(camper.deposit_amount);
        (form.elements.namedItem("camperBeds") as HTMLInputElement).value = String(camper.beds);
        (form.elements.namedItem("camperLicense") as HTMLSelectElement).value = camper.required_license;
        (form.elements.namedItem("camperPower") as HTMLInputElement).value = String(camper.engine_power || 100);
        (form.elements.namedItem("camperFuel") as HTMLSelectElement).value = camper.fuel_type;
        (form.elements.namedItem("camperConsumption") as HTMLInputElement).value = String(camper.fuel_consumption || 8.0);
        (form.elements.namedItem("camperTowHitch") as HTMLInputElement).checked = !!camper.has_tow_hitch;
        (form.elements.namedItem("camperLength") as HTMLInputElement).value = String(camper.length_cm || 500);
        (form.elements.namedItem("camperWidth") as HTMLInputElement).value = String(camper.width_cm || 200);
        (form.elements.namedItem("camperHeight") as HTMLInputElement).value = String(camper.height_cm || 200);
        (form.elements.namedItem("camperEmptyWeight") as HTMLInputElement).value = String(camper.empty_weight_kg || 2000);
        (form.elements.namedItem("camperMaxWeight") as HTMLInputElement).value = String(camper.max_weight_kg || 3000);
        (form.elements.namedItem("camperImage") as HTMLInputElement).value = camper.image_url || "";
        (form.elements.namedItem("camperShortDesc") as HTMLInputElement).value = camper.short_desc || "";
        (form.elements.namedItem("camperDesc") as HTMLTextAreaElement).value = camper.description || "";
      }
    } else {
      title.textContent = "Camper hinzufügen";
      submitBtn.textContent = "Camper anlegen";
    }

    modal.classList.remove("d-none");
    backdrop.classList.remove("d-none");
  }

  function closeModal() {
    const modal = container.querySelector("#crud-modal") as HTMLElement;
    const backdrop = container.querySelector("#crud-modal-backdrop") as HTMLElement;
    modal.classList.add("d-none");
    backdrop.classList.add("d-none");
    activeEditId = null;
  }

  function handleFormSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;

    const newCamperData = {
      name: (form.elements.namedItem("camperName") as HTMLInputElement).value,
      manufacturer: (form.elements.namedItem("camperManufacturer") as HTMLSelectElement).value as any,
      price_per_night_base: parseFloat((form.elements.namedItem("camperPrice") as HTMLInputElement).value),
      cleaning_fee: parseFloat((form.elements.namedItem("camperCleaning") as HTMLInputElement).value),
      deposit_amount: parseFloat((form.elements.namedItem("camperDeposit") as HTMLInputElement).value),
      beds: parseInt((form.elements.namedItem("camperBeds") as HTMLInputElement).value),
      required_license: (form.elements.namedItem("camperLicense") as HTMLSelectElement).value,
      engine_power: parseInt((form.elements.namedItem("camperPower") as HTMLInputElement).value),
      fuel_type: (form.elements.namedItem("camperFuel") as HTMLSelectElement).value as any,
      fuel_consumption: parseFloat((form.elements.namedItem("camperConsumption") as HTMLInputElement).value),
      has_tow_hitch: (form.elements.namedItem("camperTowHitch") as HTMLInputElement).checked,
      length_cm: parseInt((form.elements.namedItem("camperLength") as HTMLInputElement).value),
      width_cm: parseInt((form.elements.namedItem("camperWidth") as HTMLInputElement).value),
      height_cm: parseInt((form.elements.namedItem("camperHeight") as HTMLInputElement).value),
      empty_weight_kg: parseInt((form.elements.namedItem("camperEmptyWeight") as HTMLInputElement).value),
      max_weight_kg: parseInt((form.elements.namedItem("camperMaxWeight") as HTMLInputElement).value),
      image_url: (form.elements.namedItem("camperImage") as HTMLInputElement).value,
      short_desc: (form.elements.namedItem("camperShortDesc") as HTMLInputElement).value,
      description: (form.elements.namedItem("camperDesc") as HTMLTextAreaElement).value,
      features_list: ["Küche", "Heizung", "Klimaanlage"],
      created_at: new Date().toISOString(),
      max_towing_capacity_kg: 0
    };

    const allCampers = getMockCampers();

    if (activeEditId) {
      const idx = allCampers.findIndex(c => c.id === activeEditId);
      if (idx !== -1) {
        allCampers[idx] = {
          ...allCampers[idx],
          ...newCamperData
        };
      }
    } else {
      const newCamper: MockCamper = {
        id: `camper-${Date.now()}`,
        owner_id: ownerId,
        is_blocked: false,
        ...newCamperData
      };
      allCampers.push(newCamper);
    }

    saveMockCampers(allCampers);
    campers = allCampers.filter(c => c.owner_id === ownerId || c.owner_id === "user-1");

    renderTable();
    closeModal();
    onDataChanged();
  }

  function toggleBlock(id: string) {
    const all = getMockCampers();
    const idx = all.findIndex(c => c.id === id);
    if (idx !== -1) {
      all[idx].is_blocked = !all[idx].is_blocked;
      saveMockCampers(all);
      campers = all.filter(c => c.owner_id === ownerId || c.owner_id === "user-1");
      renderTable();
      onDataChanged();
    }
  }

  function deleteCamper(id: string) {
    if (confirm("Möchtest du dieses Fahrzeug wirklich löschen?")) {
      const all = getMockCampers();
      const filtered = all.filter(c => c.id !== id);
      saveMockCampers(filtered);
      campers = filtered.filter(c => c.owner_id === ownerId || c.owner_id === "user-1");
      renderTable();
      onDataChanged();
    }
  }

  container = (
    <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h3 className="fw-bold mb-1 text-dark custom-font-base">Fahrzeug-Verwaltung</h3>
          <p className="text-muted mb-0 small">Verwalte deine inserierten Wohnmobile und blockiere sie bei Bedarf für Wartungen.</p>
        </div>
        <button className="btn btn-primary rounded-pill px-4" onclick={() => openModal(null)}>
          + Neuen Camper anlegen
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Fahrzeug</th>
              <th>Hersteller</th>
              <th>Basispreis</th>
              <th>Schlafplätze</th>
              <th>Führerschein</th>
              <th>Status</th>
              <th className="text-end">Aktionen</th>
            </tr>
          </thead>
          <tbody id="camper-crud-tbody"></tbody>
        </table>
      </div>

      <div className="modal-backdrop fade show d-none" id="crud-modal-backdrop" style={{ zIndex: 1040 }}></div>
      <div className="modal fade show d-none" id="crud-modal" tabIndex={-1} style={{ display: "block", zIndex: 1050 }}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content rounded-4 border-0 shadow-lg">
            <div className="modal-header border-bottom px-4">
              <h5 className="modal-title fw-bold text-dark custom-font-base" id="modal-title-text">Camper hinzufügen</h5>
              <button type="button" className="btn-close" aria-label="Schließen" onclick={closeModal}></button>
            </div>
            <form id="camper-form" onsubmit={handleFormSubmit}>
              <div className="modal-body p-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small text-uppercase text-muted fw-bold">Name des Campers</label>
                    <input type="text" name="camperName" className="form-control" required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-uppercase text-muted fw-bold">Hersteller</label>
                    <select name="camperManufacturer" className="form-select" required>
                      <option value="Folkwagen">Folkwagen</option>
                      <option value="Mercedenz-Bonz">Mercedenz-Bonz</option>
                      <option value="Avdi">Avdi</option>
                      <option value="DYB">DYB</option>
                      <option value="Tayota">Tayota</option>
                      <option value="Lamberghini">Lamberghini</option>
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small text-uppercase text-muted fw-bold">Basispreis / Nacht (€)</label>
                    <input type="number" name="camperPrice" className="form-control" min="1" required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small text-uppercase text-muted fw-bold">Reinigungsgebühr (€)</label>
                    <input type="number" name="camperCleaning" className="form-control" min="0" required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small text-uppercase text-muted fw-bold">Kaution (€)</label>
                    <input type="number" name="camperDeposit" className="form-control" min="0" required />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small text-uppercase text-muted fw-bold">Bettenanzahl</label>
                    <input type="number" name="camperBeds" className="form-control" min="1" required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small text-uppercase text-muted fw-bold">Führerscheinklasse</label>
                    <select name="camperLicense" className="form-select" required>
                      <option value="B">Klasse B</option>
                      <option value="B96">Klasse B96</option>
                      <option value="BE">Klasse BE</option>
                      <option value="C1">Klasse C1</option>
                      <option value="C1E">Klasse C1E</option>
                      <option value="C">Klasse C</option>
                      <option value="CE">Klasse CE</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small text-uppercase text-muted fw-bold">Motorleistung (PS)</label>
                    <input type="number" name="camperPower" className="form-control" min="1" required />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small text-uppercase text-muted fw-bold">Kraftstoffart</label>
                    <select name="camperFuel" className="form-select" required>
                      <option value="Diesel">Diesel</option>
                      <option value="Super">Super Benzin</option>
                      <option value="Super Plus">Super Plus</option>
                      <option value="Super E10">Super E10</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small text-uppercase text-muted fw-bold">Verbrauch (l/100km)</label>
                    <input type="number" name="camperConsumption" step="0.1" className="form-control" min="0" required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small text-uppercase text-muted fw-bold">Anhängerkupplung</label>
                    <div className="form-check form-switch mt-2">
                      <input className="form-check-input" type="checkbox" name="camperTowHitch" id="formTowHitch" />
                      <label className="form-check-label text-muted small" htmlFor="formTowHitch">Vorhanden</label>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small text-uppercase text-muted fw-bold">Länge (cm)</label>
                    <input type="number" name="camperLength" className="form-control" min="1" required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small text-uppercase text-muted fw-bold">Breite (cm)</label>
                    <input type="number" name="camperWidth" className="form-control" min="1" required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small text-uppercase text-muted fw-bold">Höhe (cm)</label>
                    <input type="number" name="camperHeight" className="form-control" min="1" required />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small text-uppercase text-muted fw-bold">Leergewicht (kg)</label>
                    <input type="number" name="camperEmptyWeight" className="form-control" min="1" required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-uppercase text-muted fw-bold">Zul. Gesamtgewicht (kg)</label>
                    <input type="number" name="camperMaxWeight" className="form-control" min="1" required />
                  </div>

                  <div className="col-12">
                    <label className="form-label small text-uppercase text-muted fw-bold">Bild URL</label>
                    <input type="url" name="camperImage" className="form-control" placeholder="https://..." required />
                  </div>

                  <div className="col-12">
                    <label className="form-label small text-uppercase text-muted fw-bold">Kurzbeschreibung</label>
                    <input type="text" name="camperShortDesc" className="form-control" placeholder="Kurze Zusammenfassung für die Kartenansicht" required />
                  </div>

                  <div className="col-12">
                    <label className="form-label small text-uppercase text-muted fw-bold">Ausführliche Beschreibung</label>
                    <textarea name="camperDesc" className="form-control" rows={4} placeholder="Detaillierte Beschreibung des Fahrzeugs..." required></textarea>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top px-4">
                <button type="button" className="btn btn-light rounded-pill px-3" onclick={closeModal}>Abbrechen</button>
                <button type="submit" className="btn btn-primary rounded-pill px-4" id="submit-btn-text">Speichern</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  ) as HTMLElement;

  setTimeout(renderTable, 0);

  return container;
}
