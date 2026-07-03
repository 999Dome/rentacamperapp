import { PaymentsAPIClient, type CapturePayPalOrderResponse } from '../infrastructure/api/payments-api-client';

const client = new PaymentsAPIClient();

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

export async function capturePayPalOrder(orderId: string): Promise<CapturePayPalOrderResponse> {
  return client.capturePayPalOrder({ orderId });
}
