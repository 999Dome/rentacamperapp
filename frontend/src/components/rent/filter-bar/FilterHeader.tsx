import { createElement } from "../../../utils/createElement.ts";

/** Props for {@link FilterHeader}. */
interface FilterHeaderProps {
  /** Called when the "Zurücksetzen" (reset) button is clicked. */
  onReset: (e: Event) => void;
}

/**
 * Header row of the rent filter card: the "Filter" title, a button that
 * resets the filter form, and a mobile-only toggle button that expands or
 * collapses the filter form (via Bootstrap's `collapse` behavior targeting
 * `#filterFormCollapse`).
 *
 * @param onReset Click handler for the "Zurücksetzen" button.
 * @returns The header `<div>` element.
 */
export function FilterHeader({ onReset }: FilterHeaderProps) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-0 mb-lg-4 border-bottom pb-2">
      <h4 className="fw-bold mb-0 text-dark custom-font-base">Filter</h4>
      <div className="d-flex align-items-center gap-2">
        <button className="btn btn-sm btn-reset-filter" onclick={onReset}>
          Zurücksetzen
        </button>
        <button
          className="btn btn-outline-custom-light-blue btn-sm d-lg-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#filterFormCollapse"
          aria-expanded="false"
          aria-controls="filterFormCollapse"
        >
          <i className="bi bi-funnel-fill"></i> Toggle
        </button>
      </div>
    </div>
  );
}
