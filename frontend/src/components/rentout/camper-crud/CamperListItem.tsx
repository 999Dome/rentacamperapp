import { createElement } from "../../../utils/createElement.ts";
import type { MockCamper } from "../../../utils/mockData.ts";

/** Props for {@link CamperListItem}. */
interface CamperListItemProps {
  /** The camper record to display. */
  camper: MockCamper;
  /** Called with the camper's id when the "Sperrzeiten" button is clicked. */
  onManageBlockings: (camperId: string) => void;
  /** Called with the camper's id when the "Bearbeiten" button is clicked. */
  onEdit: (camperId: string) => void;
  /** Called with the camper's id when the "Löschen" button is clicked. */
  onDelete: (camperId: string) => void;
}

/**
 * One camper's card in the "Fahrzeug-Verwaltung" list. Shows a header with
 * the camper's id and an active/blocked status badge, a body with its
 * image, name, specs and nightly price, and a footer with buttons to
 * manage blocked periods, edit, or delete the camper.
 *
 * @param camper The camper record to display.
 * @param onManageBlockings Called with the camper's id when "Sperrzeiten" is clicked.
 * @param onEdit Called with the camper's id when "Bearbeiten" is clicked.
 * @param onDelete Called with the camper's id when "Löschen" is clicked.
 * @returns The camper card `<div>` element.
 */
export function CamperListItem({ camper, onManageBlockings, onEdit, onDelete }: CamperListItemProps) {
  let statusBadgeClass = "bg-success-subtle text-success";
  let statusBadgeText = "Aktiv";

  if (camper.is_blocked) {
    statusBadgeClass = "bg-danger-subtle text-danger";
    statusBadgeText = "Gesperrt";
  }

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-3 bg-white transition-transform">
      {/* Card Header */}
      <div className="card-header border-0 bg-light d-flex justify-content-between align-items-center px-4 py-3">
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small">Camper-ID:</span>
          <span className="fw-bold text-dark small">#{camper.id.slice(0, 8)}</span>
        </div>
        <span className={`badge rounded-pill px-3 py-1 fs-12px ${statusBadgeClass}`}>{statusBadgeText}</span>
      </div>

      {/* Card Body */}
      <div className="card-body p-4">
        <div className="row g-3 align-items-center">

          {/* Camper Image & Name */}
          <div className="col-12 col-md-4">
            <span className="text-muted small text-uppercase d-block mb-1 fs-11px">Fahrzeug</span>
            <div className="d-flex align-items-center gap-3">
              <img
                src={camper.image_url || "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7"}
                alt={camper.name || ""}
                className="rounded-3 shadow-sm camper-list-thumb"
              />
              <div>
                <h4 className="fw-bold text-dark mb-0 custom-font-base">{camper.name}</h4>
                <span className="text-muted small">{camper.manufacturer}</span>
              </div>
            </div>
          </div>

          {/* Specs / Details */}
          <div className="col-12 col-md-5">
            <span className="text-muted small text-uppercase d-block mb-1 fs-11px">Ausstattung &amp; Führerschein</span>
            <div className="d-flex align-items-center gap-3 fw-bold text-dark mb-2 fs-15px">
              <span><i className="bi bi-person-fill text-custom-light-blue me-1"></i>{camper.beds} Betten</span>
              <span><i className="bi bi-card-list text-custom-light-blue me-1"></i>Klasse {camper.required_license}</span>
              <span><i className="bi bi-fuel-pump-fill text-custom-light-blue me-1"></i>{camper.fuel_type}</span>
            </div>
            <div className="small text-muted fs-12px">
              <strong>Motor:</strong> {camper.engine_power} PS ({camper.fuel_consumption} l/100km)
              {camper.has_tow_hitch && <span className="ms-2 badge bg-light text-dark border">Anhängerkupplung</span>}
            </div>
          </div>

          {/* Nightly price */}
          <div className="col-12 col-md-3 text-md-end">
            <span className="text-muted small text-uppercase d-block mb-1 fs-11px">Basispreis</span>
            <h3 className="fw-bold text-dark mb-0">{camper.price_per_night_base.toFixed(2)} €</h3>
            <span className="text-muted small">pro Nacht</span>
          </div>

        </div>
      </div>

      {/* Card Footer */}
      <div className="card-footer bg-white border-0 px-4 py-3 d-flex justify-content-end align-items-center border-top">
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-warning rounded-pill px-3 fs-12px" onclick={() => onManageBlockings(camper.id)}>
            Sperrzeiten
          </button>
          <button className="btn btn-sm btn-outline-primary rounded-pill px-3 fs-12px" onclick={() => onEdit(camper.id)}>
            Bearbeiten
          </button>
          <button className="btn btn-sm btn-outline-danger rounded-pill px-3 fs-12px" onclick={() => onDelete(camper.id)}>
            Löschen
          </button>
        </div>
      </div>
    </div>
  ) as HTMLElement;
}
