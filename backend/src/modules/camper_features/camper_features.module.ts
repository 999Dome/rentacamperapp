import { Module } from '@nestjs/common';
import { CamperFeaturesController } from './camper_features.controller';
import { CamperFeaturesService } from './camper_features.service';
import { SupabaseModule } from '../../supabase/supabase.module';
import {
  CamperFeatureRepository,
  CAMPER_FEATURE_REPOSITORY_TOKEN,
} from '../../infrastructure/repositories/camper-feature.repository';

@Module({
  imports: [SupabaseModule],
  controllers: [CamperFeaturesController],
  providers: [
    CamperFeaturesService,
    {
      provide: CAMPER_FEATURE_REPOSITORY_TOKEN,
      useClass: CamperFeatureRepository,
    },
  ],
  exports: [CamperFeaturesService, CAMPER_FEATURE_REPOSITORY_TOKEN],
})
export class CamperFeaturesModule {}
