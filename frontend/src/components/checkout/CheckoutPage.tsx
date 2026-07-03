import { createElement } from "../../utils/createElement.ts";
import { fetchCurrentUser, isLoggedIn } from "../../auth/auth.ts";
import { getCamperById, calculatePrice } from "../../api/campersAPI.ts";
import { getCamperPrimaryImageById } from "../../api/camperImagesAPI.ts";
import { updateBookingStatus } from "../../api/bookingsAPI.ts";
import { createStripeCheckoutSession, createPayPalOrder, capturePayPalOrder } from "../../api/paymentsAPI.ts";
import type { MockCamper } from "../../utils/mockData.ts";
import { getDriversLicenseById } from "../../api/driversLicenseAPI.ts";
import { DriversLicenseValidator } from "../../domain/validators/drivers-license-validator.ts";

interface UserProfile {
  id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  profile?: {
    firstname?: string;
    lastname?: string;
    driver_license_class?: string | null;
  } | null;
}

interface AddonDetail {
  name: string;
  cost: number;
}

interface PriceCalculationResult {
  basePrice: number;
  nights: number;
  seasonSurchargeAmount: number;
  discountPercentage: number;
  discountAmount: number;
  cleaningFee: number;
  addonDetails: AddonDetail[];
  totalAmount: number;
  depositAmount: number;
}

interface PendingBookingData {
  bookingId: string;
  expiresAt: string;
  camperId: string;
  startDate: string;
  endDate: string;
  apiStartDate: string;
  apiEndDate: string;
  addons: string[];
  pickupLocationId?: string;
  returnLocationId?: string;
}

export function CheckoutPage() {
  const container = (
    <div className="container my-5" style={{ minHeight: "80vh" }}>
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold custom-font-base">Checkout</h1>
        <p className="text-muted fs-5">
          Fast geschafft! Überprüfe deine Daten und schließe die Buchung ab.
        </p>
        <div id="countdown-timer-container" className="mt-3"></div>
      </div>
      <div className="row g-5" id="checkout-content">
        <div className="col-12 text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  ) as HTMLElement;

  const loadData = async () => {
    if (!isLoggedIn()) {
      window.location.href = "/pages/account/";
      return;
    }

    const pendingDataStr = sessionStorage.getItem("pendingCheckout");
    if (!pendingDataStr) {
      window.location.href = "/";
      return;
    }

    const pendingData = JSON.parse(pendingDataStr) as PendingBookingData;
    const { camperId, apiStartDate, apiEndDate, addons } = pendingData;

    try {
      const [user, camperRaw, priceDataRaw] = await Promise.all([
        fetchCurrentUser(),
        getCamperById(camperId),
        calculatePrice(camperId, apiStartDate, apiEndDate, addons),
      ]);

      if (!user) {
        window.location.href = "/pages/account/";
        return;
      }

      const license = await getDriversLicenseById(camperRaw.required_license);
      const requiredLicenseClass = license?.class || "Klasse B";

      let image_url = "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7";
      try {
        const primaryImg = await getCamperPrimaryImageById(camperId);
        if (primaryImg && primaryImg.image_path) {
          image_url = primaryImg.image_path;
        }
      } catch (err) {
        console.warn("Failed to load primary image for checkout camper", err);
      }

      const camper: MockCamper = {
        ...camperRaw,
        image_url,
        features_list: [],
        owner_id: "user-1",
      };

      const priceData = priceDataRaw as PriceCalculationResult;

      renderContent(
        container.querySelector("#checkout-content") as HTMLElement,
        user as UserProfile,
        camper,
        priceData,
        pendingData,
        requiredLicenseClass,
      );
    } catch (error) {
      console.error(error);
      const content = container.querySelector(
        "#checkout-content",
      ) as HTMLElement;
      content.innerHTML = `<div class="alert alert-danger">Fehler beim Laden der Checkout-Daten. Bitte versuche es erneut.</div>`;
    }
  };

  const renderContent = (
    content: HTMLElement,
    user: UserProfile,
    camper: MockCamper,
    priceData: PriceCalculationResult,
    pendingData: PendingBookingData,
    requiredLicenseClass: string,
  ) => {
    content.innerHTML = "";
    
    // Timer Logic
    const timerContainer = document.getElementById("countdown-timer-container");
    let timerInterval: number | null = null;

    if (timerContainer && pendingData.expiresAt) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const expireTime = new Date(pendingData.expiresAt).getTime();
        const distance = expireTime - now;

        if (distance < 0) {
          if (timerInterval) clearInterval(timerInterval);
          timerContainer.innerHTML = `<div class="alert alert-danger d-inline-block fw-bold">Die Reservierungszeit ist abgelaufen. Bitte starte die Buchung erneut.</div>`;
          
          const confirmBtn = document.getElementById("confirm-payment-btn") as HTMLButtonElement;
          if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.textContent = "Reservierung abgelaufen";
          }
          
          const paypalContainer = document.getElementById("paypal-buttons-container");
          if (paypalContainer) paypalContainer.style.display = "none";
          
          setTimeout(() => {
            sessionStorage.removeItem("pendingCheckout");
            window.location.href = `/pages/camper-details/?id=${camper.id}`;
          }, 3000);
          return;
        }

        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        const formattedMin = minutes.toString().padStart(2, '0');
        const formattedSec = seconds.toString().padStart(2, '0');

        timerContainer.innerHTML = `
          <div class="alert alert-warning d-inline-block fw-bold shadow-sm" style="border-radius: 12px; font-size: 1.1rem;">
            ⏳ Deine Reservierung läuft ab in: <span class="text-danger fs-4">${formattedMin}:${formattedSec}</span> Minuten
          </div>
        `;
      };
      
      updateTimer();
      timerInterval = window.setInterval(updateTimer, 1000);
    }

    const userLicenseClass = user.profile?.driver_license_class;
    const isLicensed = DriversLicenseValidator.isLicensedToDrive(userLicenseClass, requiredLicenseClass);

    const leftCol = document.createElement("div");
    leftCol.className = "col-lg-7";

    if (!isLicensed) {
      leftCol.appendChild(
        <div className="alert alert-danger rounded-4 p-3 mb-4">
          <h5 className="fw-bold mb-2 text-danger">Führerscheinprüfung fehlgeschlagen</h5>
          <p className="mb-0 small">
            Deine hinterlegte Führerscheinklasse <strong>({userLicenseClass || "Keine"})</strong> reicht für diesen Camper nicht aus.
            Dieses Fahrzeug erfordert mindestens die Klasse <strong>{requiredLicenseClass}</strong>.
          </p>
        </div>
      );
    }

    leftCol.appendChild(
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4 p-md-5">
          <h4 className="fw-bold mb-4">Persönliche Daten</h4>
          <div className="row g-3">
            <div className="col-sm-6">
              <label className="form-label text-muted small text-uppercase fw-bold">
                Vorname
              </label>
              <input
                type="text"
                className="form-control bg-light"
                value={user.profile?.firstname || ""}
                readOnly
              />
            </div>
            <div className="col-sm-6">
              <label className="form-label text-muted small text-uppercase fw-bold">
                Nachname
              </label>
              <input
                type="text"
                className="form-control bg-light"
                value={user.profile?.lastname || ""}
                readOnly
              />
            </div>
            <div className="col-12">
              <label className="form-label text-muted small text-uppercase fw-bold">
                E-Mail
              </label>
              <input
                type="email"
                className="form-control bg-light"
                value={user.email}
                readOnly
              />
            </div>
            <div className="col-12">
              <label className="form-label text-muted small text-uppercase fw-bold">
                Führerschein Klasse
              </label>
              <input
                type="text"
                className="form-control bg-light"
                value={user.profile?.driver_license_class || "Nicht angegeben"}
                readOnly
              />
            </div>
          </div>
        </div>
      </div>,
    );

    leftCol.appendChild(
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4 p-md-5">
          <h4 className="fw-bold mb-4">Zahlungsart</h4>
          <div className="d-flex flex-column gap-3">
            <label
              className="border rounded-3 p-3 d-flex align-items-center gap-3"
              style={{ cursor: "pointer" }}
            >
              <input
                type="radio"
                name="payment"
                value="stripe"
                className="form-check-input mt-0 payment-method"
                defaultChecked
              />
              <div>
                <span className="fw-medium d-block">💳 Kreditkarte (Stripe)</span>
                <small className="text-muted">Sicher bezahlen mit Mastercard, Visa oder American Express</small>
              </div>
            </label>
            <label
              className="border rounded-3 p-3 d-flex align-items-center gap-3"
              style={{ cursor: "pointer" }}
            >
              <input
                type="radio"
                name="payment"
                value="paypal"
                className="form-check-input mt-0 payment-method"
              />
              <div>
                <span className="fw-medium d-block">🅿️ PayPal</span>
                <small className="text-muted">Schnell und sicher mit deinem PayPal Konto</small>
              </div>
            </label>
          </div>
          <div id="paypal-buttons-container" style={{ display: "none", marginTop: "20px" }}></div>
        </div>
      </div>,
    );

    
    const rightCol = document.createElement("div");
    rightCol.className = "col-lg-5";

    
    const receiptItems = [];
    receiptItems.push(
      <li className="list-group-item d-flex justify-content-between px-0 py-2 border-0 bg-transparent text-dark fw-medium">
        <span>
          {priceData.basePrice.toFixed(2)} € x {priceData.nights} Nächte
        </span>
        <span>{(priceData.basePrice * priceData.nights).toFixed(2)} €</span>
      </li>,
    );

    if (priceData.seasonSurchargeAmount > 0) {
      receiptItems.push(
        <li className="list-group-item d-flex justify-content-between px-0 py-2 border-0 bg-transparent text-danger">
          <span>Hauptsaison-Aufschlag</span>
          <span>+ {priceData.seasonSurchargeAmount.toFixed(2)} €</span>
        </li>,
      );
    }

    if (priceData.discountAmount > 0) {
      receiptItems.push(
        <li className="list-group-item d-flex justify-content-between px-0 py-2 border-0 bg-transparent text-success">
          <span>Rabatt ({priceData.discountPercentage}%)</span>
          <span>- {priceData.discountAmount.toFixed(2)} €</span>
        </li>,
      );
    }

    if (priceData.cleaningFee > 0) {
      receiptItems.push(
        <li className="list-group-item d-flex justify-content-between px-0 py-2 border-0 bg-transparent text-muted">
          <span>Reinigungsgebühr</span>
          <span>{priceData.cleaningFee.toFixed(2)} €</span>
        </li>,
      );
    }

    priceData.addonDetails.forEach((addon) => {
      receiptItems.push(
        <li className="list-group-item d-flex justify-content-between px-0 py-2 border-0 bg-transparent text-muted">
          <span>{addon.name}</span>
          <span>{addon.cost.toFixed(2)} €</span>
        </li>,
      );
    });

    const confirmButton = (
      <button
        className="btn w-100 py-3 fw-bold fs-4 text-white custom-font-base mt-4"
        id="confirm-payment-btn"
        style={{
          backgroundColor: isLicensed ? "var(--bs-primary, #ea5d42)" : "#6c757d",
          letterSpacing: "2px",
        }}
        disabled={!isLicensed}
      >
        {isLicensed ? "Zahlungspflichtig buchen" : "Führerschein unzureichend"}
      </button>
    ) as HTMLButtonElement;

    const getSelectedPaymentMethod = (): string => {
      const selected = document.querySelector(
        'input[name="payment"]:checked'
      ) as HTMLInputElement;
      return selected?.value || "stripe";
    };

    // Initialisiere PayPal Smart Buttons nur einmal
    const initPayPalButtons = async () => {
      const container = document.getElementById("paypal-buttons-container");
      if (!container || container.innerHTML !== "") return;

      try {
        const paypalScript = document.createElement("script");
        paypalScript.src =
          "https://www.paypal.com/sdk/js?client-id=" +
          (import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb");
        paypalScript.async = true;
        paypalScript.onload = () => {
          const paypalWindow = window as unknown as {
            paypal?: {
              Buttons: (options: {
                createOrder: () => Promise<string>;
                onApprove: (data: { orderID: string }) => Promise<void>;
                onError: () => void;
              }) => {
                render: (container: HTMLElement | null) => void;
              };
            };
          };

          if (paypalWindow.paypal) {
            paypalWindow.paypal
              .Buttons({
                createOrder: async () => {
                  const response = await createPayPalOrder(
                    camper.id,
                    priceData.totalAmount,
                    pendingData.apiStartDate,
                    pendingData.apiEndDate
                  );
                  return response.id;
                },
                onApprove: async (data: { orderID: string }) => {
                  try {
                    confirmButton.disabled = true;
                    confirmButton.textContent = "Zahlung wird verarbeitet...";

                    await capturePayPalOrder(data.orderID);

                    await updateBookingStatus(pendingData.bookingId, 'confirmed');

                    alert("Zahlung erfolgreich! Buchung abgeschlossen.");
                    sessionStorage.removeItem("pendingCheckout");
                    window.location.href = `/pages/checkout-success/?bookingId=${pendingData.bookingId}&camper=${pendingData.camperId}`;
                  } catch (err) {
                    console.error(err);
                    const errorMsg = err instanceof Error ? err.message : String(err);
                    let displayMsg = "Fehler bei der Zahlungsbestätigung. Bitte versuchen Sie es erneut.";
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
                    
                    const existingAlert = document.getElementById("booking-error-alert");
                    if (existingAlert) existingAlert.remove();
                    
                    const errorAlert = document.createElement("div");
                    errorAlert.id = "booking-error-alert";
                    errorAlert.className = "alert alert-danger mt-3";
                    errorAlert.innerHTML = `<i class="bi bi-exclamation-triangle-fill me-2"></i>${displayMsg}`;
                    
                    confirmButton.parentElement?.insertBefore(errorAlert, confirmButton);

                    confirmButton.disabled = false;
                    confirmButton.textContent = "Zahlungspflichtig buchen";
                  }
                },
                onError: () => {
                  alert("Fehler bei der PayPal-Zahlung. Bitte versuchen Sie es erneut.");
                  confirmButton.disabled = false;
                  confirmButton.textContent = "Zahlungspflichtig buchen";
                },
              })
              .render(container);
          }
        };
        document.head.appendChild(paypalScript);
      } catch (err) {
        console.error("Error initializing PayPal buttons:", err);
      }
    };

    // Payment method change handler
    const updatePaymentDisplay = () => {
      const method = getSelectedPaymentMethod();
      const paypalContainer = document.getElementById(
        "paypal-buttons-container"
      );

      if (method === "paypal") {
        if (paypalContainer) {
          paypalContainer.style.display = "block";
        }
        confirmButton.style.display = "none";
        initPayPalButtons();
      } else {
        if (paypalContainer) {
          paypalContainer.style.display = "none";
        }
        confirmButton.style.display = "block";
      }
    };

    // Add payment method change listeners
    document.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      if (target.name === "payment") {
        updatePaymentDisplay();
      }
    });

    confirmButton.addEventListener("click", async () => {
      try {
        const method = getSelectedPaymentMethod();

        if (method === "stripe") {
          confirmButton.disabled = true;
          confirmButton.textContent = "Wird zu Stripe weitergeleitet...";

          const session = await createStripeCheckoutSession(
            camper.id,
            priceData.totalAmount,
            pendingData.apiStartDate,
            pendingData.apiEndDate,
            pendingData.bookingId
          );

          if (session.url) {
            window.location.href = session.url;
          }
        }
      } catch (err) {
        console.error(err);
        const errorMsg = err instanceof Error ? err.message : String(err);
        let displayMsg = "Fehler beim Zahlungsprozess. Bitte versuchen Sie es erneut.";
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
        
        const existingAlert = document.getElementById("booking-error-alert");
        if (existingAlert) existingAlert.remove();
        
        const errorAlert = document.createElement("div");
        errorAlert.id = "booking-error-alert";
        errorAlert.className = "alert alert-danger mt-3";
        errorAlert.innerHTML = `<i class="bi bi-exclamation-triangle-fill me-2"></i>${displayMsg}`;
        
        confirmButton.parentElement?.insertBefore(errorAlert, confirmButton);

        confirmButton.disabled = false;
        confirmButton.textContent = "Zahlungspflichtig buchen";
      }
    });

    rightCol.appendChild(
      <div
        className="card border-0 shadow-lg rounded-4 overflow-hidden position-sticky"
        style={{ top: "100px" }}
      >
        <img
          src={
            camper.image_url ||
            "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7"
          }
          alt={camper.name || "Camper"}
          className="card-img-top"
          style={{ height: "200px", objectFit: "cover" }}
        />
        <div className="card-body p-4 p-md-5">
          <h4 className="fw-bold custom-font-base mb-1">{camper.name}</h4>
          <p className="text-muted small mb-4">{camper.manufacturer}</p>

          <div className="d-flex justify-content-between mb-4 bg-light p-3 rounded-3 border">
            <div className="text-center w-50 border-end">
              <div
                className="text-uppercase small text-muted fw-bold"
                style={{ fontSize: "10px" }}
              >
                Abholung
              </div>
              <div className="fw-bold">{pendingData.startDate}</div>
            </div>
            <div className="text-center w-50">
              <div
                className="text-uppercase small text-muted fw-bold"
                style={{ fontSize: "10px" }}
              >
                Rückgabe
              </div>
              <div className="fw-bold">{pendingData.endDate}</div>
            </div>
          </div>

          <h6 className="fw-bold text-uppercase small text-muted mb-3">
            Preisdetails
          </h6>
          <ul className="list-group list-group-flush fs-6 mb-3">
            {receiptItems}
          </ul>

          <hr className="my-3" />

          <div className="d-flex justify-content-between align-items-center fw-bold fs-3 mb-2">
            <span>Gesamt</span>
            <span className="blue">{priceData.totalAmount.toFixed(2)} €</span>
          </div>

          <div
            className="text-muted p-2 bg-light rounded border border-secondary-subtle"
            style={{ fontSize: "13px" }}
          >
            <div className="d-flex justify-content-between fw-medium">
              <span>Kaution (vor Ort zu hinterlegen):</span>
              <span>
                {priceData.depositAmount
                  ? priceData.depositAmount.toFixed(2)
                  : "0.00"}{" "}
                €
              </span>
            </div>
          </div>

          {confirmButton}

          <p
            className="text-center text-muted mt-3 mb-0"
            style={{ fontSize: "12px" }}
          >
            Mit dem Klick auf "Zahlungspflichtig buchen" akzeptierst du unsere
            AGBs und Datenschutzbestimmungen.
          </p>
        </div>
      </div>,
    );

    content.appendChild(leftCol);
    content.appendChild(rightCol);
  };

  loadData();

  return container;
}
