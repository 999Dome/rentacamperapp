import { createElement } from '../../utils/createElement.ts';
import type { Camper, Addon, PricingRule } from '../../types/interface.ts';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { German } from 'flatpickr/dist/l10n/de.js';
import { isLoggedIn, fetchCurrentUser } from '../../auth/auth.ts';
import { DriversLicenseValidator } from '../../domain/validators/drivers-license-validator.ts';
import type { LocationResponse } from '../../infrastructure/api/location-api-client.ts';

export function BookingCard(camper: Camper, addons: Addon[], _pricingRules: PricingRule[], locations: LocationResponse[]) {
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
          <div className="p-2 pt-1 bg-white border-bottom border-dark-subtle position-relative custom-dropdown-container" id="pickup-dropdown-container">
            <label className="form-label mb-0 text-uppercase fw-bold text-dark" style={{ fontSize: "10px", paddingLeft: "4px", pointerEvents: "none" }}>Abholort</label>
            <div className="custom-dropdown-toggle d-flex justify-content-between align-items-center fw-medium text-dark ps-1 pe-2 py-1" style={{ fontSize: "14px", cursor: "pointer", minHeight: "28px" }} id="pickup-toggle">
              <span id="pickup-display-text" className="text-muted">Bitte wählen...</span>
              <i className="bi bi-chevron-down text-muted" style={{ fontSize: "12px" }}></i>
            </div>
            <input type="hidden" id="pickup-location" value="" />
            <div className="custom-dropdown-menu d-none position-absolute start-0 end-0 bg-white border rounded-3 shadow-lg p-2 mt-1" style={{ zIndex: 1000, maxHeight: "250px", overflowY: "auto", top: "100%" }} id="pickup-menu">
              <div className="px-1 py-1 border-bottom mb-2">
                <input type="text" className="form-control form-control-sm border-0 bg-light shadow-none" placeholder="Suchen..." id="pickup-search" style={{ fontSize: "13px" }} />
              </div>
              <div className="custom-dropdown-options" id="pickup-options">
              </div>
            </div>
          </div>
          <div className="p-2 pt-1 bg-white border-bottom border-dark-subtle position-relative custom-dropdown-container" id="return-dropdown-container">
            <label className="form-label mb-0 text-uppercase fw-bold text-dark" style={{ fontSize: "10px", paddingLeft: "4px", pointerEvents: "none" }}>Rückgabeort</label>
            <div className="custom-dropdown-toggle d-flex justify-content-between align-items-center fw-medium text-dark ps-1 pe-2 py-1" style={{ fontSize: "14px", cursor: "pointer", minHeight: "28px" }} id="return-toggle">
              <span id="return-display-text" className="text-muted">Bitte wählen...</span>
              <i className="bi bi-chevron-down text-muted" style={{ fontSize: "12px" }}></i>
            </div>
            <input type="hidden" id="return-location" value="" />
            <div className="custom-dropdown-menu d-none position-absolute start-0 end-0 bg-white border rounded-3 shadow-lg p-2 mt-1" style={{ zIndex: 1000, maxHeight: "250px", overflowY: "auto", top: "100%" }} id="return-menu">
              <div className="px-1 py-1 border-bottom mb-2">
                <input type="text" className="form-control form-control-sm border-0 bg-light shadow-none" placeholder="Suchen..." id="return-search" style={{ fontSize: "13px" }} />
              </div>
              <div className="custom-dropdown-options" id="return-options">
              </div>
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

  let startDateStr = savedSessionData?.startDateStr || "";
  let endDateStr = savedSessionData?.endDateStr || "";
  let apiStartDate = savedSessionData?.apiStartDate || "";
  let apiEndDate = savedSessionData?.apiEndDate || "";
  let currentTotalPrice = 0;
  let selectedAddons: string[] = savedSessionData?.selectedAddons || [];

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

  const setupCustomDropdown = (
    containerId: string, 
    toggleId: string, 
    menuId: string, 
    searchId: string, 
    optionsId: string, 
    hiddenInputId: string, 
    displayTextId: string,
    onValueChange: (val: string) => void
  ) => {
    const containerEl = card.querySelector(`#${containerId}`) as HTMLElement;
    const toggleEl = card.querySelector(`#${toggleId}`) as HTMLElement;
    const menuEl = card.querySelector(`#${menuId}`) as HTMLElement;
    const searchEl = card.querySelector(`#${searchId}`) as HTMLInputElement;
    const optionsContainer = card.querySelector(`#${optionsId}`) as HTMLElement;
    const hiddenInput = card.querySelector(`#${hiddenInputId}`) as HTMLInputElement;
    const displayText = card.querySelector(`#${displayTextId}`) as HTMLElement;

    if (!containerEl || !toggleEl || !menuEl || !searchEl || !optionsContainer || !hiddenInput || !displayText) {
      return {
        setValue: () => {},
        getValue: () => ""
      };
    }

    toggleEl.addEventListener('click', (e) => {
      e.stopPropagation();
      card.querySelectorAll('.custom-dropdown-menu').forEach(m => {
        if (m !== menuEl) m.classList.add('d-none');
      });
      menuEl.classList.toggle('d-none');
      if (!menuEl.classList.contains('d-none')) {
        searchEl.value = '';
        renderOptions('');
        searchEl.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (!containerEl.contains(e.target as Node)) {
        menuEl.classList.add('d-none');
      }
    });

    searchEl.addEventListener('input', () => {
      renderOptions(searchEl.value.toLowerCase());
    });

    const renderOptions = (filterText: string) => {
      optionsContainer.innerHTML = '';
      
      const filtered = locations.filter(loc => {
        const name = (loc.name || `${loc.city} Station`).toLowerCase();
        const address = `${loc.street} ${loc.city}`.toLowerCase();
        return name.includes(filterText) || address.includes(filterText);
      });

      if (filtered.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'text-muted text-center py-2';
        noResults.style.fontSize = '13px';
        noResults.textContent = 'Keine Stationen gefunden';
        optionsContainer.appendChild(noResults);
        return;
      }

      filtered.forEach(loc => {
        const item = (
          <div className="custom-dropdown-item p-2 rounded-2 d-flex align-items-start gap-2 mb-1" style={{ cursor: "pointer", transition: "background-color 0.2s ease" }} data-value={loc.id}>
            <i className="bi bi-geo-alt-fill text-custom-light-blue mt-1" style={{ fontSize: "14px" }}></i>
            <div style={{ lineHeight: "1.2" }}>
              <div className="fw-bold text-dark" style={{ fontSize: "13px" }}>{loc.name || `${loc.city} Station`}</div>
              <div className="text-muted" style={{ fontSize: "11px" }}>{loc.street} {loc.housenumber || ''}, {loc.plz || ''} {loc.city}</div>
            </div>
          </div>
        ) as HTMLElement;

        item.addEventListener('mouseenter', () => {
          item.style.backgroundColor = '#f1f3f5';
        });
        item.addEventListener('mouseleave', () => {
          item.style.backgroundColor = 'transparent';
        });

        item.addEventListener('click', () => {
          hiddenInput.value = loc.id;
          displayText.textContent = loc.name || `${loc.city} Station`;
          displayText.classList.remove('text-muted');
          menuEl.classList.add('d-none');
          onValueChange(loc.id);
        });

        optionsContainer.appendChild(item);
      });
    };

    const setValue = (val: string) => {
      hiddenInput.value = val;
      const loc = locations.find(l => l.id === val);
      if (loc) {
        displayText.textContent = loc.name || `${loc.city} Station`;
        displayText.classList.remove('text-muted');
      } else {
        displayText.textContent = "Bitte wählen...";
        displayText.classList.add('text-muted');
      }
    };

    renderOptions('');

    return {
      setValue,
      getValue: () => hiddenInput.value
    };
  };

  interface DropdownController {
    setValue: (val: string) => void;
    getValue: () => string;
  }

  const dropdowns: {
    pickup: DropdownController | null;
    return: DropdownController | null;
  } = {
    pickup: null,
    return: null
  };

  dropdowns.pickup = setupCustomDropdown(
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

  if (savedSessionData) {
    if (savedSessionData.pickupLocationId && dropdowns.pickup) {
      dropdowns.pickup.setValue(savedSessionData.pickupLocationId);
    }
    if (savedSessionData.returnLocationId && dropdowns.return) {
      dropdowns.return.setValue(savedSessionData.returnLocationId);
    }
    if (savedSessionData.selectedAddons) {
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
  }

  let blockedRanges: { from: string; to: string }[] = [];

  if (wrapper) {
    const fp = flatpickr(wrapper, {
      mode: "range",
      minDate: "today",
      showMonths: window.innerWidth > 768 ? 2 : 1,
      locale: German,
      dateFormat: "d.m.Y",
      defaultDate: (apiStartDate && apiEndDate) ? [apiStartDate, apiEndDate] : undefined,
      onChange: function(selectedDates, _dateStr, instance) {
        if (selectedDates.length > 0) {
          startDateStr = instance.formatDate(selectedDates[0], "d.m.Y") as string;
          apiStartDate = instance.formatDate(selectedDates[0], "Y-m-d") as string;
          checkinDisplay.textContent = startDateStr;
        } else {
          startDateStr = "";
          apiStartDate = "";
          checkinDisplay.textContent = "Datum auswählen";
        }
        
        if (selectedDates.length > 1) {
          endDateStr = instance.formatDate(selectedDates[1], "d.m.Y") as string;
          apiEndDate = instance.formatDate(selectedDates[1], "Y-m-d") as string;
          checkoutDisplay.textContent = endDateStr;

          // Check if selected range overlaps with blocked ranges (flatpickr allows spanning blocked dates by default)
          const start = selectedDates[0];
          const end = selectedDates[1];
          let hasOverlap = false;

          for (const range of blockedRanges) {
            const blockedStart = new Date(range.from);
            const blockedEnd = new Date(range.to);

            // Set times to midnight to ensure accurate day comparison
            const s = new Date(start);
            const e = new Date(end);
            s.setHours(0, 0, 0, 0);
            e.setHours(0, 0, 0, 0);
            blockedStart.setHours(0, 0, 0, 0);
            blockedEnd.setHours(0, 0, 0, 0);

            if (s <= blockedEnd && e >= blockedStart) {
              hasOverlap = true;
              break;
            }
          }

          if (hasOverlap) {
            alert("Der gewählte Zeitraum überschneidet sich mit bereits gebuchten Tagen oder der logistischen Pufferzeit. Bitte wähle einen anderen Zeitraum.");
            instance.clear(false);
            startDateStr = "";
            apiStartDate = "";
            endDateStr = "";
            apiEndDate = "";
            checkinDisplay.textContent = "Datum auswählen";
            checkoutDisplay.textContent = "Datum auswählen";
            saveStateToSession();
            triggerCalculation();
            return;
          }
        } else {
          endDateStr = "";
          apiEndDate = "";
          checkoutDisplay.textContent = "Datum auswählen";
        }
        
        saveStateToSession();
        triggerCalculation();
      }
    });

    import('../../api/bookingsAPI.ts').then(({ getBlockedDates }) => {
      getBlockedDates(camper.id).then(response => {
        blockedRanges = response.blockedRanges || [];
        if (blockedRanges.length > 0) {
          fp.set('disable', blockedRanges);

          // Check if pre-selected session dates overlap with newly loaded blocked ranges
          if (apiStartDate && apiEndDate) {
            const start = new Date(apiStartDate);
            const end = new Date(apiEndDate);
            let hasOverlap = false;

            for (const range of blockedRanges) {
              const blockedStart = new Date(range.from);
              const blockedEnd = new Date(range.to);

              start.setHours(0, 0, 0, 0);
              end.setHours(0, 0, 0, 0);
              blockedStart.setHours(0, 0, 0, 0);
              blockedEnd.setHours(0, 0, 0, 0);

              if (start <= blockedEnd && end >= blockedStart) {
                hasOverlap = true;
                break;
              }
            }

            if (hasOverlap) {
              fp.clear(false);
              startDateStr = "";
              apiStartDate = "";
              endDateStr = "";
              apiEndDate = "";
              checkinDisplay.textContent = "Datum auswählen";
              checkoutDisplay.textContent = "Datum auswählen";
              clearStateFromSession();
              triggerCalculation();
            }
          }
        }
      }).catch(console.error);
    });
  }

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

  if (savedSessionData) {
    triggerCalculation();
  }

  setTimeout(updateStickyPosition, 100);
  window.addEventListener('resize', updateStickyPosition);

  return card;
}
