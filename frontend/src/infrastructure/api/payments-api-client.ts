import { BaseAPIClient } from './base-api-client';

export interface CreateStripeSessionRequest {
  camperId: string;
  amount: number;
  bookingDetails: {
    startDate: string;
    endDate: string;
  };
}

export interface CreateStripeSessionResponse {
  url: string;
}

export interface CreatePayPalOrderRequest {
  camperId: string;
  amount: number;
  bookingDetails: {
    startDate: string;
    endDate: string;
  };
}

export interface CreatePayPalOrderResponse {
  id: string;
}

export interface CapturePayPalOrderRequest {
  orderId: string;
}

export interface CapturePayPalOrderResponse {
  status: string;
  id: string;
}

export class PaymentsAPIClient extends BaseAPIClient {
  async createStripeSession(
    data: CreateStripeSessionRequest,
  ): Promise<CreateStripeSessionResponse> {
    return this.request<CreateStripeSessionResponse>('/payments/stripe/create-session', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createPayPalOrder(
    data: CreatePayPalOrderRequest,
  ): Promise<CreatePayPalOrderResponse> {
    return this.request<CreatePayPalOrderResponse>('/payments/paypal/create-order', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async capturePayPalOrder(
    data: CapturePayPalOrderRequest,
  ): Promise<CapturePayPalOrderResponse> {
    return this.request<CapturePayPalOrderResponse>('/payments/paypal/capture-order', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}
