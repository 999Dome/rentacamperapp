import { createElement, createSVGElement } from "../../utils/createElement.ts";
import { getHighlightCampers } from "../../api/campersAPI.ts";
import { getHighlightCamperImages } from "../../api/camperImagesAPI.ts";

const highlightCampers = await getHighlightCampers();
const highlightCamperImages = await getHighlightCamperImages();

function createHeartIcon() {
  return createSVGElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: "20",
      height: "20",
      fill: "currentColor",
      className: "bi bi-heart text-white",
      viewBox: "0 0 16 16",
    },
    createSVGElement("path", {
      d: "m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15",
    }),
  );
}

function getCamperImageUrl(camperId: string): string {
  const image = highlightCamperImages.find((img) => img.camper_id === camperId);
  return image
    ? image.image_path
    : "https://via.placeholder.com/400x300?text=No+Image";
}

export function Highlights() {
  return (
    <section className="container my-4">
      <div className="text-center mb-5">
        <h2 className="display-5 fw-bold custom-font text-white mb-3">
          Unsere Highlights
        </h2>
        <p className="lead text-white-50">
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
              <button
                className="wishlist-btn btn btn-sm btn-dark position-absolute top-0 end-0 m-3 rounded-circle border-0 shadow"
                data-camper-id={camper.id.toString()}
                style={{
                  width: "40px",
                  height: "40px",
                  zIndex: 10,
                }}
              >
                {createHeartIcon()}
              </button>
              <img
                src={getCamperImageUrl(camper.id.toString())}
                className="card-img-top"
                alt={camper.name}
                style={{ height: "220px", objectFit: "cover" }}
              />
              <div className="card-body d-flex flex-column p-4">
                <h5 className="card-title custom-font text-white fs-3 mb-1">
                  {camper.name}
                </h5>
                <p className="text-white-50 small mb-4">{camper.name}</p>
                <div className="mt-auto d-flex justify-content-between align-items-center">
                  <span className="text-custom-yellow fs-4 fw-bold">
                    ab {camper.engine_power}{" "}
                    <span className="fs-6 text-white-50 fw-normal">
                      / Nacht
                    </span>
                  </span>
                  <a
                    href={`/rent/?id=${camper.id}`}
                    className="btn btn-outline-custom-yellow px-4"
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
