import { createElement } from '../../../utils/createElement.ts';
import type { Addon } from '../../../types/interface.ts';

/**
 * Renders the "Extras" checklist section of the booking card: one checkbox
 * per available addon (`#addon-{id}`), or a muted placeholder text if the
 * camper has no addons.
 *
 * Each checkbox uses the shared `addon-checkbox` class and each label uses
 * the shared `addon-label` class, which `_custom.scss` uses to fade the
 * label out while its checkbox is unchecked.
 *
 * @param addons The list of addons/extras available for this camper.
 * @returns The extras section element.
 */
export function AddonsChecklist(addons: Addon[]) {
  return (
    <div className="p-2 pt-1 bg-white">
      <label className="form-label mb-0 text-uppercase fw-bold text-dark fs-10px ps-4px">Extras</label>
      <div className="px-1 mt-2 mb-1">
        {addons.length > 0 ? addons.map(a => (
          <div className="form-check mb-2">
            <input className="form-check-input shadow-none addon-checkbox" type="checkbox" value={a.id} id={`addon-${a.id}`} />
            <label className="form-check-label fw-medium addon-label" htmlFor={`addon-${a.id}`}>
              {a.name} <span className="addon-price">(+{a.price}€ {a.is_per_night ? '/Nacht' : ''})</span>
            </label>
          </div>
        )) : (
          <div className="text-muted fs-14px">Keine Extras verfügbar</div>
        )}
      </div>
    </div>
  ) as HTMLElement;
}
