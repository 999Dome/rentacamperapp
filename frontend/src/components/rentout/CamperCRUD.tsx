import { createElement } from "../../utils/createElement.ts";
import { getAllCampers, createCamper, updateCamper, deleteCamper as apiDeleteCamper } from "../../api/campersAPI.ts";
import { uploadCamperImages } from "../../api/camperImagesAPI.ts";
import { assignCamperOwner, removeCamperOwner } from "../../api/camperOwnerAPI.ts";
import { fetchCamperBlockings, createCamperBlocking, deleteCamperBlocking } from "../../api/camperBlockingsAPI.ts";
import type { BlockingResponse } from "../../infrastructure/api/camper-blockings-api-client.ts";
import type { MockCamper } from "../../utils/mockData.ts";
import { CamperListItem } from "./camper-crud/CamperListItem.tsx";
import { ImagePreviewThumbnail } from "./camper-crud/ImagePreviewThumbnail.tsx";
import { CamperFormModal } from "./camper-crud/CamperFormModal.tsx";
import { CamperBlockingModal } from "./camper-crud/CamperBlockingModal.tsx";
import { BlockingsTable } from "./camper-crud/BlockingsTable.tsx";

/** Props for {@link CamperCRUD}. */
interface CamperCRUDProps {
  /** Id of the owner (provider) whose campers are managed here. */
  ownerId: string;
  /** Called after any change that other parts of the rentout page should react to (create/update/delete a camper or a blocking). */
  onDataChanged: () => void;
}

/**
 * The "Fahrzeug-Verwaltung" (vehicle management) section of the rentout
 * page. Lists all campers owned by `ownerId`, and lets the owner create,
 * edit, or delete a camper, upload photos for it, and manage its blocked
 * (unavailable) date ranges.
 *
 * This component owns all of the mutable state and event handlers; the
 * actual markup for the list items, image thumbnails, modals, and blockings
 * table is built by the sub-components in `./camper-crud/`.
 *
 * @param ownerId Id of the owner whose campers are managed.
 * @param onDataChanged Called after a camper or blocking is created, updated, or deleted.
 * @returns The section's root `<div>` element.
 */
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
      previewContainer.appendChild(
        ImagePreviewThumbnail({ url, index, onRemove: removeFile })
      );
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
      listContainer.appendChild(
        CamperListItem({
          camper,
          onManageBlockings: openBlockingModal,
          onEdit: openModal,
          onDelete: deleteCamper
        })
      );
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

    list.appendChild(
      BlockingsTable({ blockings: currentBlockings, onDelete: handleDeleteBlocking })
    );
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
          <h3 className="fw-bold mb-1 text-white custom-font-burbank letter-spacing-1px">Fahrzeug-Verwaltung</h3>
          <p className="text-white-50 mb-0 small">Verwalte deine inserierten Wohnmobile und blockiere sie bei Bedarf für Wartungen.</p>
        </div>
        <button className="btn btn-primary rounded-pill px-4" onclick={() => openModal(null)}>
          + Neuen Camper anlegen
        </button>
      </div>

      <div id="camper-list" className="d-flex flex-column gap-3"></div>

      <CamperFormModal onClose={closeModal} onSubmit={handleFormSubmit} onImageChange={handleImageChange} />

      <CamperBlockingModal onClose={closeBlockingModal} onSubmit={handleBlockingSubmit} />
    </div>
  ) as HTMLElement;

  loadCampers();

  return container;
}
