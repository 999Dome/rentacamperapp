import { Module } from '@nestjs/common';
import { CamperFeaturesController } from './camper_features.controller';
import { CamperFeaturesService } from './camper_features.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [CamperFeaturesController],
  providers: [CamperFeaturesService],
})
export class CamperFeaturesModule {}
