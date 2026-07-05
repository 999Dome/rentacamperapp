import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';

/**
 * Thin wrapper around the Stripe SDK for creating hosted Checkout sessions.
 *
 * The customer is redirected to Stripe's own payment page; on success/cancel
 * Stripe redirects back to the frontend URLs configured below.
 */
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

  /**
   * Creates a Stripe Checkout session for a single camper booking.
   *
   * The `bookingId` is threaded through both the success URL and the session
   * `metadata` so the payment can be reconciled with the booking after the
   * redirect / via webhooks.
   *
   * @param camperId       Id of the camper being paid for.
   * @param amountInCents  Charge amount in cents (Stripe's expected unit).
   * @param bookingDetails Metadata (bookingId, start/end dates) for the session.
   * @returns The hosted Checkout `{ url }` to redirect the buyer to.
   * @throws InternalServerErrorException If Stripe rejects the request or
   *         returns no URL.
   */
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
