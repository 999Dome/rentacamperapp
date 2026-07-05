import { createElement } from "../../utils/createElement";

/**
 * Home page section explaining the 4-step rental process ("Search & Find",
 * "Transparent Pricing", "Easy Sign-up", "Book Securely") as a row of cards,
 * each with a numbered icon.
 */
export function Workflow() {
  return (
    <section className="container my-5 py-5">
      <div className="text-center mb-5">
        <h2 className="lead display-4 text-white custom-font-burbank">
          In 4 einfachen Schritten in den Traumurlaub starten
        </h2>
      </div>

      <div className="row g-4 justify-content-center">
        {/* Step 1 */}
        <div className="col-12 col-md-6 col-lg-3">
          <div
            className="card h-100 text-white border-0 p-4 text-center shadow-lg hover-zoom rounded-4 workflow-step-card"
          >
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4 mx-auto shadow workflow-step-icon workflow-step-icon-blue"
            >
              <span className="fs-2 fw-bold text-custom-light-blue custom-font-burbank">1</span>
            </div>
            <h3 className="h5 fw-bold mb-3 custom-font-base text-white">Suchen & Finden</h3>
            <p className="text-white-50 small mb-0">
              Durchstöbere unsere Flotte und nutze praktische Filter, um genau den Camper zu finden, der zu dir und deinem Abenteuer passt.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="col-12 col-md-6 col-lg-3">
          <div
            className="card h-100 text-white border-0 p-4 text-center shadow-lg hover-zoom rounded-4 workflow-step-card"
          >
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4 mx-auto shadow workflow-step-icon workflow-step-icon-yellow"
            >
              <span className="fs-2 fw-bold text-custom-yellow custom-font-burbank">2</span>
            </div>
            <h3 className="h5 fw-bold mb-3 custom-font-base text-white">Transparente Preise</h3>
            <p className="text-white-50 small mb-0">
              Wähle deinen Zeitraum und spannende Extras. Wir zeigen dir sofort den genauen Preis an – ganz ohne versteckte Kosten.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="col-12 col-md-6 col-lg-3">
          <div
            className="card h-100 text-white border-0 p-4 text-center shadow-lg hover-zoom rounded-4 workflow-step-card"
          >
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4 mx-auto shadow workflow-step-icon workflow-step-icon-red"
            >
              <span className="fs-2 fw-bold text-custom-red custom-font-burbank">3</span>
            </div>
            <h3 className="h5 fw-bold mb-3 custom-font-base text-white">Einfache Anmeldung</h3>
            <p className="text-white-50 small mb-0">
              Erstelle in Sekundenschnelle ein Konto. Deine Daten sind bei uns sicher und du kannst deine Buchungen jederzeit verwalten.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="col-12 col-md-6 col-lg-3">
          <div
            className="card h-100 text-white border-0 p-4 text-center shadow-lg hover-zoom rounded-4 workflow-step-card"
          >
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4 mx-auto shadow workflow-step-icon workflow-step-icon-green"
            >
              <span className="fs-2 fw-bold custom-font-burbank workflow-step-number-green">4</span>
            </div>
            <h3 className="h5 fw-bold mb-3 custom-font-base text-white">Sicher Buchen</h3>
            <p className="text-white-50 small mb-0">
              Schließe deine Reservierung mit einem Klick ab. Packe deine Koffer und freue dich auf einen unvergesslichen Roadtrip!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}