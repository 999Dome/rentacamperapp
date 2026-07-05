import { Module } from '@nestjs/common';
import { CampersController } from './campers.controller';
import { CampersService } from './camper.service';
import { CamperPricingCalculator } from '../../domain/services/camper-pricing.calculator';
import { CampersConfigService } from '../../domain/services/campers-config.service';
import { CampersRepository } from '../../infrastructure/repositories/camper.repository';
import { SupabaseModule } from '../../supabase/supabase.module';
import { AddonsModule } from '../addons/addons.module';
import { PricingRulesModule } from '../pricing_rules/pricing_rules.module';
import { DriversLicenseModule } from '../drivers_license/drivers_license.module';

/**
 * Wires up the campers feature: browsing/CRUD of campers plus price
 * calculation.
 *
 * Pulls in the add-on and pricing-rule modules (inputs to price calculation)
 * and registers the pure {@link CamperPricingCalculator} and the static
 * {@link CampersConfigService}. Exports {@link CampersRepository} so other
 * features (e.g. bookings) can look campers up directly.
 */
@Module({
  imports: [SupabaseModule, AddonsModule, PricingRulesModule, DriversLicenseModule],
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
