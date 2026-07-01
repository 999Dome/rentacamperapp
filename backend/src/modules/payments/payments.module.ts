import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { StripeService } from './stripe.service';
import { PayPalService } from './paypal.service';

@Module({
  controllers: [PaymentsController],
  providers: [StripeService, PayPalService],
  exports: [StripeService, PayPalService],
})
export class PaymentsModule {}
