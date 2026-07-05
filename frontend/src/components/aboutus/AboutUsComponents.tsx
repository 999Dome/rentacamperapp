import { createElement } from "../../utils/createElement.ts";

/**
 * Big banner at the top of the About Us page: the page title over the
 * cover photo, plus a small nav that jumps to the sections further down
 * the page (location, opening hours, staff, imprint).
 */
export function AboutUsHero() {
  return (
    <header className="hero text-center mb-5 rounded-4 overflow-hidden shadow-lg">
      <div className="hero-inner">
        <h1 className="neon text-uppercase custom-font-burbank">About Us</h1>
        <p className="tag fs-5 text-white-50">Authentic Campers • 24/7 Vibes</p>
        <nav className="jump-nav mt-3">
          <a
            href="#standort"
            className="btn btn-primary btn-sm rounded-pill mx-1 text-dark"
          >
            Standort
          </a>
          <a
            href="#oeffnungszeiten"
            className="btn btn-primary btn-sm rounded-pill mx-1 text-dark"
          >
            Öffnungszeiten
          </a>
          <a
            href="#personal"
            className="btn btn-primary btn-sm rounded-pill mx-1 text-dark"
          >
            Personal
          </a>
          <a
            href="#impressum"
            className="btn btn-primary btn-sm rounded-pill mx-1 text-dark"
          >
            Impressum
          </a>
        </nav>
      </div>
    </header>
  );
}

import type { LocationResponse } from "../../infrastructure/api/location-api-client.ts";

/**
 * "Our Stations" section of the About Us page: a short blurb plus a list of
 * rental locations (or a loading message if none have arrived yet), next
 * to an embedded OpenStreetMap map.
 *
 * @param locations The rental locations to list, already fetched by the caller.
 */
export function LocationSection({
  locations,
}: {
  locations: LocationResponse[];
}) {
  return (
    <section
      id="standort"
      className="card border-0 shadow-lg rounded-4 bg-beige p-4 mb-5 reveal"
    >
      <h2 className="h3 fw-bold text-custom-red mb-3 custom-font-burbank">
        Unsere Stationen
      </h2>
      <div className="row g-4 align-items-center">
        <div className="text col-12 col-md-7">
          <p className="fs-5 text-dark">
            Unsere Camper-Stationen befinden sich an zentralen Standorten —
            leicht erreichbar, mit ausreichend Parkplätzen für deinen Pkw
            während des Mietzeitraums.
          </p>
          <div className="locations-list d-flex flex-column gap-3">
            {locations.length > 0 ? (
              locations.map((loc) => (
                <div className="location-item p-3 border border-dark border-opacity-10 rounded-3 bg-white text-dark shadow-sm">
                  <h5 className="fw-bold text-custom-light-blue mb-1">
                    <i className="bi bi-geo-alt-fill me-2"></i>
                    {loc.name || loc.city}
                  </h5>
                  <address className="mb-0 text-muted">
                    {loc.street} {loc.housenumber || ""}
                    <br />
                    {loc.plz || ""} {loc.city}
                  </address>
                </div>
              ))
            ) : (
              <p className="text-muted">Stationen werden geladen...</p>
            )}
          </div>
        </div>
        <div className="map col-12 col-md-5">
          <iframe
            src="https://www.openstreetmap.org/export/embed.html?bbox=8.0%2C47.0%2C10.0%2C49.0&amp;layer=mapnik"
            className="w-100 rounded-3 border shadow-sm aboutus-map-frame"
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </section>
  );
}

/** "Opening Hours" section of the About Us page: a static weekly schedule list. */
export function OpeningHours() {
  return (
    <section
      id="oeffnungszeiten"
      className="card border-0 shadow-lg rounded-4 bg-beige p-4 mb-5 reveal"
    >
      <h2 className="h3 fw-bold text-custom-red mb-3 custom-font-burbank">
        Öffnungszeiten
      </h2>
      <ul className="hours list-group list-group-flush bg-transparent">
        {[
          { day: "Montag", hours: "09:00 — 18:00" },
          { day: "Dienstag", hours: "09:00 — 18:00" },
          { day: "Mittwoch", hours: "09:00 — 18:00" },
          { day: "Donnerstag", hours: "09:00 — 18:00" },
          { day: "Freitag", hours: "09:00 — 16:00" },
          { day: "Samstag", hours: "10:00 — 16:00" },
          {
            day: "Sonntag",
            hours: "Geschlossen (Notfallkontakt per Telefon verfügbar)",
          },
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

/** "Staff" section of the About Us page: a row of team member cards with photo, name and role. */
export function Staff() {
  const team = [
    {
      name: "Dominik",
      role: "Kundenservice & Beratung",
      img: "https://wzghzmsioptlbsnzpnga.supabase.co/storage/v1/object/public/staff/WhatsApp%20Image%202026-07-04%20at%2023.53.36.jpeg",
    },
    {
      name: "Kevin",
      role: "Werkstatt & Technik",
      img: "https://wzghzmsioptlbsnzpnga.supabase.co/storage/v1/object/public/staff/WhatsApp%20Image%202026-07-04%20at%2023.53.15.jpeg",
    },
    {
      name: "Max",
      role: "Management",
      img: "https://wzghzmsioptlbsnzpnga.supabase.co/storage/v1/object/public/staff/image.png",
    },
  ];

  return (
    <section
      id="personal"
      className="card border-0 shadow-lg rounded-4 bg-beige p-4 mb-5 reveal"
    >
      <h2 className="h3 fw-bold text-custom-red mb-4 custom-font-burbank">
        Personal
      </h2>
      <div className="row g-4">
        {team.map((member) => (
          <div className="col-12 col-md-4">
            <article className="card border-0 shadow-sm rounded-4 p-4 text-center h-100 bg-white hover-zoom text-dark">
              <img
                src={member.img}
                alt={member.name}
                className="rounded-circle mb-3 border border-3 border-dark border-opacity-10 mx-auto object-fit-cover staff-avatar"
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

/** "Impressum" (legal notice) section of the About Us page: static company/legal info required by law. */
export function Impressum() {
  return (
    <section
      id="impressum"
      className="card border-0 shadow-lg rounded-4 bg-beige p-4 mb-5 reveal"
    >
      <h2 className="h3 fw-bold text-custom-red mb-3 custom-font-burbank">
        Impressum
      </h2>
      <p className="fs-5 text-dark mb-0 impressum-text">
        Rent-a-Camper GmbH
        <br />
        Einsteinring 35, 85609 Aschheim
        <br />
        Geschäftsführer: Dominik Kollenz & Kevin Gojani
        <br />
        E-Mail: service@rent-a-camper.me
        <br />
        Registergericht: Amtsgericht Heidelberg, HRB 99999
      </p>
    </section>
  );
}
