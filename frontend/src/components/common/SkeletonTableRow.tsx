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

    // The last column's bar has a fixed width; the others get a randomized
    // width (60%-99%) so the row doesn't look like a uniform, static grid
    // while data is loading. That randomized value can't be expressed as a
    // static CSS class, so it's the one property still set imperatively.
    const bar = (
      <span className={`placeholder rounded skeleton-bar${isLast ? " skeleton-bar-last" : ""}`} />
    ) as HTMLElement;
    if (!isLast) {
      bar.style.width = `${60 + Math.floor(Math.random() * 40)}%`;
    }

    cells.push(
      <td className={isLast ? "text-end" : ""}>
        <span className="placeholder-glow">{bar}</span>
      </td> as HTMLElement,
    );
  }

  return (
    <tr>
      {cells}
    </tr>
  ) as HTMLElement;
}
