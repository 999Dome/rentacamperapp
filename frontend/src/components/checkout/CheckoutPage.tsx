import { createElement } from "../../utils/createElement.ts";
import { fetchCurrentUser, isLoggedIn } from "../../auth/auth.ts";
import { getCamperById, calculatePrice } from "../../api/campersAPI.ts";
import type { Camper } from "../../types/interface.ts";

export function CheckoutPage() {
  const container = (
    <div className="container my-5" style={{ minHeight: "80vh" }}>
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold custom-font-base">Checkout</h1>
        <p className="text-muted fs-5">
          Fast geschafft! Überprüfe deine Daten und schließe die Buchung ab.
        </p>
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

    const pendingData = JSON.parse(pendingDataStr);
    const { camperId, startDate, endDate, addons } = pendingData;

    try {
      const [user, camper, priceData] = await Promise.all([
        fetchCurrentUser(),
        getCamperById(camperId),
        calculatePrice(camperId, startDate, endDate, addons),
      ]);

      if (!user) {
        window.location.href = "/pages/account/";
        return;
      }

      renderContent(
        container.querySelector("#checkout-content") as HTMLElement,
        user,
        camper,
        priceData as any,
        pendingData,
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
    user: any,
    camper: Camper,
    priceData: any,
    pendingData: any,
  ) => {
    content.innerHTML = "";

    
    const leftCol = document.createElement("div");
    leftCol.className = "col-lg-7";

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
                className="form-check-input mt-0"
                defaultChecked
              />
              <span className="fw-medium">Kreditkarte (Dummy)</span>
            </label>
            <label
              className="border rounded-3 p-3 d-flex align-items-center gap-3"
              style={{ cursor: "pointer" }}
            >
              <input
                type="radio"
                name="payment"
                className="form-check-input mt-0"
              />
              <span className="fw-medium">PayPal (Dummy)</span>
            </label>
          </div>
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

    priceData.addonDetails.forEach((addon: any) => {
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
        style={{
          backgroundColor: "var(--bs-primary, #ea5d42)",
          letterSpacing: "2px",
        }}
      >
        Zahlungspflichtig buchen
      </button>
    ) as HTMLButtonElement;

    confirmButton.addEventListener("click", () => {
      alert(
        "Buchung erfolgreich! (Dummy - Backend Logic noch nicht implementiert)",
      );
      sessionStorage.removeItem("pendingCheckout");
      window.location.href = "/";
    });

    rightCol.appendChild(
      <div
        className="card border-0 shadow-lg rounded-4 overflow-hidden position-sticky"
        style={{ top: "100px" }}
      >
        <img
          src={
            (camper as any).images?.[0] ||
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
