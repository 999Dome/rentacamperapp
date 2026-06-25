import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { CampersModule } from './campers/camper.module';
import { CamperImagesModule } from './camper_images/camper_images.module';
import { CamperFeaturesModule } from './camper_features/camper_features.module';
import { AddonsModule } from './addons/addons.module';
import { PricingRulesModule } from './pricing_rules/pricing_rules.module';
import { DriversLicenseModule } from './drivers_license/drivers_license.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    SupabaseModule,
    CampersModule,
    CamperImagesModule,
    CamperFeaturesModule,
    AddonsModule,
    PricingRulesModule,
    DriversLicenseModule,
  ],
})
export class AppModule {}
