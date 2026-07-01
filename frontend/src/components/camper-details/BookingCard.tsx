import { createElement } from '../../utils/createElement.ts';
import type { Camper, Addon, PricingRule } from '../../types/interface.ts';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { German } from 'flatpickr/dist/l10n/de.js';
import { isLoggedIn, fetchCurrentUser } from '../../auth/auth.ts';
import { DriversLicenseValidator } from '../../domain/validators/drivers-license-validator.ts';

export function BookingCard(camper: Camper, addons: Addon[], _pricingRules: PricingRule[]) {
  const pricePerNight = camper.price_per_night_base || camper.engine_power || 0;
  const card = (
    <div className="col-12 col-lg-4">
      <div className="card border-0 shadow-lg rounded-4 p-4 position-sticky" style={{ top: '100px', backgroundColor: "#ffffff", transition: "top 0.2s ease" }} id="booking-card-container">
        
        <div className="mb-4 d-flex align-items-baseline gap-2">
          <span className="fs-1 fw-bold custom-font-base text-custom-light-blue lh-1">{pricePerNight} €</span> 
          <span className="fs-5 text-muted lh-1">/ Nacht</span>
        </div>

        <div className="border border-dark-subtle rounded-3 mb-4 overflow-hidden">
          <div className="d-flex border-bottom border-dark-subtle date-picker-wrapper" style={{ cursor: "pointer" }}>
            <div className="p-2 pt-1 w-50 border-end border-dark-subtle position-relative bg-white" style={{ cursor: "pointer" }}>
              <label className="form-label mb-0 text-uppercase fw-bold text-dark" style={{ fontSize: "10px", paddingLeft: "4px", pointerEvents: "none" }}>Abholdatum</label>
              <div id="checkin-display" className="fw-medium text-dark text-truncate" style={{ paddingLeft: "4px", fontSize: "15px", minHeight: "22px" }}>Datum auswählen</div>
            </div>
            <div className="p-2 pt-1 w-50 position-relative bg-white" style={{ cursor: "pointer" }}>
              <label className="form-label mb-0 text-uppercase fw-bold text-dark" style={{ fontSize: "10px", paddingLeft: "4px", pointerEvents: "none" }}>Rückgabedatum</label>
              <div id="checkout-display" className="fw-medium text-dark text-truncate" style={{ paddingLeft: "4px", fontSize: "15px", minHeight: "22px" }}>Datum auswählen</div>
            </div>
          </div>
          <div className="p-2 pt-1 bg-white">
            <label className="form-label mb-0 text-uppercase fw-bold text-dark" style={{ fontSize: "10px", paddingLeft: "4px" }}>Extras</label>
            <div className="px-1 mt-2 mb-1">
              {addons.length > 0 ? addons.map(a => (
                <div className="form-check mb-2">
                  <input className="form-check-input shadow-none addon-checkbox" type="checkbox" value={a.id} id={`addon-${a.id}`} style={{ cursor: "pointer" }} />
                  <label className="form-check-label fw-medium addon-label" htmlFor={`addon-${a.id}`} style={{ cursor: "pointer", fontSize: "14px", transition: "opacity 0.2s ease, color 0.2s ease" }}>
                    {a.name} <span className="addon-price">(+{a.price}€ {a.is_per_night ? '/Nacht' : ''})</span>
                  </label>
                </div>
              )) : (
                <div className="text-muted" style={{ fontSize: "14px" }}>Keine Extras verfügbar</div>
              )}
            </div>
          </div>
        </div>

        <button className="btn btn-lg w-100 mb-3 fw-bold custom-font-base fs-3 text-white" 
                style={{ backgroundColor: "var(--bs-primary, #ea5d42)", letterSpacing: "2px" }} 
                id="bookButton">
          Reservieren
        </button>
        
        <p className="text-center text-muted small mb-4">Das ist nur eine Anfrage. Dir wird noch nichts berechnet.</p>

        <div id="receipt-container" className="d-none">
          <ul className="list-group list-group-flush fs-6 mb-3" id="receipt-list">
          </ul>
          <hr className="my-3 text-muted opacity-25" />
          <div className="d-flex justify-content-between align-items-center fw-bold fs-4">
            <span>Gesamt</span>
            <span className="text-custom-light-blue" id="receipt-total">0 €</span>
          </div>
          <div className="text-muted mt-3 p-2 bg-light rounded border border-secondary-subtle" style={{ fontSize: "13px" }}>
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

  let startDateStr = "";
  let endDateStr = "";
  const bookButton = card.querySelector('#bookButton') as HTMLButtonElement;
  bookButton.disabled = true;

  if (isLoggedIn()) {
    Promise.all([
      fetchCurrentUser(),
      import('../../api/driversLicenseAPI.ts').then(m => m.getDriversLicenseById(camper.required_license))
    ]).then(([user, license]) => {
      if (user && license) {
        const userLicenseClass = (user as any).profile?.driver_license_class;
        const requiredLicenseClass = license.class;
        const isLicensed = DriversLicenseValidator.isLicensedToDrive(userLicenseClass, requiredLicenseClass);
        if (!isLicensed) {
          const container = card.querySelector('#booking-card-container') as HTMLElement;
          const warningDiv = (
            <div className="alert alert-warning rounded-3 p-2 mb-3 mt-3 text-center" style={{ fontSize: "13px" }}>
              <strong>Hinweis:</strong> Deine Führerscheinklasse ({userLicenseClass || "Keine"}) ist unzureichend (benötigt: {requiredLicenseClass}).
            </div>
          ) as HTMLElement;
          container.insertBefore(warningDiv, bookButton);
        }
      }
    });
  }

  bookButton.addEventListener('click', () => {
    const checkoutData = {
      camperId: camper.id,
      startDate: startDateStr,
      endDate: endDateStr,
      addons: selectedAddons
    };
    sessionStorage.setItem('pendingCheckout', JSON.stringify(checkoutData));

    if (isLoggedIn()) {
      window.location.href = '/pages/checkout/';
    } else {
      window.location.href = '/pages/account/';
    }
  });

  const receiptContainer = card.querySelector('#receipt-container') as HTMLElement;
  const receiptList = card.querySelector('#receipt-list') as HTMLElement;
  const receiptTotal = card.querySelector('#receipt-total') as HTMLElement;

  const triggerCalculation = async () => {
    if (!startDateStr || !endDateStr) {
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
      
      const addRow = (label: string, value: string, textClass = 'text-muted') => {
        const li = document.createElement('li');
        li.className = `list-group-item d-flex justify-content-between align-items-center px-0 py-2 border-0 bg-transparent ${textClass}`;
        li.innerHTML = `<span>${label}</span><span>${value}</span>`;
        receiptList.appendChild(li);
      };

      addRow(`${result.basePrice} € x ${result.nights} Nächte`, `${(result.basePrice * result.nights).toFixed(2)} €`, 'text-dark fw-medium');

      if (result.seasonSurchargeAmount > 0) {
        addRow(`Hauptsaison-Aufschlag`, `+ ${result.seasonSurchargeAmount.toFixed(2)} €`, 'text-danger');
      }

      if (result.discountAmount > 0) {
        addRow(`Rabatt (${result.discountPercentage}%)`, `- ${result.discountAmount.toFixed(2)} €`, 'text-success');
      }

      if (result.cleaningFee > 0) {
        addRow(`Reinigungsgebühr`, `${result.cleaningFee.toFixed(2)} €`);
      }

      result.addonDetails.forEach((addon: { name: string; cost: number }) => {
        addRow(`${addon.name}`, `${addon.cost.toFixed(2)} €`);
      });

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

  if (wrapper) {
    flatpickr(wrapper, {
      mode: "range",
      minDate: "today",
      showMonths: window.innerWidth > 768 ? 2 : 1,
      locale: German,
      dateFormat: "d.m.Y",
      onChange: function(selectedDates, _dateStr, instance) {
        if (selectedDates.length > 0) {
          startDateStr = instance.formatDate(selectedDates[0], "d.m.Y");
          checkinDisplay.textContent = startDateStr;
        } else {
          startDateStr = "";
          checkinDisplay.textContent = "Datum auswählen";
        }
        
        if (selectedDates.length > 1) {
          endDateStr = instance.formatDate(selectedDates[1], "d.m.Y");
          checkoutDisplay.textContent = endDateStr;
        } else {
          endDateStr = "";
          checkoutDisplay.textContent = "Datum auswählen";
        }
        
        triggerCalculation();
      }
    });
  }

  let selectedAddons: string[] = [];
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

  setTimeout(updateStickyPosition, 100);
  window.addEventListener('resize', updateStickyPosition);

  return card;
}
