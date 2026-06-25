import { createElement } from '../../utils/createElement.ts';
import type { Camper, CamperFeature, DriversLicense } from '../../types/interface.ts';

export function CamperInfo(camper: Camper, features: CamperFeature[], license: DriversLicense) {
  // Use a fallback for manufacturer, beds, etc. if null
  const bedsText = camper.beds ? `${camper.beds} Betten` : 'Keine Bettenangabe';
  
  return (
    <div className="col-12 col-lg-8">
      <div className="card border-0 shadow-lg rounded-4 p-4 p-md-5 h-100" style={{ backgroundColor: "#ffffff" }}>
        
        <div className="mb-4">
          <h1 className="display-5 fw-bold custom-font-base mb-2">{camper.manufacturer + " " + camper.name || 'N/A'}</h1>
          <div className="d-flex flex-wrap gap-2 text-muted fs-6">
             <span className="badge bg-info text-white custom-font-cartoonist fs-6 px-3 py-2 rounded-pill">{camper.manufacturer || 'Unbekannt'}</span>
            <span className="badge bg-primary text-white custom-font-cartoonist fs-6 px-3 py-2 rounded-pill">{bedsText}</span>
            <span className="badge bg-secondary text-white custom-font-cartoonist fs-6 px-3 py-2 rounded-pill">Führerschein {license.class || 'B'}</span>
          </div>
        </div>

        <hr className="text-muted opacity-25 my-4" />

        <div className="mb-4">
          <h3 className="h4 fw-bold custom-font-cartoonist mb-3 text-custom-red">Über dieses Wohnmobil</h3>
          <p className="fs-5 text-dark" style={{ lineHeight: "1.7" }}>
            {camper.description || camper.short_desc || 'Keine Beschreibung verfügbar.'}
          </p>
        </div>

        <hr className="text-muted opacity-25 my-4" />

        <div className="mb-4">
          <h3 className="h4 fw-bold custom-font-cartoonist mb-3 text-custom-red">Was dieses Wohnmobil bietet</h3>
          <div className="row g-3">
            {features.length > 0 ? (
              features.map(f => (
                <div className="col-12 col-sm-6">
                  <div className="d-flex align-items-center p-3 rounded-3 bg-light border">
                    <span className="text-custom-light-blue fw-bold fs-5 me-3">✓</span>
                    <span className="fs-5 text-dark">{(f as any).features?.name || 'Feature'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12">
                <p className="text-muted fs-5">Keine spezifischen Features aufgelistet</p>
              </div>
            )}
          </div>
        </div>

        <hr className="text-muted opacity-25 my-4" />

        <div className="mb-4">
          <h3 className="h4 fw-bold custom-font-cartoonist mb-3 text-custom-red">Technische Details</h3>
          <ul className="list-group list-group-flush fs-5">
            <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3 border-bottom bg-transparent">
              <span className="text-muted">Länge x Breite x Höhe</span>
              <span className="fw-medium">{camper.length_cm || '-'} x {camper.width_cm || '-'} x {camper.height_cm || '-'} cm</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3 border-bottom bg-transparent">
              <span className="text-muted">Gewicht (Leer / Max)</span>
              <span className="fw-medium">{camper.empty_weight_kg || '-'} / {camper.max_weight_kg || '-'} kg</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3 border-bottom bg-transparent">
              <span className="text-muted">Motor / Verbrauch</span>
              <span className="fw-medium">{camper.engine_power || '-'} PS / {camper.fuel_consumption || '-'}l/100km</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3 bg-transparent">
              <span className="text-muted">Anhängerkupplung (Anhängermaximalgewicht)</span>
              <span className="fw-medium">{camper.has_tow_hitch ? 'Ja' : 'Nein'} ({camper.max_towing_capacity_kg || '0'} kg)</span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}
