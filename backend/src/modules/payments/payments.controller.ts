import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { PayPalService } from './paypal.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly paypalService: PayPalService,
  ) {}

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
    // Stripe expects amount in cents
    const amountInCents = Math.round(body.amount * 100);
    return this.stripeService.createCheckoutSession(
      body.camperId,
      amountInCents,
      body.bookingDetails || {},
    );
  }

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
