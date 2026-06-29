import { createElement } from "../../utils/createElement.ts";
import { getHighlightCampers } from "../../api/campersAPI.ts";
import { getHighlightCamperImages } from "../../api/camperImagesAPI.ts";

const highlightCampers = await getHighlightCampers();
const highlightCamperImages = await getHighlightCamperImages();

function getCamperImageUrl(camperId: string): string {
  const image = highlightCamperImages.find((img) => img.camper_id === camperId);
  return (
    image?.image_path || "https://via.placeholder.com/400x300?text=No+Image"
  );
}

export function Highlights() {
  return (
    <section className="container my-4">
      <div className="text-center mb-5">
        <h2 className="display-4 fw-bold custom-font-burbank text-white mb-3">
          Unsere Highlights
        </h2>
        <p className="lead text-white-50 display-6">
          Finde den perfekten Begleiter für deinen nächsten Roadtrip.
        </p>
      </div>
      <div className="row g-4">
        {highlightCampers.map((camper) => (
          <div className="col-12 col-md-4" key={camper.id}>
            <div
              className="card h-100 border-0 shadow-lg position-relative"
              style={{
                backgroundColor: "#243946",
                borderRadius: "16px",
                overflow: "hidden",
                transition: "transform 0.2s;",
              }}
            >
              <div className="overflow-hidden rounded-top">
                <a href={`/campers/${camper.id}`}>
                  <img
                    src={getCamperImageUrl(camper.id.toString())}
                    className="card-img-top hover-zoom"
                    alt={camper.name}
                    style={{ height: "220px", objectFit: "cover" }}
                  />
                </a>
              </div>
              <div className="card-body d-flex flex-column p-4">
                <h5 className="card-title custom-font-base text-white fs-3 mb-1">
                  {camper.name}
                </h5>
                <p className="text-white-50 small mb-4 custom-font-base">
                  {camper.short_desc}
                </p>
                <div className="mt-auto d-flex justify-content-between align-items-center">
                  <span className="text-custom-yellow fs-4 fw-bold">
                    ab {camper.engine_power}{" "}
                    <span className="fs-6 text-white-50 fw-normal">
                      / Nacht
                    </span>
                  </span>
                  <a
                    href={`/campers/${camper.id}`}
                    className="btn btn-primary px-4"
                  >
                    Ansehen
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
