import { createElement, Fragment } from "../../../utils/createElement.ts";

/** Props for {@link CamperFormModal}. */
interface CamperFormModalProps {
  /** Called when the modal should close (the "X" button or "Abbrechen"). */
  onClose: () => void;
  /** Called on the form's submit event (creates or updates a camper). */
  onSubmit: (e: Event) => void;
  /** Called when the image file input's selection changes. */
  onImageChange: (e: Event) => void;
}

/**
 * The "create/edit camper" modal, including its backdrop and the full form
 * covering all of a camper's fields (name, manufacturer, pricing, specs,
 * dimensions, images, and descriptions).
 *
 * This component only builds the static markup. Showing/hiding the modal,
 * populating it with an existing camper's data, and reacting to form
 * submission all happen in `CamperCRUD.tsx`, which looks up `#crud-modal`,
 * `#crud-modal-backdrop`, `#modal-title-text`, `#submit-btn-text`, and
 * `#camper-form` by id, and reads/writes individual fields via
 * `form.elements.namedItem(...)`. Because of that, every field's `name`
 * attribute and every id here must stay exactly as they are.
 *
 * @param onClose Handler for the close ("X") and "Abbrechen" buttons.
 * @param onSubmit Handler for the form's submit event.
 * @param onImageChange Handler for the image file input's change event.
 * @returns A `DocumentFragment` containing the backdrop and modal `<div>`s.
 */
export function CamperFormModal({ onClose, onSubmit, onImageChange }: CamperFormModalProps) {
  return (
    <Fragment>
      <div className="modal-backdrop fade show d-none camper-modal-backdrop" id="crud-modal-backdrop"></div>
      <div className="modal fade show d-none camper-modal-overlay" id="crud-modal" tabIndex={-1}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content rounded-4 border-0 shadow-lg bg-beige">
            <div className="modal-header border-bottom px-4">
              <h5 className="modal-title fw-bold text-dark custom-font-base" id="modal-title-text">Camper hinzufügen</h5>
              <button type="button" className="btn-close" aria-label="Schließen" onclick={onClose}></button>
            </div>
            <form id="camper-form" onsubmit={onSubmit}>
              <div className="modal-body p-4 camper-form-modal-body">
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
                    <input type="file" name="camperImages" className="form-control" accept="image/*" multiple onchange={onImageChange} />
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
                <button type="button" className="btn btn-light rounded-pill px-3" onclick={onClose}>Abbrechen</button>
                <button type="submit" className="btn btn-primary rounded-pill px-4" id="submit-btn-text">Speichern</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
