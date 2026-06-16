import { createElement, createSVGElement } from '../../utils/createElement.ts';

function createInstagramIcon() {
  return createSVGElement('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', fill: 'currentColor', className: 'bi bi-instagram', viewBox: '0 0 16 16' },
    createSVGElement('path', { d: 'M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.036 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334' })
  );
}

function createTwitterIcon() {
  return createSVGElement('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', fill: 'currentColor', className: 'bi bi-twitter-x', viewBox: '0 0 16 16' },
    createSVGElement('path', { d: 'M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z' })
  );
}

export function MainFooter() {
  return (
    <footer className="bg-dark text-white pt-5 pb-4 mt-auto border-top border-secondary border-opacity-25">
      <div className="container">
        <div className="row gy-4">
          <div className="col-12 col-lg-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <img src="/icon.svg" alt="Logo" width="40" height="auto" />
              <span className="fs-4 fw-bold custom-font text-white">RENT-A-CAMPER</span>
            </div>
            <p className="text-white-50 small pe-lg-4">
              Dein zuverlässiger Partner für unvergessliche Wohnmobil-Abenteuer. Finde deinen Traum-Camper, miete flexibel und entdecke die Freiheit der Straße.
            </p>
          </div>
          <div className="col-6 col-lg-2 offset-lg-1">
            <h5 className="text-white mb-3 fs-6 text-uppercase fw-bold">Entdecken</h5>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <li><a href="/rent/" className="text-white-50 text-decoration-none footer-link">Fahrzeuge mieten</a></li>
              <li><a href="/rentout/" className="text-white-50 text-decoration-none footer-link">Camper vermieten</a></li>
              <li><a href="/aboutus/" className="text-white-50 text-decoration-none footer-link">Über uns</a></li>
              <li><a href="/account/" className="text-white-50 text-decoration-none footer-link">Mein Konto</a></li>
            </ul>
          </div>
          <div className="col-6 col-lg-2">
            <h5 className="text-white mb-3 fs-6 text-uppercase fw-bold">Hilfe & Recht</h5>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <li><a href="#" className="text-white-50 text-decoration-none footer-link">FAQ</a></li>
              <li><a href="#" className="text-white-50 text-decoration-none footer-link">Kontakt</a></li>
              <li><a href="#" className="text-white-50 text-decoration-none footer-link">Impressum</a></li>
              <li><a href="#" className="text-white-50 text-decoration-none footer-link">Datenschutz</a></li>
            </ul>
          </div>
          <div className="col-12 col-lg-3">
            <h5 className="text-white mb-3 fs-6 text-uppercase fw-bold">Folge uns</h5>
            <div className="d-flex gap-3">
              <a href="#" className="text-white-50 footer-link">
                {createInstagramIcon()}
              </a>
              <a href="#" className="text-white-50 footer-link">
                {createTwitterIcon()}
              </a>
            </div>
          </div>
        </div>
        <div className="row mt-5 pt-4 border-top border-secondary border-opacity-25 text-center">
          <div className="col-12">
            <p className="text-white-50 small mb-0">&copy; 2026 Rent-A-Camper. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
