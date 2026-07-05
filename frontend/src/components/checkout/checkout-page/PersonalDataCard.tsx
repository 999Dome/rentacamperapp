import { createElement } from "../../../utils/createElement.ts";
import type { UserProfile } from "./types.ts";

/** Props for {@link PersonalDataCard}. */
interface PersonalDataCardProps {
  /** The logged-in user whose (read-only) data is displayed. */
  user: UserProfile;
}

/**
 * Read-only "Persönliche Daten" card on the checkout page's left column.
 * Shows the user's first/last name, email, and drivers-license class as
 * disabled-looking (but not actually `disabled`) inputs — purely for the
 * user to double-check their details before paying, nothing here is editable.
 *
 * @param props See {@link PersonalDataCardProps}.
 * @returns The card element.
 */
export function PersonalDataCard({ user }: PersonalDataCardProps) {
  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
      <div className="card-body p-4 p-md-5">
        <h4 className="fw-bold mb-4">Persönliche Daten</h4>
        <div className="row g-3">
          <div className="col-sm-6">
            <label className="form-label text-muted small text-uppercase fw-bold">
              Vorname
            </label>
            <input
              type="text"
              className="form-control bg-light"
              value={user.profile?.first_name || user.profile?.firstname || ""}
              readOnly
            />
          </div>
          <div className="col-sm-6">
            <label className="form-label text-muted small text-uppercase fw-bold">
              Nachname
            </label>
            <input
              type="text"
              className="form-control bg-light"
              value={user.profile?.last_name || user.profile?.lastname || ""}
              readOnly
            />
          </div>
          <div className="col-12">
            <label className="form-label text-muted small text-uppercase fw-bold">
              E-Mail
            </label>
            <input
              type="email"
              className="form-control bg-light"
              value={user.email}
              readOnly
            />
          </div>
          <div className="col-12">
            <label className="form-label text-muted small text-uppercase fw-bold">
              Führerschein Klasse
            </label>
            <input
              type="text"
              className="form-control bg-light"
              value={user.profile?.driver_license_class || "Nicht angegeben"}
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  ) as HTMLElement;
}
