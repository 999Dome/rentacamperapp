import { createElement } from "../../utils/createElement.ts";

/**
 * Which visual design to use for the warning. The two real call sites use
 * genuinely different designs (not just different text), so this component
 * reproduces both exactly instead of forcing one shared markup shape:
 * - `"compact"`: a small one-line `alert-warning` note used in the booking
 *   widget (`BookingCard.tsx`), shown right above the book button.
 * - `"detailed"`: a more prominent `alert-danger` card with a heading and a
 *   paragraph, used on the checkout page (`CheckoutPage.tsx`).
 */
export type LicenseWarningVariant = "compact" | "detailed";

/** Props for {@link LicenseWarningBanner}. */
interface LicenseWarningBannerProps {
  /** Which design to render. See {@link LicenseWarningVariant}. */
  variant: LicenseWarningVariant;
  /** The current user's drivers-license class (e.g. `"B"`), or `null`/`undefined` if none is on file. */
  userLicenseClass?: string | null;
  /** The license class required to drive the camper (e.g. `"Klasse B"`). */
  requiredLicenseClass: string | null;
}

/**
 * Warning shown when the logged-in user's drivers-license class is
 * insufficient for the camper they're trying to book. Rendered only when the
 * caller has already determined the user is not licensed
 * (`DriversLicenseValidator.isLicensedToDrive` returned `false`) — this
 * component just displays the message, it doesn't do the check itself.
 *
 * @param props See {@link LicenseWarningBannerProps}.
 * @returns The warning `<div>` element, in the design matching `variant`.
 */
export function LicenseWarningBanner({
  variant,
  userLicenseClass,
  requiredLicenseClass,
}: LicenseWarningBannerProps) {
  if (variant === "detailed") {
    return (
      <div className="alert alert-danger rounded-4 p-3 mb-4">
        <h5 className="fw-bold mb-2 text-danger">Führerscheinprüfung fehlgeschlagen</h5>
        <p className="mb-0 small">
          Deine hinterlegte Führerscheinklasse <strong>({userLicenseClass || "Keine"})</strong> reicht für diesen Camper nicht aus.
          Dieses Fahrzeug erfordert mindestens die Klasse <strong>{requiredLicenseClass}</strong>.
        </p>
      </div>
    ) as HTMLElement;
  }

  return (
    <div className="alert alert-warning rounded-3 p-2 mb-3 mt-3 text-center fs-13px">
      <strong>Hinweis:</strong> Deine Führerscheinklasse ({userLicenseClass || "Keine"}) ist unzureichend (benötigt: {requiredLicenseClass}).
    </div>
  ) as HTMLElement;
}
