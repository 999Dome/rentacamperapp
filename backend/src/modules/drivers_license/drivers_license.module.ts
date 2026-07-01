import { Module } from '@nestjs/common';
import { DriversLicenseController } from './drivers_license.controller';
import { DriversLicenseService } from './drivers_license.service';
import { SupabaseModule } from '../../supabase/supabase.module';
import {
  DriversLicenseRepository,
  DRIVERS_LICENSE_REPOSITORY_TOKEN,
} from '../../infrastructure/repositories/drivers-license.repository';

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
