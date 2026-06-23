import { Module } from '@nestjs/common';
import { CamperImagesController } from './camper_images.controller';
import { CamperImagesService } from './camper_images.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [CamperImagesController],
  providers: [CamperImagesService],
})
export class CamperImagesModule {}
