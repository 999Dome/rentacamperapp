import "bootstrap/dist/css/bootstrap.min.css";
import "../../scss/theme.scss";
import { createElement } from "../../utils/createElement.ts";
import { MainHeader } from "../../components/mainheader";
import { MainFooter } from "../../components/mainfooter";
import { updateBookingStatus } from "../../api/bookingsAPI.ts";
import { fetchCurrentUser, isLoggedIn } from "../../auth/auth.ts";
import { getCamperById } from "../../api/campersAPI.ts";

/**
 * Checkout success page: shown right after a Stripe redirect back to the
 * app. It shows a loading spinner while it confirms the booking with the
 * backend (marking it "confirmed" if a Stripe session id is present), then
 * replaces the spinner with a success or error message depending on the
 * outcome.
 */
const CheckoutSuccessPage = () => {
  const container = (
    <div className="container my-5 min-vh-80">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold custom-font-burbank text-white">Zahlungsbestätigung</h1>
        <p className="text-white-50 fs-5">
          Überprüfung deiner Zahlung wird durchgeführt...
        </p>
      </div>
      <div className="row g-5" id="success-content">
        <div className="col-12 text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  ) as HTMLElement;

  const processPayment = async () => {
    if (!isLoggedIn()) {
      window.location.href = "/pages/account/";
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session_id");
    const camperId = urlParams.get("camper");
    const bookingId = urlParams.get("bookingId");

    if (!bookingId || !camperId) {
      const content = container.querySelector("#success-content") as HTMLElement;
      content.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger rounded-4 p-4 text-center">
            <h5 class="fw-bold mb-2">Fehler beim Zahlungsvorgang</h5>
            <p class="mb-3">Buchungsinformationen fehlen. Bitte versuche es erneut.</p>
            <a href="/pages/checkout/" class="btn btn-primary">Zurück zum Checkout</a>
          </div>
        </div>
      `;
      return;
    }

    try {
      const user = await fetchCurrentUser();
      const camper = await getCamperById(camperId);

      if (!user || !user.id) {
        throw new Error("User not found");
      }

      if (sessionId) {
        await updateBookingStatus(bookingId, 'confirmed');
      }

      sessionStorage.removeItem("pendingCheckout");

      const content = container.querySelector("#success-content") as HTMLElement;
      content.innerHTML = `
        <div class="col-12">
          <div class="alert alert-success rounded-4 p-4 text-center">
            <div class="mb-3 success-emoji">✅</div>
            <h5 class="fw-bold mb-2">Zahlung erfolgreich!</h5>
            <p class="mb-3">Deine Buchung für <strong>${camper.name}</strong> wurde erfolgreich bestätigt!</p>
            <p class="text-muted small mb-3">Die Rechnung wurde dir soeben an deine E-Mail-Adresse gesendet.</p>
            <div class="mb-4">
              <span class="badge bg-light text-dark border p-2">
                Buchungs-ID: ${bookingId.split('-')[0]}
              </span>
            </div>
            <a href="/pages/account/" class="btn btn-primary">Zu meinen Buchungen</a>
          </div>
        </div>
      `;
    } catch (err) {
      console.error("Payment processing error:", err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      let displayMsg = "Es gab ein Problem bei der Zahlungsbestätigung. Bitte kontaktiere den Support.";
      if (errorMsg.includes("400")) {
        try {
          const match = errorMsg.match(/\{.*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]) as { message?: string | string[] };
            if (parsed.message) displayMsg = Array.isArray(parsed.message) ? parsed.message.join(', ') : parsed.message;
          }
        } catch {
          // Ignore JSON parse errors
        }
      }

      const content = container.querySelector("#success-content") as HTMLElement;
      content.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger rounded-4 p-4 text-center">
            <h5 class="fw-bold mb-2">Fehler bei der Buchung</h5>
            <p class="mb-3">${displayMsg}</p>
            <a href="/pages/checkout/" class="btn btn-primary">Zurück zum Checkout</a>
          </div>
        </div>
      `;
    }
  };

  processPayment();
  return container;
};

document.body.appendChild(MainHeader());
document.body.appendChild(CheckoutSuccessPage());
document.body.appendChild(MainFooter());
