import { createElement } from '../../utils/createElement.ts';

/**
 * Full-width home page hero: a background photo with a dark overlay, the
 * app logo, the animated tagline, and a call-to-action button linking to
 * the rent page.
 */
export function Hero() {
  return (
    <div className="text-center bg-image hero-cover w-100 m-0 p-0">
      <div className="mask hero-mask h-100 w-100">
        <div className="d-flex justify-content-center h-100 align-items-center h-100">
          <div className="text-white text-center">
            <img
              src="/icon.svg"
              className="mb-4 hero-logo"
              alt="Logo"
            />

            <p className="display-2 mb-4 text-stroke-grey custom-font-burbank hero-tagline">
              <span className="text-custom-light-blue">Dein Weg</span>
              <span className="text-custom-red">. </span>
              <span className="text-custom-yellow">Dein Tempo</span>
              <span className="text-custom-light-blue">. </span>
              <span className="text-custom-red">Dein Ziel</span>
              <span className="text-custom-yellow">. </span>
            </p>

            <a className="btn btn-outline-light btn-lg" href="/pages/rent/" role="button">
              Jetzt ein Wohnmobil mieten
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
