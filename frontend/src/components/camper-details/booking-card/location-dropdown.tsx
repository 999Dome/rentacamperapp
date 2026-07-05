import { createElement } from '../../../utils/createElement.ts';
import type { LocationResponse } from '../../../infrastructure/api/location-api-client.ts';

/** Programmatic handle returned by {@link setupCustomDropdown}. */
export interface DropdownController {
  /** Selects the location with the given id (or shows the placeholder if not found). */
  setValue: (val: string) => void;
  /** Returns the currently selected location id, or `""` if none is selected. */
  getValue: () => string;
}

/**
 * Wires up one custom searchable location dropdown (used for both the
 * pickup and return location pickers on the booking card). This is a plain
 * DOM-behavior helper — the markup itself is rendered by `LocationDropdown.tsx`
 * beforehand; this function only looks up the already-rendered elements by
 * id and attaches behavior to them:
 * - clicking the toggle opens/closes the dropdown menu (and closes any other
 *   open dropdown menu first)
 * - clicking outside the dropdown closes its menu
 * - typing in the search box filters the visible location options
 * - clicking an option selects it, updates the display text, and notifies
 *   the caller via `onValueChange`
 *
 * @param root The booking card's root element, used to look up all the
 *   dropdown's sub-elements by id.
 * @param locations The full list of locations to render/filter as options.
 * @param containerId Id of the dropdown's outer container element.
 * @param toggleId Id of the clickable toggle row that opens/closes the menu.
 * @param menuId Id of the dropdown menu panel.
 * @param searchId Id of the search `<input>` inside the menu.
 * @param optionsId Id of the container the option rows get rendered into.
 * @param hiddenInputId Id of the hidden `<input>` that stores the selected location id.
 * @param displayTextId Id of the `<span>` that shows the selected location's name.
 * @param onValueChange Called with the newly selected location id whenever an option is clicked.
 * @returns A controller to programmatically read/restore the selection, or a
 *   no-op controller if any required element could not be found.
 */
export function setupCustomDropdown(
  root: HTMLElement,
  locations: LocationResponse[],
  containerId: string,
  toggleId: string,
  menuId: string,
  searchId: string,
  optionsId: string,
  hiddenInputId: string,
  displayTextId: string,
  onValueChange: (val: string) => void
): DropdownController {
  const containerEl = root.querySelector(`#${containerId}`) as HTMLElement;
  const toggleEl = root.querySelector(`#${toggleId}`) as HTMLElement;
  const menuEl = root.querySelector(`#${menuId}`) as HTMLElement;
  const searchEl = root.querySelector(`#${searchId}`) as HTMLInputElement;
  const optionsContainer = root.querySelector(`#${optionsId}`) as HTMLElement;
  const hiddenInput = root.querySelector(`#${hiddenInputId}`) as HTMLInputElement;
  const displayText = root.querySelector(`#${displayTextId}`) as HTMLElement;

  if (!containerEl || !toggleEl || !menuEl || !searchEl || !optionsContainer || !hiddenInput || !displayText) {
    return {
      setValue: () => {},
      getValue: () => ""
    };
  }

  toggleEl.addEventListener('click', (e) => {
    e.stopPropagation();
    root.querySelectorAll('.custom-dropdown-menu').forEach(m => {
      if (m !== menuEl) m.classList.add('d-none');
    });
    menuEl.classList.toggle('d-none');
    if (!menuEl.classList.contains('d-none')) {
      searchEl.value = '';
      renderOptions('');
      searchEl.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (!containerEl.contains(e.target as Node)) {
      menuEl.classList.add('d-none');
    }
  });

  searchEl.addEventListener('input', () => {
    renderOptions(searchEl.value.toLowerCase());
  });

  const renderOptions = (filterText: string) => {
    optionsContainer.innerHTML = '';

    const filtered = locations.filter(loc => {
      const name = (loc.name || `${loc.city} Station`).toLowerCase();
      const address = `${loc.street} ${loc.city}`.toLowerCase();
      return name.includes(filterText) || address.includes(filterText);
    });

    if (filtered.length === 0) {
      const noResults = (
        <div className="text-muted text-center py-2 fs-13px">Keine Stationen gefunden</div>
      ) as HTMLElement;
      optionsContainer.appendChild(noResults);
      return;
    }

    filtered.forEach(loc => {
      const item = (
        <div className="custom-dropdown-item p-2 rounded-2 d-flex align-items-start gap-2 mb-1" data-value={loc.id}>
          <i className="bi bi-geo-alt-fill text-custom-light-blue mt-1 fs-14px"></i>
          <div className="lh-1-2">
            <div className="fw-bold text-dark fs-13px">{loc.name || `${loc.city} Station`}</div>
            <div className="text-muted fs-11px">{loc.street} {loc.housenumber || ''}, {loc.plz || ''} {loc.city}</div>
          </div>
        </div>
      ) as HTMLElement;

      // Hover highlight is handled purely by the `.custom-dropdown-item:hover`
      // rule in `_custom.scss` (no JS needed for the color swap).

      item.addEventListener('click', () => {
        hiddenInput.value = loc.id;
        displayText.textContent = loc.name || `${loc.city} Station`;
        displayText.classList.remove('text-muted');
        menuEl.classList.add('d-none');
        onValueChange(loc.id);
      });

      optionsContainer.appendChild(item);
    });
  };

  const setValue = (val: string) => {
    hiddenInput.value = val;
    const loc = locations.find(l => l.id === val);
    if (loc) {
      displayText.textContent = loc.name || `${loc.city} Station`;
      displayText.classList.remove('text-muted');
    } else {
      displayText.textContent = "Bitte wählen...";
      displayText.classList.add('text-muted');
    }
  };

  renderOptions('');

  return {
    setValue,
    getValue: () => hiddenInput.value
  };
}
