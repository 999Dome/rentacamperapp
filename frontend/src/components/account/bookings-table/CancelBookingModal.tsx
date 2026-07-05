import { createElement } from "../../../utils/createElement.ts";

/** Props for {@link CancelBookingModal}. */
interface CancelBookingModalProps {
  /** Called when the user closes the modal without confirming (via the "X" or "Abbrechen" button). */
  onClose: () => void;
  /** Called when the user clicks the "Stornieren" (confirm) button. */
  onConfirm: (e: Event) => void;
}

/**
 * Markup for the "cancel this booking?" confirmation modal shown on the
 * account page's bookings tab. This component only builds the DOM structure;
 * all cancel-flow behavior (opening/closing the modal, calling the cancel
 * API, showing errors) lives in `BookingsTable.tsx` and is wired in through
 * the `onClose`/`onConfirm` callback props.
 *
 * Note: `#cancel-error` (error message) and `#btn-confirm-cancel` (confirm
 * button) keep their ids because `BookingsTable.tsx` looks them up directly
 * to show/hide the error and toggle the button's loading state.
 *
 * @param onClose Handler for the close ("X") and "Abbrechen" buttons.
 * @param onConfirm Handler for the "Stornieren" confirm button.
 * @returns The modal `<div>` element.
 */
export function CancelBookingModal({ onClose, onConfirm }: CancelBookingModalProps) {
  return (
    <div className="modal cancel-modal-overlay" id="cancelBookingModal" tabIndex={-1} aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title text-danger"><i className="bi bi-exclamation-triangle-fill me-2"></i>Buchung stornieren</h5>
            <button type="button" className="btn-close" aria-label="Schließen" onclick={() => onClose()}></button>
          </div>
          <div className="modal-body text-dark">
            <p>Möchtest du diese Buchung wirklich unwiderruflich stornieren?</p>
            <p className="small text-muted">Es wird automatisch ein Stornierungsbeleg generiert und an deine E-Mail-Adresse gesendet.</p>
            <div id="cancel-error" className="text-danger small d-none mt-2"></div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onclick={() => onClose()}>Abbrechen</button>
            <button type="button" className="btn btn-danger" id="btn-confirm-cancel" onclick={(e: Event) => onConfirm(e)}>Stornieren</button>
          </div>
        </div>
      </div>
    </div>
  ) as HTMLElement;
}
