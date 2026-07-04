import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseModule } from '../../supabase/supabase.module';
import { DriversLicenseModule } from '../drivers_license/drivers_license.module';

@Module({
  imports: [SupabaseModule, DriversLicenseModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
