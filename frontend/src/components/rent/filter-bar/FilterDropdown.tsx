import { createElement } from "../../../utils/createElement.ts";

/** A single selectable option inside a {@link renderDropdown} menu. */
export interface FilterDropdownOption {
  value: string;
  label: string;
}

/**
 * Renders one Bootstrap-style filter dropdown for the rent filter bar
 * (e.g. "Hersteller", "Führerschein", "Kraftstoff", ...).
 *
 * The dropdown is built from three pieces that all cooperate through the
 * DOM (there is no shared state object):
 * - a toggle `<button>` whose visible label lives in a `<span id="btn-text-{name}">`
 * - a hidden `<input type="hidden" name={name}>` that actually holds the
 *   selected value and gets picked up by the surrounding `<form>`
 * - a `<ul class="dropdown-menu">` of options; clicking one updates both the
 *   hidden input's value and the visible label, then notifies the caller
 *   via `onFilterChange` so the results list can be refreshed.
 *
 * @param name Form field name, also used to build the `btn-text-{name}` id.
 * @param iconClass Bootstrap icon class shown next to the dropdown toggle.
 * @param options The list of selectable `{ value, label }` options.
 * @param defaultLabel Label shown on the toggle button before anything is selected.
 * @param onFilterChange Callback fired after an option is selected, so the
 *   parent filter bar can re-run filtering.
 * @returns The dropdown's root `<div>` element.
 */
export function renderDropdown(
  name: string,
  iconClass: string,
  options: FilterDropdownOption[],
  defaultLabel: string,
  onFilterChange: () => void,
  selectedValue?: string
): HTMLElement {
  const handleSelect = (val: string, label: string, container: HTMLElement) => {
    const btnTextEl = container.querySelector(`#btn-text-${name}`) as HTMLElement;
    const inputEl = container.querySelector(`input[name="${name}"]`) as HTMLInputElement;
    if (btnTextEl && inputEl) {
      inputEl.value = val;
      btnTextEl.textContent = label;
      onFilterChange();
    }
  };

  const selectedOption = options.find((opt) => opt.value === selectedValue);
  const initialLabel = selectedOption ? selectedOption.label : defaultLabel;
  const initialValue = selectedValue || "";

  return (
    <div className="dropdown filter-input-group w-100">
      <i className={`${iconClass} input-icon`}></i>
      <button
        className="form-select filter-control text-start w-100 dropdown-toggle d-flex align-items-center justify-content-between"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <span id={`btn-text-${name}`}>{initialLabel}</span>
      </button>
      <input type="hidden" name={name} value={initialValue} />
      <ul className="dropdown-menu w-100 shadow-sm p-1">
        {options.map((opt) => (
          <li key={opt.value}>
            <button
              className="dropdown-item rounded-2 py-2"
              type="button"
              onclick={(e: Event) => {
                e.preventDefault();
                const target = e.currentTarget as HTMLElement;
                const dropdownContainer = target.closest(".dropdown") as HTMLElement;
                if (dropdownContainer) {
                  handleSelect(opt.value, opt.label, dropdownContainer);
                }
              }}
            >
              {opt.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  ) as HTMLElement;
}
