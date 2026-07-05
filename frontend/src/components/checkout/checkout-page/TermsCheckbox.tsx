import { createElement } from "../../../utils/createElement.ts";

/** Props for {@link TermsCheckbox}. */
interface TermsCheckboxProps {
  /**
   * Called with the checkbox's new checked state every time it changes.
   * The checkout page shell uses this to keep its own `checkoutTermsAccepted`
   * flag (read by the PayPal flow and the Stripe confirm button) up to date.
   */
  onChange: (accepted: boolean) => void;
}

/**
 * AGB/privacy-policy acceptance checkbox shown above the confirm-payment
 * button. It only reports its checked state up via `onChange` — it does not
 * itself know about the confirm button or whether the user is license-eligible;
 * the page shell decides what to do with the new value (e.g. enabling the
 * confirm button).
 *
 * @param props See {@link TermsCheckboxProps}.
 * @returns The terms checkbox row element.
 */
export function TermsCheckbox({ onChange }: TermsCheckboxProps) {
  return (
    <div className="form-check mt-4 mb-3 p-3 bg-light rounded border border-secondary-subtle d-flex align-items-center">
      <input
        className="form-check-input ms-0 me-3"
        type="checkbox"
        id="checkoutTermsCheckbox"
        onchange={(e: Event) => {
          const target = e.target as HTMLInputElement;
          onChange(target.checked);
        }}
      />
      <label className="form-check-label small text-muted terms-checkbox-label" htmlFor="checkoutTermsCheckbox">
        Ich habe die <a href="/right/agb.html" target="_blank" rel="noopener noreferrer" className="text-decoration-underline fw-medium text-dark">Allgemeine Geschäftsbedingungen (AGB)</a> und die <a href="/right/privacy-policies.html" target="_blank" rel="noopener noreferrer" className="text-decoration-underline fw-medium text-dark">Datenschutzerklärung</a> gelesen und akzeptiere diese.
      </label>
    </div>
  ) as HTMLElement;
}
