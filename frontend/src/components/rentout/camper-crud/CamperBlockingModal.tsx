import { createElement } from "../../../utils/createElement.ts";

/** Props for {@link CamperBlockingModal}. */
interface CamperBlockingModalProps {
  /** Called when the modal should close (the "X" button). */
  onClose: () => void;
  /** Called on the "add blocking" form's submit event. */
  onSubmit: (e: Event) => void;
}

/**
 * The "manage blocked periods" modal for a single camper: a small form to
 * add a new blocked date range (with an optional reason), and a list area
 * where the camper's existing blockings are shown.
 *
 * This component only builds the static markup. `CamperCRUD.tsx` shows/hides
 * the modal, loads the camper's blockings, and renders them into
 * `#blockings-list` (via `BlockingsTable`). It also writes error messages
 * into `#blocking-error-container` after a failed submit, so that id and the
 * `blockStart`/`blockEnd`/`blockReason` field names must stay unchanged.
 *
 * @param onClose Handler for the close ("X") button.
 * @param onSubmit Handler for the "add blocking" form's submit event.
 * @returns The blocking modal `<div>` element.
 */
export function CamperBlockingModal({ onClose, onSubmit }: CamperBlockingModalProps) {
  return (
    <div className="modal fade show d-none camper-modal-overlay" id="blocking-modal" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 border-0 shadow-lg bg-beige">
          <div className="modal-header border-bottom px-4 bg-light rounded-top-4">
            <h5 className="modal-title fw-bold text-dark custom-font-base">Sperrzeiten verwalten</h5>
            <button type="button" className="btn-close" aria-label="Schließen" onclick={onClose}></button>
          </div>
          <div className="modal-body p-4">
            <form id="blocking-form" onsubmit={onSubmit} className="mb-4">
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
  ) as HTMLElement;
}
