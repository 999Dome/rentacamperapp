import { createElement } from "../../utils/createElement.ts";
import { fetchCurrentUser } from "../../auth/auth.ts";
import { fetchBookingsByRenter, cancelBooking } from "../../api/bookingsAPI.ts";
import type { BookingResponse } from "../../api/bookingsAPI.ts";
import { BookingCardSkeleton } from "./bookings-table/BookingCardSkeleton.tsx";
import { CancelBookingModal } from "./bookings-table/CancelBookingModal.tsx";
import { BookingListItem } from "./bookings-table/BookingListItem.tsx";

/**
 * Renders the "Meine Buchungen" (my bookings) tab on the account page.
 *
 * It shows a title and a `#bookings-list` container, pre-filled with three
 * {@link BookingCardSkeleton} placeholders until the user's real bookings
 * are loaded. Once loaded, each booking is rendered as a {@link BookingListItem}
 * card. A hidden {@link CancelBookingModal} is appended for confirming
 * booking cancellations; its open/close/confirm behavior is implemented
 * here and passed into the modal as callback props.
 *
 * @returns The tab's root element.
 */
export function BookingsTable() {
  const container = (
    <div className="p-0">
      <h3 className="fw-bold mb-4 text-white custom-font-burbank letter-spacing-1px">Meine Buchungen</h3>
      <div id="bookings-list" className="d-flex flex-column gap-3">
        {Array.from({ length: 3 }, () => BookingCardSkeleton())}
      </div>
    </div>
  ) as HTMLElement;

  let bookingToCancel: BookingResponse | null = null;

  const cancelModalEl = (
    <CancelBookingModal onClose={() => closeCancelModal()} onConfirm={(e: Event) => handleCancelConfirm(e)} />
  ) as HTMLElement;

  container.appendChild(cancelModalEl);

  const showCancelModal = (e: Event, booking: BookingResponse) => {
    e.preventDefault();
    bookingToCancel = booking;
    cancelModalEl.classList.add('show', 'd-block');
    const errorEl = cancelModalEl.querySelector('#cancel-error') as HTMLElement;
    errorEl.classList.add('d-none');
    errorEl.textContent = '';
  };

  const closeCancelModal = () => {
    bookingToCancel = null;
    cancelModalEl.classList.remove('show', 'd-block');
    const btnConfirm = cancelModalEl.querySelector('#btn-confirm-cancel') as HTMLButtonElement;
    btnConfirm.disabled = false;
    btnConfirm.innerHTML = 'Stornieren';
  };

  const handleCancelConfirm = async (e: Event) => {
    e.preventDefault();
    if (!bookingToCancel) return;

    const btn = e.target as HTMLButtonElement;
    const originalText = btn.innerHTML;
    const errorEl = cancelModalEl.querySelector('#cancel-error') as HTMLElement;

    try {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Bitte warten...';
      errorEl.classList.add('d-none');

      const user = await fetchCurrentUser();
      if (!user || !user.id) throw new Error("Not logged in");

      await cancelBooking(bookingToCancel.id, user.id as string);

      closeCancelModal();
      await loadBookings(); // Reload to update status
    } catch (err) {
      console.error("Cancel failed", err);
      errorEl.textContent = err instanceof Error ? err.message : "Stornierung fehlgeschlagen.";
      errorEl.classList.remove('d-none');
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  };

  const renderTable = (bookings: BookingResponse[]) => {
    const listContainer = container.querySelector("#bookings-list") as HTMLElement;
    listContainer.innerHTML = "";

    if (bookings.length === 0) {
      listContainer.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <i class="bi bi-calendar-x fs-1 text-muted mb-3 d-block"></i>
          <span class="text-muted fs-5">Du hast noch keine Buchungen vorgenommen.</span>
        </div>
      `;
      return;
    }

    bookings.forEach((booking) => {
      const cardEl = (
        <BookingListItem booking={booking} onToggleDetails={toggleDetails} onCancelClick={showCancelModal} />
      ) as HTMLElement;

      listContainer.appendChild(cardEl);
    });
  };

  const toggleDetails = (e: Event, booking: BookingResponse) => {
    const btn = e.currentTarget as HTMLButtonElement;
    const detailRow = container.querySelector(`#details-${booking.id}`) as HTMLElement;
    const chevron = btn.querySelector("i") as HTMLElement;

    if (detailRow.classList.contains("d-none")) {
      detailRow.classList.remove("d-none");
      if (chevron) {
        chevron.classList.remove("bi-chevron-down");
        chevron.classList.add("bi-chevron-up");
      }
    } else {
      detailRow.classList.add("d-none");
      if (chevron) {
        chevron.classList.remove("bi-chevron-up");
        chevron.classList.add("bi-chevron-down");
      }
    }
  };

  const loadBookings = async () => {
    try {
      const user = await fetchCurrentUser();
      if (!user) return;
      const bookings = await fetchBookingsByRenter(user.id as string);
      renderTable(bookings);
    } catch (err) {
      console.error(err);
      const listContainer = container.querySelector("#bookings-list") as HTMLElement;
      listContainer.innerHTML = `
        <div class="alert alert-danger rounded-4 p-4 text-center">
          <i class="bi bi-exclamation-octagon fs-2 d-block mb-2"></i>
          Fehler beim Laden der Buchungen.
        </div>
      `;
    }
  };

  loadBookings();

  return container;
}
