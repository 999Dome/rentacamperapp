import { Module } from '@nestjs/common';
import { CampersController } from './campers.controller';
import { CampersService } from './camper.service';
import { CamperPricingCalculator } from '../../domain/services/camper-pricing.calculator';
import { CampersConfigService } from '../../domain/services/campers-config.service';
import { CampersRepository } from '../../infrastructure/repositories/camper.repository';
import { SupabaseModule } from '../../supabase/supabase.module';
import { AddonsModule } from '../addons/addons.module';
import { PricingRulesModule } from '../pricing_rules/pricing_rules.module';

@Module({
  imports: [SupabaseModule, AddonsModule, PricingRulesModule],
  controllers: [CampersController],
  providers: [
    CampersService,
    CampersRepository,
    CamperPricingCalculator,
    CampersConfigService,
  ],
  exports: [CampersRepository],
})
export class CampersModule {}
