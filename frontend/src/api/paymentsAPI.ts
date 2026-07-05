/**
 * Thin, function-based wrapper around `PaymentsAPIClient`.
 *
 * The rest of the app calls these plain functions instead of instantiating
 * the client itself, so the payment flow (Stripe checkout, PayPal orders)
 * can be used without knowing about the underlying client class.
 */

import { PaymentsAPIClient, type CapturePayPalOrderResponse } from '../infrastructure/api/payments-api-client';

const client = new PaymentsAPIClient();

/**
 * Creates a Stripe Checkout session for a booking.
 *
 * @param camperId Id of the camper being booked.
 * @param amount Total amount to charge, in the currency expected by the backend.
 * @param startDate Booking start date (ISO string).
 * @param endDate Booking end date (ISO string).
 * @param bookingId Id of the booking this payment belongs to.
 * @returns The URL to redirect the user to for completing checkout.
 */
export async function createStripeCheckoutSession(
  camperId: string,
  amount: number,
  startDate: string,
  endDate: string,
  bookingId: string,
): Promise<{ url: string }> {
  return client.createStripeSession({
    camperId,
    amount,
    bookingDetails: {
      startDate,
      endDate,
      bookingId,
    },
  });
}

/**
 * Creates a PayPal order for a booking.
 *
 * @param camperId Id of the camper being booked.
 * @param amount Total amount to charge, in the currency expected by the backend.
 * @param startDate Booking start date (ISO string).
 * @param endDate Booking end date (ISO string).
 * @returns The created PayPal order's id, used to later capture the payment.
 */
export async function createPayPalOrder(
  camperId: string,
  amount: number,
  startDate: string,
  endDate: string,
): Promise<{ id: string }> {
  return client.createPayPalOrder({
    camperId,
    amount,
    bookingDetails: {
      startDate,
      endDate,
    },
  });
}

/**
 * Captures (finalizes) a previously approved PayPal order, actually charging the buyer.
 *
 * @param orderId Id of the PayPal order to capture.
 * @returns The capture result, including status and order id.
 */
export async function capturePayPalOrder(orderId: string): Promise<CapturePayPalOrderResponse> {
  return client.capturePayPalOrder({ orderId });
}
