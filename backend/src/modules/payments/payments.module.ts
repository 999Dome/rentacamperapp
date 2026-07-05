import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { StripeService } from './stripe.service';
import { PayPalService } from './paypal.service';

/**
 * Wires up the payments feature (Stripe + PayPal). Both provider services are
 * exported so other modules could initiate payments if needed.
 */
@Module({
  controllers: [PaymentsController],
  providers: [StripeService, PayPalService],
  exports: [StripeService, PayPalService],
})
export class PaymentsModule {}
