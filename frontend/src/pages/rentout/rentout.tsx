import "bootstrap/dist/css/bootstrap.min.css";
import "../../scss/theme.scss";
import { createElement } from "../../utils/createElement.ts";
import { MainHeader } from "../../components/mainheader.tsx";
import { MainFooter } from "../../components/mainfooter.tsx";
import { RentoutPage } from "../../components/rentout/RentoutPage.tsx";
import { isLoggedIn } from "../../auth/auth.ts";

/**
 * Access-denied notice shown on the rentout page when no user is logged in.
 */
function AccessDeniedNotice() {
  return (
    <div className="container py-5 text-center my-5 min-vh-60">
      <div className="card border-0 shadow-lg rounded-4 p-5 mx-auto mt-5 bg-beige access-denied-card">
        <h2 className="fw-bold mb-3 text-custom-red">Zugriff verweigert</h2>
        <p className="text-muted fs-5 mb-4">Um deine Fahrzeuge zu verwalten und das Vermieter-Dashboard zu nutzen, musst du eingeloggt sein.</p>
        <a href="/pages/account/" className="btn btn-primary btn-lg rounded-pill px-4">Jetzt Einloggen</a>
      </div>
    </div>
  );
}

document.body.appendChild(MainHeader());

try {
  if (isLoggedIn()) {
    document.body.appendChild(RentoutPage());
  } else {
    document.body.appendChild(<AccessDeniedNotice />);
  }
} catch (error) {
  console.error("Failed to render rentout page:", error);
  document.body.appendChild(
    <div className="container py-5 text-center my-5">
      <h2 className="text-danger">Ein Fehler ist beim Laden der Seite aufgetreten.</h2>
    </div>
  );
}

document.body.appendChild(MainFooter());
