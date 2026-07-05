import { createElement, Fragment } from '../../utils/createElement.ts';
import type { CamperImage } from '../../types/interface.ts';

/**
 * Renders the Bootstrap carousel of camper images shown at the top of the
 * camper detail page. Falls back to a single placeholder image when the
 * camper has none, and only shows the prev/next controls when there's more
 * than one image to page through.
 *
 * @param images The camper's images (the primary one, if any, is sorted first).
 * @returns The carousel element.
 */
export function ImageGallery(images: CamperImage[]) {
  const placeholderUrl = 'https://www.freeiconspng.com/uploads/no-image-icon-4.png';

  let carouselImages = [...(images || [])];
  if (carouselImages.length === 0) {
    carouselImages = [{ id: 'placeholder', camper_id: '', image_path: placeholderUrl, is_primary: true, created_at: '' }];
  } else {
    carouselImages.sort((a, b) => (a.is_primary ? -1 : (b.is_primary ? 1 : 0)));
  }

  return (
    <div id="camperImageCarousel" className="carousel slide shadow-lg rounded-4 overflow-hidden mb-4 bg-dark camper-carousel" data-bs-ride="carousel">
      <div className="carousel-inner h-100">
        {carouselImages.map((img, index) => (
          <div className={`carousel-item h-100 ${index === 0 ? 'active' : ''}`}>
            <img
              src={img.image_path || placeholderUrl}
              className="d-block w-100 h-100 object-fit-cover"
              alt={`Fahrzeug Bild ${index + 1}`}
            />
          </div>
        ))}
      </div>

      {carouselImages.length > 1 ? (
        <Fragment>
          <button className="carousel-control-prev" type="button" data-bs-target="#camperImageCarousel" data-bs-slide="prev">
            <span className="carousel-control-prev-icon carousel-control-icon-shadow" aria-hidden="true"></span>
            <span className="visually-hidden">Vorheriges</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#camperImageCarousel" data-bs-slide="next">
            <span className="carousel-control-next-icon carousel-control-icon-shadow" aria-hidden="true"></span>
            <span className="visually-hidden">Nächstes</span>
          </button>
        </Fragment>
      ) : null}
    </div>
  );
}
