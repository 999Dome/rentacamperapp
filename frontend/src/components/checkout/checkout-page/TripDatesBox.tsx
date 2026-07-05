import { createElement } from "../../../utils/createElement.ts";

/** Props for {@link TripDatesBox}. */
interface TripDatesBoxProps {
  /** Formatted pickup date, shown under "Abholung". */
  startDate: string;
  /** Formatted return date, shown under "Rückgabe". */
  endDate: string;
}

/**
 * Small two-column box in the order-summary card showing the trip's pickup
 * and return dates side by side.
 *
 * @param props See {@link TripDatesBoxProps}.
 * @returns The dates box element.
 */
export function TripDatesBox({ startDate, endDate }: TripDatesBoxProps) {
  return (
    <div className="d-flex justify-content-between mb-4 bg-light p-3 rounded-3 border">
      <div className="text-center w-50 border-end">
        <div className="text-uppercase small text-muted fw-bold fs-10px">
          Abholung
        </div>
        <div className="fw-bold">{startDate}</div>
      </div>
      <div className="text-center w-50">
        <div className="text-uppercase small text-muted fw-bold fs-10px">
          Rückgabe
        </div>
        <div className="fw-bold">{endDate}</div>
      </div>
    </div>
  ) as HTMLElement;
}
