import { createElement } from "../../utils/createElement.ts";
import type { MockCamper } from "../../utils/mockData.ts";

export function CamperCard(camper: MockCamper) {
  const bedsText = camper.beds ? `${camper.beds} Betten` : "Keine Betten";
  const licenseText = camper.required_license ? `Klasse ${camper.required_license}` : "Klasse B";
  const imageSrc = camper.image_url || "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7";

  return (
    <div className="col-12 col-md-6 col-lg-4 mb-4">
      <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden hover-zoom bg-white">
        <div style={{ position: "relative", height: "220px", overflow: "hidden" }}>
          <img
            src={imageSrc}
            alt={camper.name || "Camper"}
            className="w-100 h-100"
            style={{ objectFit: "cover" }}
          />
          {camper.is_blocked && (
            <div
              className="position-absolute top-0 end-0 m-3 badge bg-danger text-white fs-6 py-2 px-3 rounded-pill"
              style={{ zIndex: 2 }}
            >
              Gesperrt / Wartung
            </div>
          )}
        </div>
        <div className="card-body p-4 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <span className="badge bg-light text-dark border mb-2 me-1">{camper.manufacturer}</span>
              <span className="badge bg-light text-dark border mb-2">{licenseText}</span>
            </div>
            <span className="badge bg-primary text-white py-1 px-2 rounded">{bedsText}</span>
          </div>

          <h4 className="card-title fw-bold text-dark mb-2 custom-font-base">
            {camper.name}
          </h4>

          <p className="card-text text-muted small flex-grow-1 mb-3">
            {camper.short_desc || camper.description || ""}
          </p>

          <div className="mb-3 d-flex flex-wrap gap-1">
            {camper.features_list.map((feat) => (
              <span className="badge bg-light text-secondary border rounded-pill px-2 py-1" style={{ fontSize: "11px" }}>
                {feat}
              </span>
            ))}
          </div>

          <div className="border-top pt-3 d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted small d-block">Preis pro Nacht</span>
              <span className="fs-4 fw-bold text-custom-red custom-font-base">
                {camper.price_per_night_base} €
              </span>
            </div>
            <a href={`/campers/${camper.id}`} className="btn btn-outline-primary px-3 rounded-pill">
              Details
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
