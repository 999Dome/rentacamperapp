import { createElement } from "../../utils/createElement.ts";

/**
 * Skeleton placeholder row matching the BookingsTable column layout.
 * Uses Bootstrap's `.placeholder` and `.placeholder-glow` for a
 * smooth pulsing animation while bookings are loading.
 *
 * @param columns Number of table columns (default: 5)
 */
export function SkeletonTableRow(columns: number = 5): HTMLElement {
  const cells: HTMLElement[] = [];

  for (let i = 0; i < columns; i++) {
    const isLast = i === columns - 1;
    cells.push(
      <td className={isLast ? "text-end" : ""}>
        <span className="placeholder-glow">
          <span
            className="placeholder rounded"
            style={{
              display: "inline-block",
              width: isLast ? "80px" : `${60 + Math.floor(Math.random() * 40)}%`,
              height: "14px",
            }}
          />
        </span>
      </td> as HTMLElement,
    );
  }

  return (
    <tr>
      {cells}
    </tr>
  ) as HTMLElement;
}
