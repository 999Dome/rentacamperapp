import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseModule } from '../../supabase/supabase.module';
import { DriversLicenseModule } from '../drivers_license/drivers_license.module';

/**
 * Wires up authentication. Imports Supabase (auth + profile access) and the
 * driver's-license module (to resolve license classes during registration),
 * and exports {@link AuthService} for reuse elsewhere.
 */
@Module({
  imports: [SupabaseModule, DriversLicenseModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
