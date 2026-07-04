import { createElement } from "../../utils/createElement.ts";

export function AboutUsHero() {
  return (
    <header className="hero text-center mb-5 rounded-4 overflow-hidden shadow-lg">
      <div className="hero-inner">
        <h1 className="neon text-uppercase custom-font-burbank" style={{ letterSpacing: "2px" }}>About Us</h1>
        <p className="tag fs-5 text-white-50">Authentic Campers • 24/7 Vibes</p>
        <nav className="jump-nav mt-3">
          <a href="#standort" className="btn btn-primary btn-sm rounded-pill mx-1 text-dark">Standort</a>
          <a href="#oeffnungszeiten" className="btn btn-primary btn-sm rounded-pill mx-1 text-dark">Öffnungszeiten</a>
          <a href="#personal" className="btn btn-primary btn-sm rounded-pill mx-1 text-dark">Personal</a>
          <a href="#impressum" className="btn btn-primary btn-sm rounded-pill mx-1 text-dark">Impressum</a>
        </nav>
      </div>
    </header>
  );
}

import type { LocationResponse } from "../../infrastructure/api/location-api-client.ts";

export function LocationSection({ locations }: { locations: LocationResponse[] }) {
  return (
    <section id="standort" className="card border-0 shadow-lg rounded-4 bg-beige p-4 mb-5 reveal">
      <h2 className="h3 fw-bold text-custom-red mb-3 custom-font-burbank">Unsere Stationen</h2>
      <div className="row g-4 align-items-center">
        <div className="text col-12 col-md-7">
          <p className="fs-5 text-dark">
            Unsere Camper-Stationen befinden sich an zentralen Standorten — leicht erreichbar, mit ausreichend Parkplätzen für deinen Pkw während des Mietzeitraums.
          </p>
          <div className="locations-list d-flex flex-column gap-3">
            {locations.length > 0 ? locations.map((loc) => (
              <div className="location-item p-3 border border-dark border-opacity-10 rounded-3 bg-white text-dark shadow-sm">
                <h5 className="fw-bold text-custom-light-blue mb-1"><i className="bi bi-geo-alt-fill me-2"></i>{loc.name || loc.city}</h5>
                <address className="mb-0 text-muted">
                  {loc.street} {loc.housenumber || ''}<br />
                  {loc.plz || ''} {loc.city}
                </address>
              </div>
            )) : (
              <p className="text-muted">Stationen werden geladen...</p>
            )}
          </div>
        </div>
        <div className="map col-12 col-md-5">
          <iframe
            src="https://www.openstreetmap.org/export/embed.html?bbox=8.0%2C47.0%2C10.0%2C49.0&amp;layer=mapnik"
            className="w-100 rounded-3 border shadow-sm"
            style={{ height: "100%", minHeight: "350px" }}
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </section>
  );
}

export function OpeningHours() {
  return (
    <section id="oeffnungszeiten" className="card border-0 shadow-lg rounded-4 bg-beige p-4 mb-5 reveal">
      <h2 className="h3 fw-bold text-custom-red mb-3 custom-font-burbank">Öffnungszeiten</h2>
      <ul className="hours list-group list-group-flush bg-transparent">
        {[
          { day: "Montag", hours: "09:00 — 18:00" },
          { day: "Dienstag", hours: "09:00 — 18:00" },
          { day: "Mittwoch", hours: "09:00 — 18:00" },
          { day: "Donnerstag", hours: "09:00 — 18:00" },
          { day: "Freitag", hours: "09:00 — 16:00" },
          { day: "Samstag", hours: "10:00 — 16:00" },
          { day: "Sonntag", hours: "Geschlossen (Notfallkontakt per Telefon verfügbar)" }
        ].map((h) => (
          <li className="list-group-item d-flex justify-content-between align-items-center bg-transparent border-bottom border-dark border-opacity-10 text-dark py-3 fs-5">
            <strong className="text-custom-light-blue">{h.day}:</strong>
            <span className="text-muted">{h.hours}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Staff() {
  const team = [
    { name: "Dominik", role: "Kundenservice & Beratung", img: "https://i.pravatar.cc/200?img=32" },
    { name: "Kevin", role: "Werkstatt & Technik", img: "https://i.pravatar.cc/200?img=47" },
    { name: "Max", role: "Management", img: "https://i.pravatar.cc/200?img=12" }
  ];

  return (
    <section id="personal" className="card border-0 shadow-lg rounded-4 bg-beige p-4 mb-5 reveal">
      <h2 className="h3 fw-bold text-custom-red mb-4 custom-font-burbank">Personal</h2>
      <div className="row g-4">
        {team.map((member) => (
          <div className="col-12 col-md-4">
            <article className="card border-0 shadow-sm rounded-4 p-4 text-center h-100 bg-white hover-zoom text-dark">
              <img
                src={member.img}
                alt={member.name}
                className="rounded-circle mb-3 border border-3 border-dark border-opacity-10 mx-auto"
                style={{ width: "120px", height: "120px", objectFit: "cover" }}
              />
              <h4 className="fw-bold text-dark mb-1">{member.name}</h4>
              <p className="text-custom-light-blue mb-0">{member.role}</p>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Impressum() {
  return (
    <section id="impressum" className="card border-0 shadow-lg rounded-4 bg-beige p-4 mb-5 reveal">
      <h2 className="h3 fw-bold text-custom-red mb-3 custom-font-burbank">Impressum</h2>
      <p className="fs-5 text-dark mb-0" style={{ lineHeight: "1.7" }}>
        Rent-a-Camper GmbH<br />
        Musterstraße 1, 12345 Musterstadt<br />
        Geschäftsführer: Max Mustermann<br />
        E-Mail: info@rentacamper.example<br />
        Registergericht: Amtsgericht Musterstadt, HRB 99999
      </p>
    </section>
  );
}
