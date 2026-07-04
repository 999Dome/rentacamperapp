import { Module } from '@nestjs/common';
import { CamperOwnerService } from './camper_owner.service';
import { CamperOwnerController } from './camper_owner.controller';
import { CamperOwnerRepository } from '../../infrastructure/repositories/camper_owner.repository';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [CamperOwnerController],
  providers: [CamperOwnerService, CamperOwnerRepository],
  exports: [CamperOwnerService, CamperOwnerRepository],
})
export class CamperOwnerModule {}
