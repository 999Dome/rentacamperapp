import { createElement } from '../../utils/createElement.ts';
import type { Camper, Addon, PricingRule } from '../../types/interface.ts';
import { isLoggedIn, fetchCurrentUser } from '../../auth/auth.ts';
import { DriversLicenseValidator } from '../../domain/validators/drivers-license-validator.ts';
import type { LocationResponse } from '../../infrastructure/api/location-api-client.ts';
import { PriceHeader } from './booking-card/PriceHeader.tsx';
import { DateRangeDisplay } from './booking-card/DateRangeDisplay.tsx';
import { LocationDropdown } from './booking-card/LocationDropdown.tsx';
import { AddonsChecklist } from './booking-card/AddonsChecklist.tsx';
import { BookButton } from './booking-card/BookButton.tsx';
import { setupCustomDropdown, type DropdownController } from './booking-card/location-dropdown.tsx';
import { setupBookingDateRangePicker } from './booking-card/booking-date-range-picker.ts';
import { PriceBreakdownList, type PriceBreakdownRow } from '../common/PriceBreakdownList.tsx';
import { LicenseWarningBanner } from '../common/LicenseWarningBanner.tsx';

/**
 * Renders the sticky booking widget shown on the camper detail page: price
 * header, date range picker, pickup/return location dropdowns, addon
 * checklist, book button and (initially hidden) price breakdown/receipt.
 *
 * This function is also responsible for all of the widget's behavior:
 * restoring/saving an in-progress booking to `sessionStorage`, checking the
 * current user's driver's license against the camper's required license,
 * calculating and displaying the price whenever the selection changes, and
 * creating the pending booking + redirecting to checkout when "Reservieren"
 * is clicked.
 *
 * @param camper The camper being booked.
 * @param addons The addons/extras available for this camper.
 * @param _pricingRules Currently unused here (pricing is calculated server-side).
 * @param locations The list of locations offered for pickup/return.
 * @returns The booking card element (a `col-12 col-lg-4` column).
 */
export function BookingCard(camper: Camper, addons: Addon[], _pricingRules: PricingRule[], locations: LocationResponse[]) {
  const pricePerNight = camper.price_per_night_base || camper.engine_power || 0;
  const card = (
    <div className="col-12 col-lg-4">
      <div className="card border-0 shadow-lg rounded-4 p-4 position-sticky bg-white booking-card-sticky" id="booking-card-container">

        {PriceHeader(pricePerNight)}

        <div className="border border-dark-subtle rounded-3 mb-4 overflow-hidden">
          {DateRangeDisplay()}
          <LocationDropdown fieldPrefix="pickup" label="Abholort" />
          <LocationDropdown fieldPrefix="return" label="Rückgabeort" />
          {AddonsChecklist(addons)}
        </div>

        {BookButton()}

        <div id="receipt-container" className="d-none">
          <ul className="list-group list-group-flush fs-6 mb-3" id="receipt-list">
          </ul>
          <hr className="my-3 text-muted opacity-25" />
          <div className="d-flex justify-content-between align-items-center fw-bold fs-4">
            <span>Gesamt</span>
            <span className="text-custom-light-blue" id="receipt-total">0 €</span>
          </div>
          <div className="text-muted mt-3 p-2 bg-light rounded border border-secondary-subtle fs-13px">
            <div className="d-flex justify-content-between fw-medium">
              <span>Kaution (vor Ort zu hinterlegen):</span>
              <span id="receipt-deposit">0 €</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  ) as HTMLElement;

  const wrapper = card.querySelector('.date-picker-wrapper') as HTMLElement;
  const checkinDisplay = card.querySelector('#checkin-display') as HTMLElement;
  const checkoutDisplay = card.querySelector('#checkout-display') as HTMLElement;

  interface BookingSessionData {
    startDateStr: string;
    endDateStr: string;
    apiStartDate: string;
    apiEndDate: string;
    pickupLocationId: string;
    returnLocationId: string;
    selectedAddons: string[];
  }

  const savedSessionDataStr = sessionStorage.getItem(`pendingBooking_${camper.id}`);
  let savedSessionData: BookingSessionData | null = null;
  if (savedSessionDataStr) {
    try {
      savedSessionData = JSON.parse(savedSessionDataStr) as BookingSessionData;
    } catch (e) {
      console.error(e);
    }
  }

  const urlParams = new URLSearchParams(window.location.search);
  const qLocation = urlParams.get("location");
  const qDateFrom = urlParams.get("dateFrom"); // format YYYY-MM-DD
  const qDateTo = urlParams.get("dateTo");     // format YYYY-MM-DD

  const formatApiDate = (dateStr: string | null): string => {
    if (!dateStr) return "";
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
    return "";
  };

  let startDateStr = savedSessionData?.startDateStr || formatApiDate(qDateFrom);
  let endDateStr = savedSessionData?.endDateStr || formatApiDate(qDateTo);
  let apiStartDate = savedSessionData?.apiStartDate || qDateFrom || "";
  let apiEndDate = savedSessionData?.apiEndDate || qDateTo || "";
  let currentTotalPrice = 0;
  let selectedAddons: string[] = savedSessionData?.selectedAddons || [];
  
  const initialPickupLocationId = savedSessionData?.pickupLocationId || qLocation || "";
  const initialReturnLocationId = savedSessionData?.returnLocationId || qLocation || "";

  const bookButton = card.querySelector('#bookButton') as HTMLButtonElement;
  bookButton.disabled = true;

  const saveStateToSession = () => {
    const pickupSelect = card.querySelector('#pickup-location') as HTMLInputElement;
    const returnSelect = card.querySelector('#return-location') as HTMLInputElement;
    const bookingSessionData = {
      startDateStr,
      endDateStr,
      apiStartDate,
      apiEndDate,
      pickupLocationId: pickupSelect?.value || "",
      returnLocationId: returnSelect?.value || "",
      selectedAddons: selectedAddons,
    };
    sessionStorage.setItem(`pendingBooking_${camper.id}`, JSON.stringify(bookingSessionData));
  };

  const clearStateFromSession = () => {
    sessionStorage.removeItem(`pendingBooking_${camper.id}`);
  };

  if (isLoggedIn()) {
    Promise.all([
      fetchCurrentUser(),
      import('../../api/driversLicenseAPI.ts').then(m => m.getDriversLicenseById(camper.required_license))
    ]).then(([user, license]) => {
      if (user && license) {
        const userProfile = user as unknown as { profile?: { drivers_license_class?: string | null; driver_license_class?: string | null } | null };
        const userLicenseClass = userProfile.profile?.drivers_license_class || userProfile.profile?.driver_license_class;
        const requiredLicenseClass = license.class;
        const isLicensed = DriversLicenseValidator.isLicensedToDrive(userLicenseClass, requiredLicenseClass);
        if (!isLicensed) {
          const container = card.querySelector('#booking-card-container') as HTMLElement;
          const warningDiv = LicenseWarningBanner({
            variant: 'compact',
            userLicenseClass,
            requiredLicenseClass,
          });
          container.insertBefore(warningDiv, bookButton);
        }
      }
    });
  }

  bookButton.addEventListener('click', async () => {
    if (!isLoggedIn()) {
      saveStateToSession();
      window.location.href = `/pages/account/?redirectTo=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }

    const pickupSelect = card.querySelector('#pickup-location') as HTMLInputElement;
    const returnSelect = card.querySelector('#return-location') as HTMLInputElement;

    try {
      bookButton.disabled = true;
      bookButton.textContent = 'Reserviert...';

      const user = await fetchCurrentUser();
      if (!user || !user.id) throw new Error('User not found');

      const { createBooking } = await import('../../api/bookingsAPI.ts');

      const bookingData = {
        camper_id: camper.id,
        user_id: user.id as string,
        start_date: apiStartDate,
        end_date: apiEndDate,
        total_price: currentTotalPrice,
        addons: selectedAddons,
        pickup_location_id: pickupSelect?.value || undefined,
        return_location_id: returnSelect?.value || undefined,
      };

      const booking = await createBooking(bookingData);
      clearStateFromSession();

      const checkoutData = {
        bookingId: booking.id,
        expiresAt: booking.expires_at,
        camperId: camper.id,
        startDate: startDateStr,
        endDate: endDateStr,
        apiStartDate: apiStartDate,
        apiEndDate: apiEndDate,
        addons: selectedAddons,
        pickupLocationId: pickupSelect?.value || undefined,
        returnLocationId: returnSelect?.value || undefined,
      };

      sessionStorage.setItem('pendingCheckout', JSON.stringify(checkoutData));
      window.location.href = '/pages/checkout/';
    } catch (err) {
      console.error(err);
      let errorMsg = 'Fehler bei der Reservierung. Möglicherweise ist das Fahrzeug in diesem Zeitraum bereits ausgebucht.';
      if (err instanceof Error) {
        try {
          const match = err.message.match(/\{.*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]) as { message?: string | string[] };
            if (parsed && parsed.message) {
              errorMsg = Array.isArray(parsed.message) ? parsed.message.join(', ') : parsed.message;
            }
          }
        } catch {
          // Ignore JSON parse errors
        }
      }
      alert(errorMsg);
      bookButton.disabled = false;
      bookButton.textContent = 'Reservieren';
    }
  });

  const receiptContainer = card.querySelector('#receipt-container') as HTMLElement;
  const receiptList = card.querySelector('#receipt-list') as HTMLElement;
  const receiptTotal = card.querySelector('#receipt-total') as HTMLElement;

  const triggerCalculation = async () => {
    const pickupSelect = card.querySelector('#pickup-location') as HTMLInputElement;
    const returnSelect = card.querySelector('#return-location') as HTMLInputElement;

    if (!startDateStr || !endDateStr || !pickupSelect?.value || !returnSelect?.value) {
      receiptContainer.classList.add('d-none');
      bookButton.disabled = true;
      updateStickyPosition();
      return;
    }

    try {
      const { calculatePrice } = await import('../../api/campersAPI.ts');
      interface CalculatePriceResult {
        basePrice: number;
        nights: number;
        seasonSurchargeAmount: number;
        discountAmount: number;
        discountPercentage: number;
        cleaningFee: number;
        addonDetails: { name: string; cost: number }[];
        totalAmount: number;
        depositAmount?: number;
      }
      const result = await calculatePrice(camper.id, startDateStr, endDateStr, selectedAddons) as CalculatePriceResult;

      receiptList.innerHTML = '';

      const rows: PriceBreakdownRow[] = [
        {
          label: `${result.basePrice} € x ${result.nights} Nächte`,
          value: `${(result.basePrice * result.nights).toFixed(2)} €`,
          textClass: 'text-dark fw-medium',
        },
      ];

      if (result.seasonSurchargeAmount > 0) {
        rows.push({
          label: `Hauptsaison-Aufschlag`,
          value: `+ ${result.seasonSurchargeAmount.toFixed(2)} €`,
          textClass: 'text-danger',
        });
      }

      if (result.discountAmount > 0) {
        rows.push({
          label: `Rabatt (${result.discountPercentage}%)`,
          value: `- ${result.discountAmount.toFixed(2)} €`,
          textClass: 'text-success',
        });
      }

      if (result.cleaningFee > 0) {
        rows.push({ label: `Reinigungsgebühr`, value: `${result.cleaningFee.toFixed(2)} €` });
      }

      result.addonDetails.forEach((addon: { name: string; cost: number }) => {
        rows.push({ label: `${addon.name}`, value: `${addon.cost.toFixed(2)} €` });
      });

      receiptList.appendChild(PriceBreakdownList({ rows }));

      currentTotalPrice = result.totalAmount;
      receiptTotal.textContent = `${result.totalAmount.toFixed(2)} €`;

      const receiptDeposit = card.querySelector('#receipt-deposit') as HTMLElement;
      if (receiptDeposit && result.depositAmount !== undefined) {
        receiptDeposit.textContent = `${result.depositAmount.toFixed(2)} €`;
      }

      receiptContainer.classList.remove('d-none');
      bookButton.disabled = false;
      updateStickyPosition();

    } catch (error) {
      console.error(error);
      receiptContainer.classList.add('d-none');
      bookButton.disabled = true;
      updateStickyPosition();
    }
  };

  interface DropdownsMap {
    pickup: DropdownController | null;
    return: DropdownController | null;
  }

  const dropdowns: DropdownsMap = {
    pickup: null,
    return: null
  };

  dropdowns.pickup = setupCustomDropdown(
    card,
    locations,
    'pickup-dropdown-container',
    'pickup-toggle',
    'pickup-menu',
    'pickup-search',
    'pickup-options',
    'pickup-location',
    'pickup-display-text',
    (val) => {
      if (val && dropdowns.return && !dropdowns.return.getValue()) {
        dropdowns.return.setValue(val);
      }
      saveStateToSession();
      triggerCalculation();
    }
  );

  dropdowns.return = setupCustomDropdown(
    card,
    locations,
    'return-dropdown-container',
    'return-toggle',
    'return-menu',
    'return-search',
    'return-options',
    'return-location',
    'return-display-text',
    () => {
      saveStateToSession();
      triggerCalculation();
    }
  );

  if (initialPickupLocationId && dropdowns.pickup) {
    dropdowns.pickup.setValue(initialPickupLocationId);
  }
  if (initialReturnLocationId && dropdowns.return) {
    dropdowns.return.setValue(initialReturnLocationId);
  }
  if (savedSessionData?.selectedAddons) {
    savedSessionData.selectedAddons.forEach((addonId: string) => {
      const cb = card.querySelector(`#addon-${addonId}`) as HTMLInputElement;
      if (cb) cb.checked = true;
    });
  }
  if (startDateStr) {
    checkinDisplay.textContent = startDateStr;
  }
  if (endDateStr) {
    checkoutDisplay.textContent = endDateStr;
  }

  setupBookingDateRangePicker({
    wrapper,
    checkinDisplay,
    checkoutDisplay,
    camperId: camper.id,
    initialApiStartDate: apiStartDate,
    initialApiEndDate: apiEndDate,
    onDatesChanged: (dates) => {
      startDateStr = dates.startDateStr;
      endDateStr = dates.endDateStr;
      apiStartDate = dates.apiStartDate;
      apiEndDate = dates.apiEndDate;
      saveStateToSession();
      triggerCalculation();
    },
    onPreloadedDatesBlocked: (dates) => {
      startDateStr = dates.startDateStr;
      endDateStr = dates.endDateStr;
      apiStartDate = dates.apiStartDate;
      apiEndDate = dates.apiEndDate;
      clearStateFromSession();
      triggerCalculation();
    },
  });

  const checkboxes = card.querySelectorAll('.addon-checkbox') as NodeListOf<HTMLInputElement>;
  checkboxes.forEach(cb => {
    cb.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.checked) {
        selectedAddons.push(target.value);
      } else {
        selectedAddons = selectedAddons.filter(id => id !== target.value);
      }
      (card as HTMLElement & { selectedAddons?: string[] }).selectedAddons = selectedAddons;
      saveStateToSession();
      triggerCalculation();
    });
  });

  const updateStickyPosition = () => {
    const bookingCardContainer = card.querySelector('#booking-card-container') as HTMLElement;
    if (bookingCardContainer) {
      const cardHeight = bookingCardContainer.offsetHeight;
      const windowHeight = window.innerHeight;

      if (cardHeight > windowHeight - 120) {
        bookingCardContainer.style.top = `calc(100vh - ${cardHeight + 20}px)`;
      } else {
        bookingCardContainer.style.top = '100px';
      }
    }
  };

  if (savedSessionData || (startDateStr && endDateStr && initialPickupLocationId)) {
    triggerCalculation();
  }

  setTimeout(updateStickyPosition, 100);
  window.addEventListener('resize', updateStickyPosition);

  return card;
}
