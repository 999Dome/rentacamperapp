import { createElement } from "../../utils/createElement.ts";
import { getHighlightCampers } from "../../api/campersAPI.ts";
import { getHighlightCamperImages } from "../../api/camperImagesAPI.ts";

/**
 * Home page section that showcases the top 3 campers ("Highlights"). It
 * renders a loading spinner immediately, then fetches the highlighted
 * campers and their images in the background and swaps in camper cards
 * once the data arrives (or an error/empty message if it doesn't).
 */
export function Highlights() {
  const container = (
    <section className="container my-4">
      <div className="text-center mb-5">
        <h2 className="display-4 fw-bold custom-font-burbank text-white mb-3">
          Unsere Highlights
        </h2>
        <p className="lead text-white-50 display-6">
          Finde den perfekten Begleiter für deinen nächsten Roadtrip.
        </p>
      </div>
      <div className="row g-4" id="highlights-container">
        <div className="col-12 text-center py-5">
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Laden...</span>
          </div>
        </div>
      </div>
    </section>
  ) as HTMLElement;

  const loadData = async () => {
    try {
      const highlightCampers = await getHighlightCampers();
      const highlightCamperImages = await getHighlightCamperImages();

      const grid = container.querySelector("#highlights-container") as HTMLElement;
      grid.innerHTML = "";

      if (!highlightCampers || highlightCampers.length === 0) {
        grid.innerHTML = '<div class="col-12 text-center text-white-50 py-4">Zurzeit sind keine Highlights verfügbar.</div>';
        return;
      }

      function getCamperImageUrl(camperId: string): string {
        const image = highlightCamperImages.find((img) => img.camper_id === camperId);
        return (
          image?.image_path || "https://via.placeholder.com/400x300?text=Kein+Bild"
        );
      }

      highlightCampers.slice(0, 3).forEach((camper) => {
        const camperCol = (
          <div className="col-12 col-md-4">
            <div
              className="card h-100 border-0 shadow-lg position-relative bg-beige rounded-4 overflow-hidden highlight-card"
            >
              <div className="overflow-hidden rounded-top">
                <a href={`/campers/${camper.id}`}>
                  <img
                    src={getCamperImageUrl(camper.id.toString())}
                    className="card-img-top hover-zoom object-fit-cover highlight-card-img"
                    alt={camper.name}
                  />
                </a>
              </div>
              <div className="card-body d-flex flex-column p-4">
                <h5 className="card-title custom-font-base text-black fs-3 mb-1">
                  {camper.name}
                </h5>
                <p className="text-black-50 small mb-4 custom-font-base">
                  {camper.short_desc}
                </p>
                <div className="mt-auto d-flex justify-content-between align-items-center">
                  <span className="text-custom-yellow fs-4 fw-bold">
                    ab {camper.price_per_night_base || 0} €{" "}
                    <span className="fs-6 text-black-50 fw-normal">
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
        ) as HTMLElement;
        grid.appendChild(camperCol);
      });
    } catch (error) {
      console.error("Fehler beim Laden der Highlights:", error);
      const grid = container.querySelector("#highlights-container") as HTMLElement;
      grid.innerHTML = '<div class="col-12 text-center text-white-50 py-4">Die Highlights konnten nicht geladen werden. Bitte überprüfe die Verbindung zum Server.</div>';
    }
  };

  setTimeout(loadData, 0);

  return container;
}

