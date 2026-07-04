import "bootstrap/dist/css/bootstrap.min.css";
import "../../scss/theme.scss";
import { MainHeader } from "../../components/mainheader.tsx";
import { MainFooter } from "../../components/mainfooter.tsx";
import { RentoutPage } from "../../components/rentout/RentoutPage.tsx";
import { isLoggedIn } from "../../auth/auth.ts";

document.body.appendChild(MainHeader());

try {
  if (isLoggedIn()) {
    document.body.appendChild(RentoutPage());
  } else {
    const container = document.createElement("div");
    container.className = "container py-5 text-center my-5";
    container.style.minHeight = "60vh";
    container.innerHTML = `
      <div class="card border-0 shadow-lg rounded-4 p-5 mx-auto mt-5" style="max-width: 600px;">
        <h2 class="fw-bold mb-3 text-custom-red">Zugriff verweigert</h2>
        <p class="text-muted fs-5 mb-4">Um deine Fahrzeuge zu verwalten und das Vermieter-Dashboard zu nutzen, musst du eingeloggt sein.</p>
        <a href="/pages/account/" class="btn btn-primary btn-lg rounded-pill px-4">Jetzt Einloggen</a>
      </div>
    `;
    document.body.appendChild(container);
  }
} catch (error) {
  console.error("Failed to render rentout page:", error);
  const errorContainer = document.createElement("div");
  errorContainer.className = "container py-5 text-center my-5";
  errorContainer.innerHTML = `<h2 class="text-danger">Ein Fehler ist beim Laden der Seite aufgetreten.</h2>`;
  document.body.appendChild(errorContainer);
}

document.body.appendChild(MainFooter());
