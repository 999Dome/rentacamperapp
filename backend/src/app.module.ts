import { Module } from '@nestjs/common';
import { CamperOwnerModule } from './modules/camper_owner/camper_owner.module';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { CampersModule } from './modules/campers/camper.module';
import { CamperImagesModule } from './modules/camper_images/camper_images.module';
import { CamperFeaturesModule } from './modules/camper_features/camper_features.module';
import { AddonsModule } from './modules/addons/addons.module';
import { PricingRulesModule } from './modules/pricing_rules/pricing_rules.module';
import { DriversLicenseModule } from './modules/drivers_license/drivers_license.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { BookingAddonsModule } from './modules/booking_addons/booking_addons.module';
import { PaymentsModule } from './modules/payments/payments.module';

import { LocationsModule } from './modules/locations/locations.module';
import { CamperBlockingsModule } from './modules/camper_blockings/camper_blockings.module';
import { MailModule } from './modules/mail/mail.module';
import { PdfModule } from './modules/pdf/pdf.module';
import { SupportModule } from './modules/support/support.module';

/**
 * Root application module.
 *
 * Registers global configuration and composes every feature module. The order
 * of the imports below is not significant to NestJS — modules declare their own
 * dependencies — they are simply grouped by concern for readability.
 */
@Module({
  imports: [
    // Load .env once and make configuration available application-wide, so
    // individual modules don't each need to re-import ConfigModule.
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    SupabaseModule,
    AuthModule,
    CampersModule,
    CamperImagesModule,
    CamperFeaturesModule,
    AddonsModule,
    PricingRulesModule,
    DriversLicenseModule,
    ProfilesModule,
    BookingsModule,
    BookingAddonsModule,
    PaymentsModule,
    CamperOwnerModule,
    LocationsModule,
    CamperBlockingsModule,
    MailModule,
    PdfModule,
    SupportModule,
  ],
})
export class AppModule {}
