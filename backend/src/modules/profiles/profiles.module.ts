import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { SupabaseModule } from '../../supabase/supabase.module';
import {
  ProfileRepository,
  PROFILE_REPOSITORY_TOKEN,
} from '../../infrastructure/repositories/profile.repository';
import { DriversLicenseModule } from '../drivers_license/drivers_license.module';

@Module({
  imports: [SupabaseModule, DriversLicenseModule],
  controllers: [ProfilesController],
  providers: [
    ProfilesService,
    {
      provide: PROFILE_REPOSITORY_TOKEN,
      useClass: ProfileRepository,
    },
  ],
  exports: [ProfilesService, PROFILE_REPOSITORY_TOKEN],
})
export class ProfilesModule {}
