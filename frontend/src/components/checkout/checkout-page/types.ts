/**
 * Shared data shapes used across the checkout page's sub-components.
 * Kept in one place so `CheckoutPage.tsx` and the pieces it composes
 * (`PersonalDataCard`, `OrderSummaryCard`, `paypal-checkout.ts`, etc.) all
 * agree on the same field names without importing from each other.
 */

/** The logged-in user's profile data, as needed by the checkout page. */
export interface UserProfile {
  id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  profile?: {
    firstname?: string;
    lastname?: string;
    first_name?: string;
    last_name?: string;
    drivers_license_class?: string | null;
    driver_license_class?: string | null;
  } | null;
}

/** A single named add-on and its cost, as returned by the price calculation API. */
export interface AddonDetail {
  name: string;
  cost: number;
}

/** Result of calling `calculatePrice` for the pending booking. */
export interface PriceCalculationResult {
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

/**
 * The booking that was reserved (but not yet paid for) before the user was
 * sent to the checkout page. Read from `sessionStorage`'s `pendingCheckout`
 * entry by `CheckoutPage.tsx`.
 */
export interface PendingBookingData {
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
