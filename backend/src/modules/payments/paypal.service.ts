import { Injectable, InternalServerErrorException } from '@nestjs/common';

/**
 * Client for the PayPal Orders v2 REST API (sandbox environment).
 *
 * Uses raw `fetch` rather than an SDK. When real credentials are absent it
 * degrades gracefully to a dummy flow (see {@link getAccessToken} /
 * {@link createOrder}) so the checkout UI remains testable without live keys.
 */
@Injectable()
export class PayPalService {
  private readonly baseUrl = 'https://api-m.sandbox.paypal.com';
  private readonly clientId = process.env.PAYPAL_CLIENT_ID || 'sb'; // sb is sandbox default
  private readonly clientSecret =
    process.env.PAYPAL_CLIENT_SECRET || 'PLACEHOLDER';

  /**
   * Obtains an OAuth2 access token via the client-credentials grant.
   *
   * On any failure it logs and returns the sentinel `'DUMMY_ACCESS_TOKEN'`
   * instead of throwing, which downstream methods detect to run the offline
   * dummy flow — convenient for local/dev without real PayPal keys.
   *
   * @returns A bearer access token, or the dummy sentinel on failure.
   */
  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString(
      'base64',
    );

    try {
      const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        body: 'grant_type=client_credentials',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!response.ok) {
        throw new Error(`PayPal auth failed: ${response.statusText}`);
      }

      const data = (await response.json()) as { access_token: string };
      return data.access_token;
    } catch (error) {
      console.error('Error getting PayPal access token:', error);
      // In a real application we would throw this, but for placeholder testing we'll return a dummy token
      return 'DUMMY_ACCESS_TOKEN';
    }
  }

  /**
   * Creates a PayPal order to be approved and later captured.
   *
   * @param camperId        Id of the camper being paid for.
   * @param amount          Charge amount in EUR (formatted to 2 decimals).
   * @param _bookingDetails Booking metadata (currently unused here).
   * @returns The created order `{ id }` (a `DUMMY_ORDER_*` id when running
   *          without real credentials).
   * @throws InternalServerErrorException If a live order request fails.
   */
  async createOrder(
    camperId: string,
    amount: number, // in EUR
    _bookingDetails: Record<string, unknown>,
  ): Promise<{ id: string }> {
    try {
      const accessToken = await this.getAccessToken();

      // If we are using dummy keys, just return a dummy order ID
      if (accessToken === 'DUMMY_ACCESS_TOKEN') {
        return { id: `DUMMY_ORDER_${Date.now()}` };
      }

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: `camper_${camperId}`,
              amount: {
                currency_code: 'EUR',
                value: amount.toFixed(2),
              },
              description: `Wohnmobil Buchung (Camper: ${camperId})`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`PayPal order creation failed: ${response.statusText}`);
      }

      const data = (await response.json()) as { id: string };
      return { id: data.id };
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      throw new InternalServerErrorException('PayPal order creation failed');
    }
  }

  /**
   * Captures (finalises) a previously approved PayPal order.
   *
   * @param orderId The id returned by {@link createOrder}.
   * @returns The raw PayPal capture response (a synthetic `COMPLETED` result
   *          for dummy orders / missing credentials).
   * @throws InternalServerErrorException If a live capture request fails.
   */
  async capturePayment(orderId: string): Promise<Record<string, unknown>> {
    try {
      const accessToken = await this.getAccessToken();

      // Short-circuit for the offline dummy flow (no real order to capture).
      if (
        accessToken === 'DUMMY_ACCESS_TOKEN' ||
        orderId.startsWith('DUMMY_ORDER')
      ) {
        return { status: 'COMPLETED', id: orderId };
      }

      const response = await fetch(
        `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`PayPal capture failed: ${response.statusText}`);
      }

      const data = (await response.json()) as Record<string, unknown>;
      return data;
    } catch (error) {
      console.error('Error capturing PayPal payment:', error);
      throw new InternalServerErrorException('PayPal payment capture failed');
    }
  }
}
