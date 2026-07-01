import "bootstrap/dist/css/bootstrap.min.css";
import "../../scss/theme.scss";
import { createElement } from "../../utils/createElement.ts";
import { MainHeader } from "../../components/mainheader";
import { MainFooter } from "../../components/mainfooter";
import { createBooking } from "../../api/bookingsAPI.ts";
import { fetchCurrentUser, isLoggedIn } from "../../auth/auth.ts";
import { getCamperById } from "../../api/campersAPI.ts";

const CheckoutSuccessPage = () => {
  const container = (
    <div className="container my-5" style={{ minHeight: "80vh" }}>
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold custom-font-base">Zahlungsbestätigung</h1>
        <p className="text-muted fs-5">
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

    if (!sessionId || !camperId) {
      const content = container.querySelector("#success-content") as HTMLElement;
      content.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger rounded-4 p-4 text-center">
            <h5 class="fw-bold mb-2">Fehler beim Zahlungsvorgang</h5>
            <p class="mb-3">Zahlungsinformationen fehlen. Bitte versuche es erneut.</p>
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

      const pendingDataStr = sessionStorage.getItem("pendingCheckout");
      if (!pendingDataStr) {
        throw new Error("Pending checkout data not found");
      }

      const pendingData = JSON.parse(pendingDataStr);

      await createBooking({
        camper_id: camperId,
        user_id: user.id as string,
        start_date: pendingData.startDate,
        end_date: pendingData.endDate,
        total_price: pendingData.totalPrice,
        addons: pendingData.addons,
      });

      sessionStorage.removeItem("pendingCheckout");

      const content = container.querySelector("#success-content") as HTMLElement;
      content.innerHTML = `
        <div class="col-12">
          <div class="alert alert-success rounded-4 p-4 text-center">
            <div class="mb-3" style="font-size: 48px;">✅</div>
            <h5 class="fw-bold mb-2">Zahlung erfolgreich!</h5>
            <p class="mb-3">Deine Buchung für ${camper.name} wurde bestätigt.</p>
            <div class="mb-3">
              <small class="text-muted">
                Session ID: ${sessionId}
              </small>
            </div>
            <a href="/pages/account/" class="btn btn-primary">Zu meinen Buchungen</a>
          </div>
        </div>
      `;
    } catch (err) {
      console.error("Payment processing error:", err);
      const content = container.querySelector("#success-content") as HTMLElement;
      content.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger rounded-4 p-4 text-center">
            <h5 class="fw-bold mb-2">Fehler bei der Verarbeitung</h5>
            <p class="mb-3">Es gab ein Problem bei der Zahlungsbestätigung. Bitte kontaktiere den Support.</p>
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
