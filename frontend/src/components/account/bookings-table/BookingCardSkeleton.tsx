import { createElement } from "../../../utils/createElement.ts";

/**
 * Renders one placeholder ("skeleton") booking card, shown while the real
 * bookings list is still being loaded. It mimics the layout of a real
 * booking card (header + three-column body) using Bootstrap's
 * `placeholder-glow`/`placeholder` classes, so the page doesn't visibly
 * jump around once the real data arrives.
 *
 * @returns The skeleton card element.
 */
export function BookingCardSkeleton() {
  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 mb-3 bg-white placeholder-glow">
      <div className="d-flex justify-content-between mb-3">
        <span className="placeholder col-3 rounded h-16px"></span>
        <span className="placeholder col-2 rounded-pill h-24px"></span>
      </div>
      <div className="row g-3">
        <div className="col-12 col-md-4">
          <span className="placeholder col-8 mb-2 d-block rounded h-14px"></span>
          <span className="placeholder col-10 rounded h-24px"></span>
        </div>
        <div className="col-12 col-md-5">
          <span className="placeholder col-6 mb-2 d-block rounded h-14px"></span>
          <span className="placeholder col-8 rounded h-20px"></span>
        </div>
        <div className="col-12 col-md-3 text-md-end">
          <span className="placeholder col-6 mb-2 d-block rounded h-14px"></span>
          <span className="placeholder col-8 rounded h-24px"></span>
        </div>
      </div>
    </div>
  ) as HTMLElement;
}
