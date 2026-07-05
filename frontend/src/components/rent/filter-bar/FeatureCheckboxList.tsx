import { createElement } from "../../../utils/createElement.ts";

/** Props for {@link FeatureCheckboxList}. */
interface FeatureCheckboxListProps {
  /** Feature names to render as checkboxes, e.g. "Klimaanlage". */
  features: string[];
}

/**
 * Renders the "Ausstattung & Features" checkbox list of the rent filter
 * bar. Every checkbox shares the form field name `"features"`, so the
 * surrounding `<form>` collects all checked values under that one key.
 *
 * @param features The feature names to render, in display order.
 * @returns A `<div>` containing one checkbox + label per feature.
 */
export function FeatureCheckboxList({ features }: FeatureCheckboxListProps) {
  return (
    <div className="d-flex flex-column gap-2">
      {features.map((feat) => (
        <div className="form-check" key={feat}>
          <input className="form-check-input" type="checkbox" name="features" value={feat} id={`feat-${feat}`} />
          <label className="form-check-label text-muted small" htmlFor={`feat-${feat}`}>
            {feat}
          </label>
        </div>
      ))}
    </div>
  );
}
