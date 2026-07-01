import { Module } from '@nestjs/common';
import { PricingRulesController } from './pricing_rules.controller';
import { PricingRulesService } from './pricing_rules.service';
import {
  PricingRuleRepository,
  PRICING_RULE_REPOSITORY_TOKEN,
} from '../../infrastructure/repositories/pricing-rule.repository';
import { SupabaseModule } from '../../supabase/supabase.module';
import { PricingCalculatorService } from '../../domain/services/pricing-calculator.service';

@Module({
  imports: [SupabaseModule],
  controllers: [PricingRulesController],
  providers: [
    PricingRulesService,
    PricingCalculatorService,
    {
      provide: PRICING_RULE_REPOSITORY_TOKEN,
      useClass: PricingRuleRepository,
    },
    PricingRuleRepository,
  ],
  exports: [
    PricingRulesService,
    PricingCalculatorService,
    PRICING_RULE_REPOSITORY_TOKEN,
  ],
})
export class PricingRulesModule {}
