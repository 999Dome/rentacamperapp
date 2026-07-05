import { Module } from '@nestjs/common';
import { DriversLicenseController } from './drivers_license.controller';
import { DriversLicenseService } from './drivers_license.service';
import { SupabaseModule } from '../../supabase/supabase.module';
import {
  DriversLicenseRepository,
  DRIVERS_LICENSE_REPOSITORY_TOKEN,
} from '../../infrastructure/repositories/drivers-license.repository';

/**
 * Wires up the driver's license feature.
 *
 * Imports {@link SupabaseModule} for database access, registers the controller
 * and service, and binds the {@link DRIVERS_LICENSE_REPOSITORY_TOKEN} DI token to
 * the concrete {@link DriversLicenseRepository}. Both the service and the token
 * are exported so other modules (notably the booking flow) can reuse the
 * eligibility logic. In NestJS a `@Module` plays the role of a Spring
 * `@Configuration` that declares which beans exist and which are visible outside.
 */
@Module({
  imports: [SupabaseModule],
  controllers: [DriversLicenseController],
  providers: [
    DriversLicenseService,
    {
      provide: DRIVERS_LICENSE_REPOSITORY_TOKEN,
      useClass: DriversLicenseRepository,
    },
  ],
  exports: [DriversLicenseService, DRIVERS_LICENSE_REPOSITORY_TOKEN],
})
export class DriversLicenseModule {}
