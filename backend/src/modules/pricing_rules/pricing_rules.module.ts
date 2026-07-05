import { Module } from '@nestjs/common';
import { PricingRulesController } from './pricing_rules.controller';
import { PricingRulesService } from './pricing_rules.service';
import {
  PricingRuleRepository,
  PRICING_RULE_REPOSITORY_TOKEN,
} from '../../infrastructure/repositories/pricing-rule.repository';
import { SupabaseModule } from '../../supabase/supabase.module';
import { PricingCalculatorService } from '../../domain/services/pricing-calculator.service';

/**
 * Wires up the pricing feature.
 *
 * Imports {@link SupabaseModule} for DB access and registers the controller plus
 * two collaborators: {@link PricingRulesService} (rule lookups) and
 * {@link PricingCalculatorService} (price computation). The
 * {@link PRICING_RULE_REPOSITORY_TOKEN} token is bound to the concrete
 * {@link PricingRuleRepository}, which is also registered by class so it can be
 * injected either way. Services, the calculator and the token are exported for
 * reuse by other modules (e.g. the booking flow).
 */
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
