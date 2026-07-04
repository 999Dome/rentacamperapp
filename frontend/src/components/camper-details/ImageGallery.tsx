import { createElement, Fragment } from '../../utils/createElement.ts';
import type { CamperImage } from '../../types/interface.ts';

export function ImageGallery(images: CamperImage[]) {
  const placeholderUrl = 'https://www.freeiconspng.com/uploads/no-image-icon-4.png';
  
  let carouselImages = [...(images || [])];
  if (carouselImages.length === 0) {
    carouselImages = [{ id: 'placeholder', camper_id: '', image_path: placeholderUrl, is_primary: true, created_at: '' }];
  } else {
    carouselImages.sort((a, b) => (a.is_primary ? -1 : (b.is_primary ? 1 : 0)));
  }

  return (
    <div id="camperImageCarousel" className="carousel slide shadow-lg rounded-4 overflow-hidden mb-4 bg-dark" data-bs-ride="carousel" style={{ height: "500px" }}>
      <div className="carousel-inner h-100">
        {carouselImages.map((img, index) => (
          <div className={`carousel-item h-100 ${index === 0 ? 'active' : ''}`}>
            <img 
              src={img.image_path || placeholderUrl} 
              className="d-block w-100 h-100" 
              style={{ objectFit: "cover" }} 
              alt={`Fahrzeug Bild ${index + 1}`} 
            />
          </div>
        ))}
      </div>
      
      {carouselImages.length > 1 ? (
        <Fragment>
          <button className="carousel-control-prev" type="button" data-bs-target="#camperImageCarousel" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true" style={{ filter: "drop-shadow(0px 0px 4px rgba(0,0,0,0.8))" }}></span>
            <span className="visually-hidden">Vorheriges</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#camperImageCarousel" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true" style={{ filter: "drop-shadow(0px 0px 4px rgba(0,0,0,0.8))" }}></span>
            <span className="visually-hidden">Nächstes</span>
          </button>
        </Fragment>
      ) : null}
    </div>
  );
}
