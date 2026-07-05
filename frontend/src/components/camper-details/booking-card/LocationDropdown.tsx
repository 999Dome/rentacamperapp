import { createElement } from '../../../utils/createElement.ts';

/** Which of the two identical location dropdowns this instance renders. */
export type LocationFieldPrefix = 'pickup' | 'return';

interface LocationDropdownProps {
  /**
   * `"pickup"` or `"return"` — used to derive every id in this block (e.g.
   * `pickup-toggle`/`return-toggle`, `pickup-menu`/`return-menu`, ...), so
   * `setupCustomDropdown` (see `location-dropdown.tsx`) can find and wire up
   * this exact instance by id.
   */
  fieldPrefix: LocationFieldPrefix;
  /** Visible label text above the dropdown, e.g. "Abholort" or "Rückgabeort". */
  label: string;
}

/**
 * Renders one custom searchable location dropdown for the booking card.
 * Used twice (once for pickup, once for return) with a different
 * `fieldPrefix`/`label` so the markup, which used to be hand-duplicated in
 * `BookingCard.tsx`, only needs to exist once.
 *
 * This component only renders the static markup/ids. The actual dropdown
 * behavior (open/close, search filtering, option rendering, selection) is
 * wired up separately by calling `setupCustomDropdown` from
 * `location-dropdown.tsx` against these ids.
 *
 * @param props.fieldPrefix `"pickup"` or `"return"`.
 * @param props.label The field's visible label text.
 * @returns The dropdown container element.
 */
export function LocationDropdown({ fieldPrefix, label }: LocationDropdownProps) {
  return (
    <div className="p-2 pt-1 bg-white border-bottom border-dark-subtle position-relative custom-dropdown-container" id={`${fieldPrefix}-dropdown-container`}>
      <label className="form-label mb-0 text-uppercase fw-bold text-dark fs-10px ps-4px pe-none">{label}</label>
      <div className="custom-dropdown-toggle d-flex justify-content-between align-items-center fw-medium text-dark ps-1 pe-2 py-1" id={`${fieldPrefix}-toggle`}>
        <span id={`${fieldPrefix}-display-text`} className="text-muted">Bitte wählen...</span>
        <i className="bi bi-chevron-down text-muted fs-12px"></i>
      </div>
      <input type="hidden" id={`${fieldPrefix}-location`} value="" />
      <div className="custom-dropdown-menu d-none position-absolute start-0 end-0 bg-white border rounded-3 shadow-lg p-2 mt-1" id={`${fieldPrefix}-menu`}>
        <div className="px-1 py-1 border-bottom mb-2">
          <input type="text" className="form-control form-control-sm border-0 bg-light shadow-none fs-13px" placeholder="Suchen..." id={`${fieldPrefix}-search`} />
        </div>
        <div className="custom-dropdown-options" id={`${fieldPrefix}-options`}>
        </div>
      </div>
    </div>
  ) as HTMLElement;
}
