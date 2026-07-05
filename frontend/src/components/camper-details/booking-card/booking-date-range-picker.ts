import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { German } from 'flatpickr/dist/l10n/de.js';

/** The four date-string representations tracked for a booking's selected range. */
export interface BookingDates {
  /** Human-readable check-in date, e.g. `"04.07.2026"`. */
  startDateStr: string;
  /** Human-readable check-out date, e.g. `"10.07.2026"`. */
  endDateStr: string;
  /** Check-in date in `YYYY-MM-DD` form, as expected by the API. */
  apiStartDate: string;
  /** Check-out date in `YYYY-MM-DD` form, as expected by the API. */
  apiEndDate: string;
}

/** Options for {@link setupBookingDateRangePicker}. */
export interface BookingDateRangePickerOptions {
  /** The element flatpickr attaches its range calendar to (the `.date-picker-wrapper` row). */
  wrapper: HTMLElement;
  /** The `#checkin-display` text element, updated as the user picks dates. */
  checkinDisplay: HTMLElement;
  /** The `#checkout-display` text element, updated as the user picks dates. */
  checkoutDisplay: HTMLElement;
  /** Id of the camper being booked, used to fetch its already-blocked date ranges. */
  camperId: string;
  /** Check-in date (API format) restored from a previous session, if any, pre-filled into the calendar. */
  initialApiStartDate: string;
  /** Check-out date (API format) restored from a previous session, if any, pre-filled into the calendar. */
  initialApiEndDate: string;
  /**
   * Called whenever the user changes the selected range, including when a
   * selection gets reset because it overlaps an already-blocked range. The
   * caller is expected to update its own copy of the dates, persist them to
   * session storage, and re-trigger the price calculation.
   */
  onDatesChanged: (dates: BookingDates) => void;
  /**
   * Called if dates restored from a previous session turn out to overlap a
   * blocked range once the blocked ranges finish loading from the API. The
   * caller is expected to clear (not just re-save) the session data and
   * re-trigger the price calculation.
   */
  onPreloadedDatesBlocked: (dates: BookingDates) => void;
}

/**
 * Parses an API date string (`"YYYY-MM-DD"`) into a Date at LOCAL midnight.
 *
 * We deliberately build the date from its parts instead of `new Date(str)`,
 * because `new Date("2026-07-15")` is interpreted as UTC midnight and can shift
 * to the previous day in negative-offset timezones. flatpickr renders the
 * calendar in local time, so blocked days must be built in local time too —
 * otherwise the greyed-out days could be off by one.
 *
 * @param dateStr Date in `YYYY-MM-DD` form.
 * @returns A Date at 00:00 local time on that day.
 */
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Checks whether the `[start, end]` range overlaps any of the given blocked
 * date ranges, comparing at day granularity (time-of-day is ignored).
 */
function overlapsBlockedRange(start: Date, end: Date, blockedRanges: { from: string; to: string }[]): boolean {
  const s = new Date(start);
  const e = new Date(end);
  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);

  return blockedRanges.some(range => {
    const blockedStart = parseLocalDate(range.from);
    const blockedEnd = parseLocalDate(range.to);
    return s <= blockedEnd && e >= blockedStart;
  });
}

/**
 * Wires up the flatpickr date-range calendar used by the booking card:
 * - initializes flatpickr in range mode, restoring any previously selected dates
 * - on every change, updates the check-in/check-out display text and checks
 *   the new range against already-blocked date ranges, rejecting it (with an
 *   alert and clearing the selection) if it overlaps
 * - asynchronously loads the camper's blocked date ranges, disables them in
 *   the calendar, and additionally clears a restored selection if it turns
 *   out to conflict with a blocked range that wasn't known yet when the page
 *   first loaded
 *
 * Does nothing if `wrapper` is falsy (mirrors the original inline `if (wrapper)` guard).
 *
 * @param options See {@link BookingDateRangePickerOptions}.
 */
export function setupBookingDateRangePicker(options: BookingDateRangePickerOptions): void {
  const { wrapper, checkinDisplay, checkoutDisplay, camperId, onDatesChanged, onPreloadedDatesBlocked } = options;

  if (!wrapper) return;

  let apiStartDate = options.initialApiStartDate;
  let apiEndDate = options.initialApiEndDate;
  let startDateStr = "";
  let endDateStr = "";
  let blockedRanges: { from: string; to: string }[] = [];

  const fp = flatpickr(wrapper, {
    mode: "range",
    minDate: "today",
    showMonths: window.innerWidth > 768 ? 2 : 1,
    locale: German,
    dateFormat: "d.m.Y",
    defaultDate: (apiStartDate && apiEndDate) ? [apiStartDate, apiEndDate] : undefined,
    // Give every disabled (blocked) day a clear tooltip and a custom class so
    // users immediately understand why it cannot be picked. Runs again on each
    // redraw, including after the blocked ranges are loaded and set below.
    onDayCreate: function(_dObj, _dStr, _instance, dayElem) {
      // flatpickr types this callback's day element as `any`; narrow it to a
      // real HTMLElement so the DOM access below is type-safe.
      const el = dayElem as HTMLElement;
      if (el.classList.contains('flatpickr-disabled')) {
        el.title = 'Nicht verfügbar (bereits gebucht oder Pufferzeit)';
        el.classList.add('booking-day-blocked');
      }
    },
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
        if (overlapsBlockedRange(selectedDates[0], selectedDates[1], blockedRanges)) {
          alert("Der gewählte Zeitraum überschneidet sich mit bereits gebuchten Tagen oder der logistischen Pufferzeit. Bitte wähle einen anderen Zeitraum.");
          instance.clear(false);
          startDateStr = "";
          apiStartDate = "";
          endDateStr = "";
          apiEndDate = "";
          checkinDisplay.textContent = "Datum auswählen";
          checkoutDisplay.textContent = "Datum auswählen";
          onDatesChanged({ startDateStr, endDateStr, apiStartDate, apiEndDate });
          return;
        }
      } else {
        endDateStr = "";
        apiEndDate = "";
        checkoutDisplay.textContent = "Datum auswählen";
      }

      onDatesChanged({ startDateStr, endDateStr, apiStartDate, apiEndDate });
    }
  });

  import('../../../api/bookingsAPI.ts').then(({ getBlockedDates }) => {
    getBlockedDates(camperId).then(response => {
      blockedRanges = response.blockedRanges || [];
      if (blockedRanges.length > 0) {
        // Pass real Date objects (not the raw "YYYY-MM-DD" strings) to
        // flatpickr. flatpickr parses disable strings with the configured
        // `dateFormat` ("d.m.Y"), which silently misreads ISO strings — so the
        // days were never actually greyed out. Date objects bypass that parsing.
        const disableRanges = blockedRanges.map(range => ({
          from: parseLocalDate(range.from),
          to: parseLocalDate(range.to),
        }));
        fp.set('disable', disableRanges);

        // Check if pre-selected session dates overlap with newly loaded blocked ranges
        if (apiStartDate && apiEndDate) {
          const start = new Date(apiStartDate);
          const end = new Date(apiEndDate);

          if (overlapsBlockedRange(start, end, blockedRanges)) {
            fp.clear(false);
            startDateStr = "";
            apiStartDate = "";
            endDateStr = "";
            apiEndDate = "";
            checkinDisplay.textContent = "Datum auswählen";
            checkoutDisplay.textContent = "Datum auswählen";
            onPreloadedDatesBlocked({ startDateStr, endDateStr, apiStartDate, apiEndDate });
          }
        }
      }
    }).catch(console.error);
  });
}
