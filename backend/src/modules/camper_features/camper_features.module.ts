import { Module } from '@nestjs/common';
import { CamperFeaturesController } from './camper_features.controller';
import { CamperFeaturesService } from './camper_features.service';
import { SupabaseModule } from '../../supabase/supabase.module';
import {
  CamperFeatureRepository,
  CAMPER_FEATURE_REPOSITORY_TOKEN,
} from '../../infrastructure/repositories/camper-feature.repository';

/**
 * Wires together the camper-features feature slice: the controller, the
 * service, and the repository binding. It imports {@link SupabaseModule} for
 * database access and binds {@link CAMPER_FEATURE_REPOSITORY_TOKEN} to the
 * concrete {@link CamperFeatureRepository}. The service and repository token
 * are exported so other modules can reuse them.
 */
@Module({
  imports: [SupabaseModule],
  controllers: [CamperFeaturesController],
  providers: [
    CamperFeaturesService,
    {
      // Bind the DI token to a concrete implementation. Consumers inject the
      // token (the interface) and stay unaware of this concrete class.
      provide: CAMPER_FEATURE_REPOSITORY_TOKEN,
      useClass: CamperFeatureRepository,
    },
  ],
  exports: [CamperFeaturesService, CAMPER_FEATURE_REPOSITORY_TOKEN],
})
export class CamperFeaturesModule {}
