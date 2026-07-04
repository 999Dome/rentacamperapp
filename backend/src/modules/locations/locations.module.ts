import { Module } from '@nestjs/common';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import { LocationRepository } from '../../infrastructure/repositories/location.repository';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [LocationsController],
  providers: [LocationsService, LocationRepository],
  exports: [LocationsService, LocationRepository],
})
export class LocationsModule {}
