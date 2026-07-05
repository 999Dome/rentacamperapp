import { Module } from '@nestjs/common';
import { CamperImagesController } from './camper_images.controller';
import { CamperImagesService } from './camper_images.service';
import { SupabaseModule } from '../../supabase/supabase.module';
import {
  CamperImageRepository,
  CAMPER_IMAGE_REPOSITORY_TOKEN,
} from '../../infrastructure/repositories/camper-image.repository';
import { CampersConfigService } from '../../domain/services/campers-config.service';

/**
 * Wires together the camper-images feature slice: the controller, the service,
 * the {@link CampersConfigService}, and the repository binding. It imports
 * {@link SupabaseModule} for database and object-storage access and binds
 * {@link CAMPER_IMAGE_REPOSITORY_TOKEN} to the concrete
 * {@link CamperImageRepository}. This module exports nothing, so its providers
 * are private to itself.
 */
@Module({
  imports: [SupabaseModule],
  controllers: [CamperImagesController],
  providers: [
    CamperImagesService,
    CampersConfigService,
    {
      // Bind the DI token to a concrete implementation so consumers can inject
      // the token (interface) without knowing this class.
      provide: CAMPER_IMAGE_REPOSITORY_TOKEN,
      useClass: CamperImageRepository,
    },
  ],
})
export class CamperImagesModule {}
