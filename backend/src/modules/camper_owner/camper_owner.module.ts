import { Module } from '@nestjs/common';
import { CamperOwnerService } from './camper_owner.service';
import { CamperOwnerController } from './camper_owner.controller';
import { CamperOwnerRepository } from '../../infrastructure/repositories/camper_owner.repository';
import { SupabaseModule } from '../../supabase/supabase.module';

/**
 * Wires together the camper-owner feature slice: the controller, the service,
 * and the repository. It imports {@link SupabaseModule} for database access and
 * exports {@link CamperOwnerService} and {@link CamperOwnerRepository} so other
 * modules can reuse them.
 */
@Module({
  imports: [SupabaseModule],
  controllers: [CamperOwnerController],
  providers: [CamperOwnerService, CamperOwnerRepository],
  exports: [CamperOwnerService, CamperOwnerRepository],
})
export class CamperOwnerModule {}
