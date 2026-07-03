import { Module } from '@nestjs/common';
import { CamperBlockingsController } from './camper_blockings.controller';
import { CamperBlockingsService } from './camper_blockings.service';
import { CamperBlockingRepository } from '../../infrastructure/repositories/camper_blocking.repository';
import { SupabaseModule } from '../../supabase/supabase.module';
import { CamperOwnerModule } from '../camper_owner/camper_owner.module';

@Module({
  imports: [SupabaseModule, CamperOwnerModule],
  controllers: [CamperBlockingsController],
  providers: [CamperBlockingsService, CamperBlockingRepository],
  exports: [CamperBlockingsService, CamperBlockingRepository],
})
export class CamperBlockingsModule {}
