import { Module } from '@nestjs/common';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import { LocationRepository } from '../../infrastructure/repositories/location.repository';
import { SupabaseModule } from '../../supabase/supabase.module';

/**
 * Wires up the locations feature: imports {@link SupabaseModule} for DB access,
 * registers the controller, service and {@link LocationRepository}, and exports
 * the service and repository so other modules can reuse them.
 */
@Module({
  imports: [SupabaseModule],
  controllers: [LocationsController],
  providers: [LocationsService, LocationRepository],
  exports: [LocationsService, LocationRepository],
})
export class LocationsModule {}
