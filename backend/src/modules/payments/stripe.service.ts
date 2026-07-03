import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    // In a real application, use ConfigService to get this value safely
    const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_PLACEHOLDER';
    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2026-06-24.dahlia',
    });
  }

  async createCheckoutSession(
    camperId: string,
    amountInCents: number,
    bookingDetails: Record<string, unknown>,
  ): Promise<{ url: string }> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `Wohnmobil Buchung (Camper: ${camperId})`,
                description: `Zeitraum: ${String((bookingDetails.startDate as string) || '')} bis ${String((bookingDetails.endDate as string) || '')}`,
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `http://localhost:5173/pages/checkout-success/?session_id={CHECKOUT_SESSION_ID}&bookingId=${String((bookingDetails.bookingId as string) || '')}&camper=${camperId}`,
        cancel_url: `http://localhost:5173/pages/checkout/`,
        metadata: {
          camperId: camperId,
          bookingId: String((bookingDetails.bookingId as string) || ''),
          startDate: String((bookingDetails.startDate as string) || ''),
          endDate: String((bookingDetails.endDate as string) || ''),
        },
      });

      if (!session.url) {
        throw new Error('Failed to create Stripe Checkout URL');
      }

      return { url: session.url };
    } catch (error) {
      console.error('Error creating Stripe session:', error);
      throw new InternalServerErrorException('Payment processing failed');
    }
  }
}
