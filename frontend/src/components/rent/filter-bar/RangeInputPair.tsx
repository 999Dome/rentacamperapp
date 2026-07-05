import { createElement } from "../../../utils/createElement.ts";

/** A single numeric input rendered inside a {@link RangeInputPair} row. */
export interface RangeField {
  /** Bootstrap icon class shown inside the input. */
  icon: string;
  /** The `name` (and form field key) of the input. */
  name: string;
  /** Placeholder text shown inside the input. */
  placeholder: string;
  /** Optional `min` attribute for the numeric input. */
  min?: string;
}

/** Props for {@link RangeInputPair}. */
interface RangeInputPairProps {
  /** The numeric inputs to render side by side in the row. */
  fields: RangeField[];
  /** Class applied to the wrapping `.row` element. Defaults to `"row g-2"`. */
  rowClassName?: string;
}

/**
 * Renders a row of `col-6` numeric inputs, each wrapped in a
 * `.filter-input-group` with its own icon. Used for the filter bar's
 * "min/max"-shaped fields (price range, beds range) as well as the
 * height/width row of the vehicle dimensions filter.
 *
 * @param fields The inputs to render, one per column.
 * @param rowClassName Class for the wrapping `.row` element (default `"row g-2"`).
 * @returns The `<div className="row ...">` element containing the inputs.
 */
export function RangeInputPair({ fields, rowClassName = "row g-2" }: RangeInputPairProps) {
  return (
    <div className={rowClassName}>
      {fields.map((field) => (
        <div className="col-6" key={field.name}>
          <div className="filter-input-group">
            <i className={`${field.icon} input-icon`}></i>
            <input
              type="number"
              name={field.name}
              className="form-control filter-control"
              placeholder={field.placeholder}
              min={field.min}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
