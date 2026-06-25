import { createElement } from '../../utils/createElement.ts';
import type { CamperImage } from '../../types/interface.ts';

export function ImageGallery(images: CamperImage[]) {
  const placeholderUrl = 'https://www.freeiconspng.com/uploads/no-image-icon-4.png';
  
  const mainImage = images.find(img => img.is_primary === true) || images[0];
  const mainImgSrc = mainImage?.image_path || placeholderUrl;

  const secondaryImages = images.filter(img => img.id !== mainImage?.id);
  
  const gridImages = [];
  for (let i = 0; i < 4; i++) {
    if (secondaryImages[i]) {
      gridImages.push(secondaryImages[i].image_path);
    } else {
      gridImages.push(placeholderUrl);
    }
  }

  return (
    <section className="mb-4 rounded-4 overflow-hidden shadow-lg bg-white d-flex" style={{ height: "500px", gap: "8px" }}>
      
      <div className="w-100 h-100" style={{ flex: "1 1 50%" }}>
        <img 
          src={mainImgSrc} 
          alt="Camper Main" 
          className="w-100 h-100" 
          style={{ objectFit: "cover", transition: "transform 0.3s ease", cursor: "pointer" }}
          onmouseover={(e: any) => e.target.style.filter = "brightness(0.9)"}
          onmouseout={(e: any) => e.target.style.filter = "brightness(1)"}
        />
      </div>

      <div className="d-none d-md-grid h-100" style={{ flex: "1 1 50%", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: "8px" }}>
        {gridImages.map((src, index) => (
          <div className="w-100 h-100 overflow-hidden">
            <img 
              src={src} 
              alt={`Camper Detail ${index + 1}`} 
              className="w-100 h-100" 
              style={{ objectFit: "cover", transition: "transform 0.3s ease", cursor: "pointer" }}
              onmouseover={(e: any) => e.target.style.filter = "brightness(0.9)"}
              onmouseout={(e: any) => e.target.style.filter = "brightness(1)"}
            />
          </div>
        ))}
      </div>

    </section>
  );
}
