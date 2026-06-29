import '../scss/theme.scss';
import 'bootstrap';
import { createElement } from '../utils/createElement.ts';

export function MainHeader() {
  return (
    <nav
      id="main-header"
      className="navbar navbar-expand-md header shadow-lg py-2 px-3 px-md-5 mb-0"
    >
      <div className="container-fluid p-0 d-flex justify-content-between align-items-center">
        <a href="/" className="navbar-brand title d-flex align-items-center gap-2 mb-0 text-decoration-none">
          <img
            src="/icon.svg"
            alt="Logo"
            className="header-icon"
            style="width: 54px; height: auto"
          />
          <span className="d-none d-md-inline-flex align-items-center">
            <span className="text-custom-light-blue mt-2">RENT</span>
            <span className="text-custom-red mt-2 mx-1">-</span>
            <span className="text-custom-yellow mt-1">A</span>
            <span className="text-custom-light-blue mt-2 mx-1">-</span>
            <span className="text-custom-red mt-2">CAMPER</span>
          </span>
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavContent"
          aria-controls="mainNavContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ borderColor: "rgba(255,255,255,0.5)" }}
        >
          <span className="navbar-toggler-icon" style={{ filter: "invert(1)" }}></span>
        </button>

        <div className="collapse navbar-collapse justify-content-end" id="mainNavContent">
          <ul className="navbar-nav gap-3 gap-lg-5 mt-3 mt-md-0 text-center text-md-start">
            <li className="nav-item">
              <a href="/pages/rent/" className="nav-link custom-font text-custom-light-blue p-0">
                Mieten
              </a>
            </li>
            <li className="nav-item">
              <a href="/pages/rentout/" className="nav-link custom-font text-custom-red p-0">
                Vermieten
              </a>
            </li>
            <li className="nav-item">
              <a href="/pages/aboutus/" className="nav-link custom-font text-custom-light-blue p-0">
                Über uns
              </a>
            </li>
            <li className="nav-item">
              <a href="/pages/account/" className="nav-link custom-font text-custom-red p-0">
                Konto
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
