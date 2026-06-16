import '../scss/theme.scss';
import 'bootstrap';
import { createElement } from '../utils/createElement.ts';

export function MainHeader() {
  return (
    <header
      id="main-header"
      className="header shadow-lg d-flex align-items-center justify-content-between py-2 px-5 mb-0"
    >
        <h1 className="title d-flex align-items-center gap-2 mb-0">
        <img
          src="/icon.svg"
          alt="Logo"
          className="header-icon"
          style="width: 54px; height: auto"
        />
        <span className="text-custom-light-blue mt-2">RENT</span>
        <span className="text-custom-red mt-2">-</span>
        <span className="text-custom-yellow mt-1">A</span>
        <span className="text-custom-light-blue mt-2">-</span>
        <span className="text-custom-red mt-2">CAMPER</span>
      </h1>
      <nav className="main-nav">
        <ul className="nav gap-4 gap-lg-5 mt-2">
          <li className="nav-item">
            <a href="/rent/" className="nav-link custom-font text-custom-light-blue p-0">
              Mieten
            </a>
          </li>
          <li className="nav-item">
            <a href="/rentout/" className="nav-link custom-font text-custom-red p-0">
              Vermieten
            </a>
          </li>
          <li className="nav-item">
            <a href="/aboutus/" className="nav-link custom-font text-custom-light-blue p-0">
              Über uns
            </a>
          </li>
          <li className="nav-item">
            <a href="/account/" className="nav-link custom-font text-custom-red p-0">
              Konto
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
