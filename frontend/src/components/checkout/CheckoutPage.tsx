import { createElement } from "../../utils/createElement.ts";
import { fetchCurrentUser, isLoggedIn } from "../../auth/auth.ts";
import { getCamperById, calculatePrice } from "../../api/campersAPI.ts";
import { getCamperPrimaryImageById } from "../../api/camperImagesAPI.ts";
import { createStripeCheckoutSession } from "../../api/paymentsAPI.ts";
import type { MockCamper } from "../../utils/mockData.ts";
import { getDriversLicenseById } from "../../api/driversLicenseAPI.ts";
import { DriversLicenseValidator } from "../../domain/validators/drivers-license-validator.ts";
import type { PriceBreakdownRow } from "../common/PriceBreakdownList.tsx";
import { LicenseWarningBanner } from "../common/LicenseWarningBanner.tsx";
import { CheckoutLoadingState } from "./checkout-page/CheckoutLoadingState.tsx";
import { startCheckoutCountdownTimer } from "./checkout-page/checkout-countdown-timer.ts";
import { PersonalDataCard } from "./checkout-page/PersonalDataCard.tsx";
import { PaymentMethodSelector } from "./checkout-page/PaymentMethodSelector.tsx";
import { initPayPalButtons } from "./checkout-page/paypal-checkout.ts";
import { OrderSummaryCard } from "./checkout-page/OrderSummaryCard.tsx";
import { showBookingErrorAlert } from "./checkout-page/booking-error.tsx";
import type { UserProfile, PriceCalculationResult, PendingBookingData } from "./checkout-page/types.ts";

/**
 * The checkout page: shows a loading skeleton while the pending booking's
 * user/camper/price data is fetched, then renders the full two-column
 * checkout form (personal data + payment method on the left, order summary +
 * confirm button on the right) built from the pieces in `./checkout-page/`.
 *
 * This function itself only owns the top-level wiring:
 * - `loadData` fetches everything the page needs and hands it to `renderContent`.
 * - `renderContent` builds `leftCol`/`rightCol` from the extracted
 *   sub-components, creates the single `confirmButton` element and passes it
 *   to whichever piece needs to read or mutate it (the Stripe click handler,
 *   the PayPal flow, and the terms checkbox), and keeps the single source of
 *   truth for `checkoutTermsAccepted`.
 *
 * @returns The page container element (kept in the DOM and filled in asynchronously).
 */
export function CheckoutPage() {
  const container = CheckoutLoadingState();

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

    let checkoutTermsAccepted = false;

    startCheckoutCountdownTimer(pendingData, camper.id);

    const userLicenseClass = user.profile?.drivers_license_class || user.profile?.driver_license_class;
    const isLicensed = DriversLicenseValidator.isLicensedToDrive(userLicenseClass, requiredLicenseClass);

    const receiptRows: PriceBreakdownRow[] = [
      {
        label: `${priceData.basePrice.toFixed(2)} € x ${priceData.nights} Nächte`,
        value: `${(priceData.basePrice * priceData.nights).toFixed(2)} €`,
        textClass: "text-dark fw-medium",
      },
    ];

    if (priceData.seasonSurchargeAmount > 0) {
      receiptRows.push({
        label: "Hauptsaison-Aufschlag",
        value: `+ ${priceData.seasonSurchargeAmount.toFixed(2)} €`,
        textClass: "text-danger",
      });
    }

    if (priceData.discountAmount > 0) {
      receiptRows.push({
        label: `Rabatt (${priceData.discountPercentage}%)`,
        value: `- ${priceData.discountAmount.toFixed(2)} €`,
        textClass: "text-success",
      });
    }

    if (priceData.cleaningFee > 0) {
      receiptRows.push({
        label: "Reinigungsgebühr",
        value: `${priceData.cleaningFee.toFixed(2)} €`,
      });
    }

    priceData.addonDetails.forEach((addon) => {
      receiptRows.push({ label: addon.name, value: `${addon.cost.toFixed(2)} €` });
    });

    const confirmButton = (
      <button
        className={`btn w-100 py-3 fw-bold fs-4 text-black custom-font-base mt-2 letter-spacing-2 ${isLicensed ? "book-button-bg" : "bg-license-disabled"}`}
        id="confirm-payment-btn"
        disabled={true}
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
        initPayPalButtons({
          camper,
          priceData,
          pendingData,
          confirmButton,
          getTermsAccepted: () => checkoutTermsAccepted,
        });
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
          confirmButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Wird zu Stripe weitergeleitet...';

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
        showBookingErrorAlert(confirmButton, err, "Fehler beim Zahlungsprozess. Bitte versuchen Sie es erneut.");
      }
    });

    const leftCol = (
      <div className="col-lg-7">
        {!isLicensed &&
          LicenseWarningBanner({ variant: "detailed", userLicenseClass, requiredLicenseClass })}
        <PersonalDataCard user={user} />
        <PaymentMethodSelector />
      </div>
    ) as HTMLElement;

    const rightCol = (
      <div className="col-lg-5">
        <OrderSummaryCard
          camper={camper}
          pendingData={pendingData}
          priceData={priceData}
          receiptRows={receiptRows}
          confirmButton={confirmButton}
          onTermsChange={(accepted: boolean) => {
            checkoutTermsAccepted = accepted;
            if (isLicensed) {
              confirmButton.disabled = !checkoutTermsAccepted;
            }
          }}
        />
      </div>
    ) as HTMLElement;

    content.appendChild(leftCol);
    content.appendChild(rightCol);
  };

  loadData();

  return container;
}
