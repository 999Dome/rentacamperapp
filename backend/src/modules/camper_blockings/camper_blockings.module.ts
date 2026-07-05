import { Module } from '@nestjs/common';
import { CamperBlockingsController } from './camper_blockings.controller';
import { CamperBlockingsService } from './camper_blockings.service';
import { CamperBlockingRepository } from '../../infrastructure/repositories/camper_blocking.repository';
import { SupabaseModule } from '../../supabase/supabase.module';
import { CamperOwnerModule } from '../camper_owner/camper_owner.module';

/**
 * Wires together the camper-blockings feature: the
 * {@link CamperBlockingsController} (HTTP layer), {@link CamperBlockingsService}
 * (business logic) and {@link CamperBlockingRepository} (data access). Imports
 * {@link CamperOwnerModule} because the service needs the camper-owner
 * repository for its ownership checks. Exports the service and repository for
 * reuse by other modules.
 */
@Module({
  imports: [SupabaseModule, CamperOwnerModule],
  controllers: [CamperBlockingsController],
  providers: [CamperBlockingsService, CamperBlockingRepository],
  exports: [CamperBlockingsService, CamperBlockingRepository],
})
export class CamperBlockingsModule {}
