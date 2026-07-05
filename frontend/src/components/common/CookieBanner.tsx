import { createElement } from "../../utils/createElement.ts";

/**
 * Shows the cookie-consent banner fixed to the bottom of the page, unless
 * the visitor already made a choice (remembered in `localStorage`). The
 * banner slides in from below shortly after being added to the page, and
 * slides back out before being removed once the visitor accepts either
 * "essential only" or "all" cookies.
 */
export function initCookieBanner() {
  if (typeof window === "undefined" || !window.document) return;

  const consent = localStorage.getItem("cookie_consent");
  if (consent) return; // Already consented

  const banner = (
    <div
      id="cookie-consent-banner"
      className="fixed-bottom p-4 bg-white shadow-lg border-top cookie-consent-banner"
    >
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-8 mb-3 mb-lg-0">
            <h5 className="fw-bold mb-2">Wir verwenden Cookies 🍪</h5>
            <p className="text-muted mb-0 small">
              Diese Website verwendet Cookies, um dein Nutzererlebnis zu verbessern,
              unsere Dienste bereitzustellen und Zugriffe zu analysieren.
              Weitere Informationen findest du in unserer Datenschutzerklärung.
            </p>
          </div>
          <div className="col-lg-4 d-flex justify-content-lg-end gap-2">
            <button
              id="cookie-btn-essential"
              className="btn btn-outline-secondary fw-medium px-4"
            >
              Nur essenzielle
            </button>
            <button
              id="cookie-btn-all"
              className="btn btn-primary fw-medium px-4 text-white cookie-btn-accept-all"
            >
              Alle akzeptieren
            </button>
          </div>
        </div>
      </div>
    </div>
  ) as HTMLElement;

  document.body.appendChild(banner);

  // Trigger animation after adding to DOM
  setTimeout(() => {
    banner.classList.add("cookie-banner-visible");
  }, 100);

  const handleConsent = (type: "all" | "essential") => {
    localStorage.setItem("cookie_consent", type);
    banner.classList.remove("cookie-banner-visible");
    setTimeout(() => {
      banner.remove();
    }, 400); // Wait for animation to finish
  };

  const btnEssential = banner.querySelector("#cookie-btn-essential");
  const btnAll = banner.querySelector("#cookie-btn-all");

  btnEssential?.addEventListener("click", () => handleConsent("essential"));
  btnAll?.addEventListener("click", () => handleConsent("all"));
}
