import { Module } from '@nestjs/common';
import { CamperImagesController } from './camper_images.controller';
import { CamperImagesService } from './camper_images.service';
import { SupabaseModule } from '../../supabase/supabase.module';
import {
  CamperImageRepository,
  CAMPER_IMAGE_REPOSITORY_TOKEN,
} from '../../infrastructure/repositories/camper-image.repository';
import { CampersConfigService } from '../../domain/services/campers-config.service';

@Module({
  imports: [SupabaseModule],
  controllers: [CamperImagesController],
  providers: [
    CamperImagesService,
    CampersConfigService,
    {
      provide: CAMPER_IMAGE_REPOSITORY_TOKEN,
      useClass: CamperImageRepository,
    },
  ],
})
export class CamperImagesModule {}
