import { createElement } from "../../utils/createElement.ts";

/**
 * Skeleton placeholder card matching the CamperCard layout.
 * Uses Bootstrap's `.placeholder` and `.placeholder-glow` classes
 * for a smooth pulsing animation while data is loading.
 */
export function SkeletonCard(): HTMLElement {
  return (
    <div className="col-12 col-md-6 col-lg-4 mb-4">
      <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden bg-beige placeholder-glow">
        {/* Image placeholder */}
        <div className="skeleton-img-placeholder placeholder" />

        <div className="card-body p-4 d-flex flex-column">
          {/* Badge placeholders */}
          <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
            <span className="placeholder rounded-pill skeleton-badge" />
            <span className="placeholder rounded-pill skeleton-badge" />
            <span className="placeholder rounded-pill skeleton-badge" />
          </div>

          {/* Title placeholder */}
          <div className="placeholder rounded skeleton-title mb-2" />

          {/* Text placeholders */}
          <div className="flex-grow-1 mb-3">
            <div className="placeholder rounded skeleton-text w-100 mb-1" />
            <div className="placeholder rounded skeleton-text w-75" />
          </div>

          {/* Feature badge placeholders */}
          <div className="mb-3 d-flex flex-wrap gap-1">
            <span className="placeholder rounded-pill skeleton-text-sm" style={{ width: "60px" }} />
            <span className="placeholder rounded-pill skeleton-text-sm" style={{ width: "50px" }} />
            <span className="placeholder rounded-pill skeleton-text-sm" style={{ width: "70px" }} />
          </div>

          {/* Price & button placeholder */}
          <div className="border-top pt-3 d-flex align-items-center justify-content-between">
            <div>
              <div className="placeholder rounded skeleton-text-sm w-100 mb-1" style={{ width: "90px" }} />
              <div className="placeholder rounded skeleton-price" />
            </div>
            <span className="placeholder rounded-pill" style={{ width: "80px", height: "36px" }} />
          </div>
        </div>
      </div>
    </div>
  ) as HTMLElement;
}
