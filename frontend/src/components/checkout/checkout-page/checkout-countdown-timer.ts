import type { PendingBookingData } from "./types.ts";

/**
 * Starts the checkout page's reservation countdown timer.
 *
 * Every second it recomputes the time left until `pendingData.expiresAt` and
 * re-renders `#countdown-timer-container` with the remaining `mm:ss`. Once
 * the deadline passes it stops the timer, shows an "expired" message,
 * disables `#confirm-payment-btn`, hides `#paypal-buttons-container`, clears
 * the pending checkout from `sessionStorage`, and redirects back to the
 * camper's details page after a short delay.
 *
 * Does nothing if `#countdown-timer-container` isn't present in the DOM, or
 * if `pendingData` has no `expiresAt`.
 *
 * @param pendingData The pending booking data, including its `expiresAt` timestamp.
 * @param camperId The camper id to redirect back to once the reservation expires.
 */
export function startCheckoutCountdownTimer(pendingData: PendingBookingData, camperId: string): void {
  const timerContainer = document.getElementById("countdown-timer-container");
  if (!timerContainer || !pendingData.expiresAt) return;

  let timerInterval: number | null = null;

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
        window.location.href = `/pages/camper-details/?id=${camperId}`;
      }, 3000);
      return;
    }

    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const formattedMin = minutes.toString().padStart(2, "0");
    const formattedSec = seconds.toString().padStart(2, "0");

    timerContainer.innerHTML = `
      <div class="alert alert-warning d-inline-block fw-bold shadow-sm countdown-timer-alert">
        ⏳ Deine Reservierung läuft ab in: <span class="text-danger fs-4">${formattedMin}:${formattedSec}</span> Minuten
      </div>
    `;
  };

  updateTimer();
  timerInterval = window.setInterval(updateTimer, 1000);
}
