import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { PayPalService } from './paypal.service';

/**
 * Payment endpoints, mounted under the `/payments` route prefix.
 *
 * Fronts two providers — Stripe (hosted checkout) and PayPal (order create +
 * capture) — delegating to their respective services.
 */
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly paypalService: PayPalService,
  ) {}

  /**
   * `POST /payments/stripe/create-session` — starts a Stripe Checkout session.
   *
   * @param body Camper id, amount in EUR, and booking metadata for the session.
   * @returns The Stripe Checkout `{ url }` to redirect the buyer to.
   * @throws HttpException 400 If `camperId` or `amount` is missing.
   */
  @Post('stripe/create-session')
  async createStripeSession(
    @Body()
    body: {
      camperId: string;
      amount: number;
      bookingDetails: Record<string, unknown>;
    },
  ) {
    if (!body.camperId || !body.amount) {
      throw new HttpException(
        'Missing camperId or amount',
        HttpStatus.BAD_REQUEST,
      );
    }
    // Stripe expects the amount as an integer number of cents, not euros.
    const amountInCents = Math.round(body.amount * 100);
    return this.stripeService.createCheckoutSession(
      body.camperId,
      amountInCents,
      body.bookingDetails || {},
    );
  }

  /**
   * `POST /payments/paypal/create-order` — creates a PayPal order.
   *
   * @param body Camper id, amount in EUR, and booking metadata.
   * @returns The created order `{ id }`.
   * @throws HttpException 400 If `camperId` or `amount` is missing.
   */
  @Post('paypal/create-order')
  async createPayPalOrder(
    @Body()
    body: {
      camperId: string;
      amount: number;
      bookingDetails: Record<string, unknown>;
    },
  ) {
    if (!body.camperId || !body.amount) {
      throw new HttpException(
        'Missing camperId or amount',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.paypalService.createOrder(
      body.camperId,
      body.amount,
      body.bookingDetails || {},
    );
  }

  /**
   * `POST /payments/paypal/capture-order` — captures (finalises) a PayPal order.
   *
   * @param body The `orderId` returned by order creation.
   * @returns The raw PayPal capture response.
   * @throws HttpException 400 If `orderId` is missing.
   */
  @Post('paypal/capture-order')
  async capturePayPalOrder(
    @Body() body: { orderId: string },
  ): Promise<Record<string, unknown>> {
    if (!body.orderId) {
      throw new HttpException('Missing orderId', HttpStatus.BAD_REQUEST);
    }
    return this.paypalService.capturePayment(body.orderId);
  }
}
