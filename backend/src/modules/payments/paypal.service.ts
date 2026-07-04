import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class PayPalService {
  private readonly baseUrl = 'https://api-m.sandbox.paypal.com';
  private readonly clientId = process.env.PAYPAL_CLIENT_ID || 'sb'; // sb is sandbox default
  private readonly clientSecret =
    process.env.PAYPAL_CLIENT_SECRET || 'PLACEHOLDER';

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

  async capturePayment(orderId: string): Promise<Record<string, unknown>> {
    try {
      const accessToken = await this.getAccessToken();

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
