import { Module } from '@nestjs/common';
import { PricingRulesController } from './pricing_rules.controller';
import { PricingRulesService } from './pricing_rules.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [PricingRulesController],
  providers: [PricingRulesService],
})
export class PricingRulesModule {}
