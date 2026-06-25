import { Module } from '@nestjs/common';
import { DriversLicenseController } from './drivers_license.controller';
import { DriversLicenseService } from './drivers_license.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [DriversLicenseController],
  providers: [DriversLicenseService],
})
export class DriversLicenseModule {}
