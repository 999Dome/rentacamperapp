import { createElement } from "../../utils/createElement.ts";
import "../../scss/theme.scss";
import "bootstrap";

import { setupAuthLogic } from "./AuthPageLogic.ts";
export function AuthPage() {
  const page = (
    <div className="auth-page-bg bg-dark min-vh-100 d-flex align-items-center justify-content-center p-3 p-md-4 overflow-hidden position-relative">
      <a 
        href="/" 
        className="btn btn-outline-light position-absolute top-0 start-0 m-3 m-md-4 d-flex align-items-center gap-2 custom-font-base text-decoration-none shadow-sm"
        style={{ zIndex: 10, borderRadius: "50px" }}
      >
        &#8592; Zurück zur Startseite
      </a>
      <div
        className="glass-card shadow-lg border-secondary border-opacity-25 rounded-4 position-relative w-100 overflow-hidden"
        style={{ maxWidth: "500px" }}
      >
        <div className="text-center pt-5 px-4 pb-0">
          <img
            src="/icon.svg"
            alt="Logo"
            className="header-icon"
            style="width: 54px; height: auto"
          />
          <h2 className="title display-1 fw-bold mb-3 d-flex justify-content-center align-items-end">
            <span className="blue mt-2">RENT</span>
            <span className="red mt-2 mx-1">-</span>
            <span className="yellow mt-1">A</span>
            <span className="blue mt-2 mx-1">-</span>
            <span className="red mt-2">CAMPER</span>
          </h2>
          <p className="text-white-50 display-6 custom-font-burbank mb-4">
            Willkommen, Abenteurer!
          </p>

          <div className="d-flex justify-content-center mb-0">
            <div
              className="d-inline-flex bg-dark bg-opacity-175 rounded-pill p-1 border border-secondary border-opacity-50"
              style={{ width: "400px" }}
            >
              <button
                type="button"
                className="btn w-50 rounded-pill toggle-btn-pill active-pill custom-font-base"
                id="pill-login"
              >
                Einloggen
              </button>
              <button
                type="button"
                className="btn w-50 rounded-pill toggle-btn-pill custom-font-base text-white-50"
                id="pill-register"
              >
                Regristrieren
              </button>
            </div>
          </div>
        </div>

        <div className="auth-slider-track mt-4" id="auth-slider-track">
          <div className="auth-panel w-50 px-4 px-md-5 pt-3 pb-5 flex-shrink-0 d-flex flex-column">
            <div
              className="alert alert-danger d-none small py-2 login-error custom-font-base"
              role="alert"
            ></div>

            <form className="login-form">
              <div className="mb-3">
                <label className="form-label text-white-50 small text-uppercase fw-bold custom-font-base">
                  E-Mail
                </label>
                <input
                  type="email"
                  name="loginEmail"
                  className="form-control custom-input form-control-lg custom-font-base"
                  placeholder="deine@email.de"
                  required
                />
              </div>
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <label className="form-label text-white-50 small text-uppercase fw-bold mb-0 custom-font-base">
                    Passwort
                  </label>
                  <a
                    href="#"
                    className="small yellow text-decoration-none custom-font-base forgot-password-link"
                  >
                    Kennwort vergessen?
                  </a>
                </div>
                <input
                  type="password"
                  name="loginPassword"
                  className="form-control custom-input form-control-lg mt-2 custom-font-base"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-custom-yellow w-100 py-3 fw-bold fs-5 shadow-sm text-dark mb-2 custom-font-base"
              >
                Einloggen
              </button>
            </form>
          </div>

          <div className="auth-panel w-50 px-4 px-md-5 pt-3 pb-5 flex-shrink-0 d-flex flex-column">
            <div
              className="alert alert-danger d-none small py-2 register-error custom-font-base"
              role="alert"
            ></div>

            <form className="register-form">
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label text-white-50 small text-uppercase fw-bold custom-font-base">
                    Vorname
                  </label>
                  <input
                    type="text"
                    name="regFirstName"
                    className="form-control custom-input custom-font-base"
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label text-white-50 small text-uppercase fw-bold custom-font-base">
                    Nachname
                  </label>
                  <input
                    type="text"
                    name="regLastName"
                    className="form-control custom-input custom-font-base"
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-white-50 small text-uppercase fw-bold custom-font-base">
                  E-Mail
                </label>
                <input
                  type="email"
                  name="regEmail"
                  className="form-control custom-input custom-font-base"
                  required
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label text-white-50 small text-uppercase fw-bold custom-font-base">
                    Passwort
                  </label>
                  <input
                    type="password"
                    name="regPassword"
                    className="form-control custom-input custom-font-base"
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label text-white-50 small text-uppercase fw-bold custom-font-base">
                    Passwort Bestätigen
                  </label>
                  <input
                    type="password"
                    name="regPasswordConfirm"
                    className="form-control custom-input custom-font-base"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-white-50 small text-uppercase fw-bold custom-font-base">
                  Führerschein
                </label>
                <select
                  name="regLicense"
                  className="form-select custom-input custom-font-base"
                  required
                >
                  <option value="" disabled selected>
                    Klasse wählen
                  </option>
                  <option value="B">Klasse B</option>
                  <option value="B96">Klasse B96</option>
                  <option value="BE">Klasse BE</option>
                  <option value="C1">Klasse C1</option>
                  <option value="C1E">Klasse C1E</option>
                  <option value="C">Klasse C</option>
                  <option value="CE">Klasse CE</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-custom-yellow w-100 py-3 fw-bold fs-5 shadow-sm text-dark mb-2 custom-font-base"
              >
                Account erstellen
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  ) as HTMLElement;

  setupAuthLogic(page);
  return page;
}
