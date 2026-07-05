import { BaseAPIClient } from './base-api-client';

/** Payload to start a Stripe Checkout session for a booking. */
export interface CreateStripeSessionRequest {
  camperId: string;
  amount: number;
  bookingDetails: {
    startDate: string;
    endDate: string;
    bookingId?: string;
  };
}

/** Response from creating a Stripe Checkout session. */
export interface CreateStripeSessionResponse {
  url: string;
}

/** Payload to create a PayPal order for a booking. */
export interface CreatePayPalOrderRequest {
  camperId: string;
  amount: number;
  bookingDetails: {
    startDate: string;
    endDate: string;
  };
}

/** Response from creating a PayPal order. */
export interface CreatePayPalOrderResponse {
  id: string;
}

/** Payload to capture (finalize) a previously created PayPal order. */
export interface CapturePayPalOrderRequest {
  orderId: string;
}

/** Response from capturing a PayPal order. */
export interface CapturePayPalOrderResponse {
  status: string;
  id: string;
}

/**
 * API client for handling payment flows (Stripe Checkout and PayPal)
 * for camper bookings.
 */
export class PaymentsAPIClient extends BaseAPIClient {
  /**
   * Creates a Stripe Checkout session for a booking.
   * @param data - Camper, amount, and booking details to charge for.
   * @returns The Stripe Checkout URL the user should be redirected to.
   */
  async createStripeSession(
    data: CreateStripeSessionRequest,
  ): Promise<CreateStripeSessionResponse> {
    return this.request<CreateStripeSessionResponse>('/payments/stripe/create-session', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Creates a PayPal order for a booking.
   * @param data - Camper, amount, and booking details to charge for.
   * @returns The created PayPal order's ID.
   */
  async createPayPalOrder(
    data: CreatePayPalOrderRequest,
  ): Promise<CreatePayPalOrderResponse> {
    return this.request<CreatePayPalOrderResponse>('/payments/paypal/create-order', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Captures (finalizes) a previously approved PayPal order, completing the payment.
   * @param data - ID of the order to capture.
   * @returns The capture status and order ID.
   */
  async capturePayPalOrder(
    data: CapturePayPalOrderRequest,
  ): Promise<CapturePayPalOrderResponse> {
    return this.request<CapturePayPalOrderResponse>('/payments/paypal/capture-order', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}
