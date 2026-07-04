import { createElement } from "../../utils/createElement.ts";
import { getAllCampers, createCamper, updateCamper, deleteCamper as apiDeleteCamper } from "../../api/campersAPI.ts";
import { uploadCamperImages } from "../../api/camperImagesAPI.ts";
import { assignCamperOwner, removeCamperOwner } from "../../api/camperOwnerAPI.ts";
import { fetchCamperBlockings, createCamperBlocking, deleteCamperBlocking } from "../../api/camperBlockingsAPI.ts";
import type { BlockingResponse } from "../../infrastructure/api/camper-blockings-api-client.ts";
import type { MockCamper } from "../../utils/mockData.ts";

interface CamperCRUDProps {
  ownerId: string;
  onDataChanged: () => void;
}

export function CamperCRUD({ ownerId, onDataChanged }: CamperCRUDProps) {
  let campers: MockCamper[] = [];
  let activeEditId: string | null = null;
  let activeBlockingCamperId: string | null = null;
  let currentBlockings: BlockingResponse[] = [];
  let selectedFiles: File[] = [];
  let objectUrls: string[] = [];

  function handleImageChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      const newFiles = Array.from(input.files);
      selectedFiles = [...selectedFiles, ...newFiles];
      
      const newUrls = newFiles.map(f => URL.createObjectURL(f));
      objectUrls = [...objectUrls, ...newUrls];
      
      renderImagePreviews();
      input.value = ''; // Reset input so same file can be selected again if needed
    }
  }

  function removeFile(index: number) {
    selectedFiles.splice(index, 1);
    URL.revokeObjectURL(objectUrls[index]);
    objectUrls.splice(index, 1);
    renderImagePreviews();
  }

  function renderImagePreviews() {
    const previewContainer = container.querySelector("#image-preview-container");
    if (!previewContainer) return;
    previewContainer.innerHTML = '';

    objectUrls.forEach((url, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "position-relative";
      wrapper.style.width = "80px";
      wrapper.style.height = "80px";

      const img = document.createElement("img");
      img.src = url;
      img.className = "w-100 h-100 rounded-3 object-fit-cover shadow-sm border";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-danger btn-sm position-absolute rounded-circle p-0 d-flex align-items-center justify-content-center shadow";
      btn.style.width = "20px";
      btn.style.height = "20px";
      btn.style.top = "-5px";
      btn.style.right = "-5px";
      btn.innerHTML = "&times;";
      btn.onclick = () => removeFile(index);

      wrapper.appendChild(img);
      wrapper.appendChild(btn);
      previewContainer.appendChild(wrapper);
    });
  }

  async function loadCampers() {
    try {
      const all = await getAllCampers();
      campers = all.filter(c => c.ownerId === ownerId || c.owner_id === ownerId);
      renderCampersList();
    } catch (err) {
      console.error(err);
    }
  }

  function renderCampersList() {
    const listContainer = container.querySelector("#camper-list") as HTMLElement;
    if (!listContainer) return;
    listContainer.innerHTML = "";

    if (campers.length === 0) {
      listContainer.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <i class="bi bi-truck fs-1 text-muted mb-3 d-block"></i>
          <span class="text-muted fs-5">Keine inserierten Fahrzeuge gefunden.</span>
        </div>
      `;
      return;
    }

    campers.forEach((camper) => {
      let statusBadgeClass = "bg-success-subtle text-success";
      let statusBadgeText = "Aktiv";

      if (camper.is_blocked) {
        statusBadgeClass = "bg-danger-subtle text-danger";
        statusBadgeText = "Gesperrt";
      }

      const cardEl = (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-3 bg-white" style={{ transition: "transform 0.2s ease" }}>
          {/* Card Header */}
          <div className="card-header border-0 bg-light d-flex justify-content-between align-items-center px-4 py-3">
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small">Camper-ID:</span>
              <span className="fw-bold text-dark small">#{camper.id.slice(0, 8)}</span>
            </div>
            <span className={`badge rounded-pill px-3 py-1 ${statusBadgeClass}`} style={{ fontSize: "12px" }}>{statusBadgeText}</span>
          </div>

          {/* Card Body */}
          <div className="card-body p-4">
            <div className="row g-3 align-items-center">
              
              {/* Camper Image & Name */}
              <div className="col-12 col-md-4">
                <span className="text-muted small text-uppercase d-block mb-1" style={{ fontSize: "11px" }}>Fahrzeug</span>
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={camper.image_url || "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7"}
                    alt={camper.name || ""}
                    className="rounded-3 shadow-sm"
                    style={{ width: "80px", height: "60px", objectFit: "cover" }}
                  />
                  <div>
                    <h4 className="fw-bold text-dark mb-0 custom-font-base">{camper.name}</h4>
                    <span className="text-muted small">{camper.manufacturer}</span>
                  </div>
                </div>
              </div>

              {/* Specs / Details */}
              <div className="col-12 col-md-5">
                <span className="text-muted small text-uppercase d-block mb-1" style={{ fontSize: "11px" }}>Ausstattung &amp; Führerschein</span>
                <div className="d-flex align-items-center gap-3 fw-bold text-dark mb-2" style={{ fontSize: "15px" }}>
                  <span><i className="bi bi-person-fill text-custom-light-blue me-1"></i>{camper.beds} Betten</span>
                  <span><i className="bi bi-card-list text-custom-light-blue me-1"></i>Klasse {camper.required_license}</span>
                  <span><i className="bi bi-fuel-pump-fill text-custom-light-blue me-1"></i>{camper.fuel_type}</span>
                </div>
                <div className="small text-muted" style={{ fontSize: "12px" }}>
                  <strong>Motor:</strong> {camper.engine_power} PS ({camper.fuel_consumption} l/100km)
                  {camper.has_tow_hitch && <span className="ms-2 badge bg-light text-dark border">Anhängerkupplung</span>}
                </div>
              </div>

              {/* Nightly price */}
              <div className="col-12 col-md-3 text-md-end">
                <span className="text-muted small text-uppercase d-block mb-1" style={{ fontSize: "11px" }}>Basispreis</span>
                <h3 className="fw-bold text-dark mb-0">{camper.price_per_night_base.toFixed(2)} €</h3>
                <span className="text-muted small">pro Nacht</span>
              </div>

            </div>
          </div>

          {/* Card Footer */}
          <div className="card-footer bg-white border-0 px-4 py-3 d-flex justify-content-end align-items-center border-top">
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-warning rounded-pill px-3" onclick={() => openBlockingModal(camper.id)} style={{ fontSize: "12px" }}>
                Sperrzeiten
              </button>
              <button className="btn btn-sm btn-outline-primary rounded-pill px-3" onclick={() => openModal(camper.id)} style={{ fontSize: "12px" }}>
                Bearbeiten
              </button>
              <button className="btn btn-sm btn-outline-danger rounded-pill px-3" onclick={() => deleteCamper(camper.id)} style={{ fontSize: "12px" }}>
                Löschen
              </button>
            </div>
          </div>
        </div>
      ) as HTMLElement;

      listContainer.appendChild(cardEl);
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
    selectedFiles = [];
    objectUrls.forEach(url => URL.revokeObjectURL(url));
    objectUrls = [];
    renderImagePreviews();

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

  async function handleFormSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;

    const newCamperData = {
      name: (form.elements.namedItem("camperName") as HTMLInputElement).value,
      manufacturer: (form.elements.namedItem("camperManufacturer") as HTMLSelectElement).value as MockCamper["manufacturer"],
      price_per_night_base: parseFloat((form.elements.namedItem("camperPrice") as HTMLInputElement).value),
      cleaning_fee: parseFloat((form.elements.namedItem("camperCleaning") as HTMLInputElement).value),
      deposit_amount: parseFloat((form.elements.namedItem("camperDeposit") as HTMLInputElement).value),
      beds: parseInt((form.elements.namedItem("camperBeds") as HTMLInputElement).value),
      required_license: (form.elements.namedItem("camperLicense") as HTMLSelectElement).value,
      engine_power: parseInt((form.elements.namedItem("camperPower") as HTMLInputElement).value),
      fuel_type: (form.elements.namedItem("camperFuel") as HTMLSelectElement).value as MockCamper["fuel_type"],
      fuel_consumption: parseFloat((form.elements.namedItem("camperConsumption") as HTMLInputElement).value),
      has_tow_hitch: (form.elements.namedItem("camperTowHitch") as HTMLInputElement).checked,
      length_cm: parseInt((form.elements.namedItem("camperLength") as HTMLInputElement).value),
      width_cm: parseInt((form.elements.namedItem("camperWidth") as HTMLInputElement).value),
      height_cm: parseInt((form.elements.namedItem("camperHeight") as HTMLInputElement).value),
      empty_weight_kg: parseInt((form.elements.namedItem("camperEmptyWeight") as HTMLInputElement).value),
      max_weight_kg: parseInt((form.elements.namedItem("camperMaxWeight") as HTMLInputElement).value),
      image_url: "", // Ignored by backend now
      short_desc: (form.elements.namedItem("camperShortDesc") as HTMLInputElement).value,
      description: (form.elements.namedItem("camperDesc") as HTMLTextAreaElement).value,
      features_list: ["Küche", "Heizung", "Klimaanlage"],
      created_at: new Date().toISOString(),
      max_towing_capacity_kg: 0
    };

    try {
      let currentCamperId = activeEditId;
      if (activeEditId) {
        await updateCamper(activeEditId, newCamperData);
      } else {
        const createData = {
          ...newCamperData
        };
        const created = await createCamper(createData);
        if (created && created.id) {
          currentCamperId = created.id;
          await assignCamperOwner({ camper_id: created.id, user_id: ownerId });
        }
      }

      if (currentCamperId && selectedFiles.length > 0) {
        try {
          await uploadCamperImages(currentCamperId, selectedFiles);
        } catch (uploadErr) {
          console.error(uploadErr);
          alert("Fehler beim Hochladen der Bilder. Die restlichen Camper-Daten wurden gespeichert.");
        }
      }

      await loadCampers();
      closeModal();
      onDataChanged();
    } catch (err) {
      console.error(err);
      alert("Fehler beim Speichern des Campers.");
    }
  }

  async function loadBlockings(camperId: string) {
    try {
      currentBlockings = await fetchCamperBlockings(ownerId, camperId);
      renderBlockingsList();
    } catch (err) {
      console.error(err);
      const list = container.querySelector("#blockings-list") as HTMLElement;
      list.innerHTML = `<div class="alert alert-danger">Fehler beim Laden der Sperrzeiten.</div>`;
    }
  }

  function renderBlockingsList() {
    const list = container.querySelector("#blockings-list") as HTMLElement;
    list.innerHTML = "";

    if (currentBlockings.length === 0) {
      list.innerHTML = `<p class="text-muted small mb-0">Keine aktiven Sperrzeiten vorhanden.</p>`;
      return;
    }

    const table = document.createElement("table");
    table.className = "table table-sm table-hover mt-3";
    table.innerHTML = `
      <thead>
        <tr>
          <th>Von</th>
          <th>Bis</th>
          <th>Grund</th>
          <th class="text-end"></th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector("tbody") as HTMLElement;
    currentBlockings.forEach(b => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${b.start_date}</td>
        <td>${b.end_date}</td>
        <td>${b.reason || '-'}</td>
      `;
      const tdAction = document.createElement("td");
      tdAction.className = "text-end";
      const delBtn = document.createElement("button");
      delBtn.className = "btn btn-sm btn-outline-danger border-0";
      delBtn.innerHTML = `<i class="bi bi-trash"></i>`;
      delBtn.onclick = () => handleDeleteBlocking(b.id);
      tdAction.appendChild(delBtn);
      tr.appendChild(tdAction);
      tbody.appendChild(tr);
    });

    list.appendChild(table);
  }

  async function openBlockingModal(camperId: string) {
    activeBlockingCamperId = camperId;
    const modal = container.querySelector("#blocking-modal") as HTMLElement;
    const backdrop = container.querySelector("#crud-modal-backdrop") as HTMLElement;
    const form = container.querySelector("#blocking-form") as HTMLFormElement;
    
    form.reset();
    const errorContainer = container.querySelector("#blocking-error-container") as HTMLElement;
    errorContainer.innerHTML = "";

    modal.classList.remove("d-none");
    backdrop.classList.remove("d-none");

    const list = container.querySelector("#blockings-list") as HTMLElement;
    list.innerHTML = `<div class="spinner-border spinner-border-sm text-primary"></div>`;
    
    await loadBlockings(camperId);
  }

  function closeBlockingModal() {
    const modal = container.querySelector("#blocking-modal") as HTMLElement;
    const backdrop = container.querySelector("#crud-modal-backdrop") as HTMLElement;
    modal.classList.add("d-none");
    backdrop.classList.add("d-none");
    activeBlockingCamperId = null;
    currentBlockings = [];
  }

  async function handleBlockingSubmit(e: Event) {
    e.preventDefault();
    if (!activeBlockingCamperId) return;

    const form = e.target as HTMLFormElement;
    const startDate = (form.elements.namedItem("blockStart") as HTMLInputElement).value;
    const endDate = (form.elements.namedItem("blockEnd") as HTMLInputElement).value;
    const reason = (form.elements.namedItem("blockReason") as HTMLInputElement).value;

    const errorContainer = container.querySelector("#blocking-error-container") as HTMLElement;
    errorContainer.innerHTML = "";

    try {
      await createCamperBlocking(ownerId, {
        camper_id: activeBlockingCamperId,
        start_date: startDate,
        end_date: endDate,
        reason: reason || undefined
      });
      form.reset();
      await loadBlockings(activeBlockingCamperId);
    } catch (err) {
      console.error(err);
      let displayMsg = "Fehler beim Erstellen der Sperrzeit.";
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (errorMsg.includes("400")) {
        try {
          const match = errorMsg.match(/\{.*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]) as { message?: string | string[] };
            if (parsed.message) displayMsg = Array.isArray(parsed.message) ? parsed.message.join(', ') : parsed.message;
          }
        } catch {
          // ignore
        }
      }
      errorContainer.innerHTML = `
        <div class="alert alert-danger py-2 px-3 mt-3 mb-0 small">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          ${displayMsg}
        </div>
      `;
    }
  }

  async function handleDeleteBlocking(blockingId: string) {
    if (!confirm("Sperrzeit wirklich löschen?")) return;
    try {
      await deleteCamperBlocking(ownerId, blockingId);
      if (activeBlockingCamperId) {
        await loadBlockings(activeBlockingCamperId);
      }
    } catch (err) {
      console.error(err);
      alert("Fehler beim Löschen der Sperrzeit.");
    }
  }

  async function deleteCamper(id: string) {
    if (confirm("Möchtest du dieses Fahrzeug wirklich löschen?")) {
      try {
        await apiDeleteCamper(id);
        await removeCamperOwner(id).catch(() => {}); // Optional cleanup
        await loadCampers();
        onDataChanged();
      } catch (err) {
        console.error(err);
        alert("Fehler beim Löschen des Campers.");
      }
    }
  }

  const container = (
    <div className="p-0">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h3 className="fw-bold mb-1 text-white custom-font-burbank" style={{ letterSpacing: "1px" }}>Fahrzeug-Verwaltung</h3>
          <p className="text-white-50 mb-0 small">Verwalte deine inserierten Wohnmobile und blockiere sie bei Bedarf für Wartungen.</p>
        </div>
        <button className="btn btn-primary rounded-pill px-4" onclick={() => openModal(null)}>
          + Neuen Camper anlegen
        </button>
      </div>

      <div id="camper-list" className="d-flex flex-column gap-3"></div>

      <div className="modal-backdrop fade show d-none" id="crud-modal-backdrop" style={{ zIndex: 1040 }}></div>
      <div className="modal fade show d-none" id="crud-modal" tabIndex={-1} style={{ display: "block", zIndex: 1050 }}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content rounded-4 border-0 shadow-lg bg-beige">
            <div className="modal-header border-bottom px-4">
              <h5 className="modal-title fw-bold text-dark custom-font-base" id="modal-title-text">Camper hinzufügen</h5>
              <button type="button" className="btn-close" aria-label="Schließen" onclick={closeModal}></button>
            </div>
            <form id="camper-form" onsubmit={handleFormSubmit}>
              <div className="modal-body p-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                {/* ... (Existing form fields omitted for brevity, but I will include them full in the replacement to avoid breaking) */}
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
                    <label className="form-label small text-uppercase text-muted fw-bold">Bilder</label>
                    <input type="file" name="camperImages" className="form-control" accept="image/*" multiple onchange={handleImageChange} />
                    <div id="image-preview-container" className="d-flex flex-wrap gap-2 mt-3"></div>
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

      <div className="modal fade show d-none" id="blocking-modal" tabIndex={-1} style={{ display: "block", zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 border-0 shadow-lg bg-beige">
            <div className="modal-header border-bottom px-4 bg-light rounded-top-4">
              <h5 className="modal-title fw-bold text-dark custom-font-base">Sperrzeiten verwalten</h5>
              <button type="button" className="btn-close" aria-label="Schließen" onclick={closeBlockingModal}></button>
            </div>
            <div className="modal-body p-4">
              <form id="blocking-form" onsubmit={handleBlockingSubmit} className="mb-4">
                <div className="row g-2 align-items-end">
                  <div className="col-md-6">
                    <label className="form-label small text-muted fw-bold">Von</label>
                    <input type="date" name="blockStart" className="form-control form-control-sm" required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-muted fw-bold">Bis</label>
                    <input type="date" name="blockEnd" className="form-control form-control-sm" required />
                  </div>
                  <div className="col-12">
                    <label className="form-label small text-muted fw-bold mt-2">Grund (optional)</label>
                    <input type="text" name="blockReason" className="form-control form-control-sm" placeholder="z. B. Werkstatt, Eigenbedarf" />
                  </div>
                  <div className="col-12 mt-3">
                    <button type="submit" className="btn btn-primary btn-sm w-100 rounded-pill">Zeitraum sperren</button>
                  </div>
                </div>
                <div id="blocking-error-container"></div>
              </form>
              <hr />
              <h6 className="fw-bold mb-3">Aktive Sperrzeiten</h6>
              <div id="blockings-list"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) as HTMLElement;

  loadCampers();

  return container;
}
