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

            <div className="register-success d-none text-center py-4">
              <div className="mb-4" style={{ color: "#2E8B57" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" className="bi bi-envelope-check" viewBox="0 0 16 16">
                  <path d="M2 2a2 2 0 0 0-2 2v8.01A2 2 0 0 0 2 14h5.5a.5.5 0 0 0 0-1H2a1 1 0 0 1-1-1V6.628l7 3.493 8-4.004V9.5a.5.5 0 0 0 1 0V4a2 2 0 0 0-2-2H2Zm3.436 3.004L2 3.123V4l3.436 1.004ZM2.5 3h11a.5.5 0 0 1 .5.5v1.07l-6 3.001-6-3V3.5a.5.5 0 0 1 .5-.5Z"/>
                  <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Zm-1.993-1.679a.5.5 0 0 0-.686.172l-1.17 1.95-.547-.547a.5.5 0 0 0-.708.708l.774.773a.75.75 0 0 0 1.174-.144l1.335-2.226a.5.5 0 0 0-.172-.686Z"/>
                </svg>
              </div>
              <h4 className="text-white custom-font-base fw-bold mb-3">Postfach überprüfen</h4>
              <p className="text-white-50 custom-font-base small mb-4">
                Dein Account wurde erfolgreich erstellt! Wir haben dir einen Bestätigungslink gesendet. Bitte verifiziere deine E-Mail-Adresse, bevor du dich einloggst.
              </p>
              <button type="button" className="btn btn-outline-light w-100 rounded-pill custom-font-base btn-back-to-login py-2">
                Zurück zum Login
              </button>
            </div>

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
