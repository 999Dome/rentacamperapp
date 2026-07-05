import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { SupabaseModule } from '../../supabase/supabase.module';
import {
  ProfileRepository,
  PROFILE_REPOSITORY_TOKEN,
} from '../../infrastructure/repositories/profile.repository';
import { DriversLicenseModule } from '../drivers_license/drivers_license.module';

/**
 * Wires up the profiles feature.
 *
 * Binds {@link PROFILE_REPOSITORY_TOKEN} to the concrete `ProfileRepository`,
 * and exports both the service and that token so other modules (e.g. bookings)
 * can inject the profile repository through the same interface seam.
 */
@Module({
  imports: [SupabaseModule, DriversLicenseModule],
  controllers: [ProfilesController],
  providers: [
    ProfilesService,
    // Interface-to-implementation binding for dependency inversion.
    {
      provide: PROFILE_REPOSITORY_TOKEN,
      useClass: ProfileRepository,
    },
  ],
  exports: [ProfilesService, PROFILE_REPOSITORY_TOKEN],
})
export class ProfilesModule {}
