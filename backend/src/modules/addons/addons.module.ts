import { Module } from '@nestjs/common';
import { AddonsController } from './addons.controller';
import { AddonsService } from './addons.service';
import { SupabaseModule } from '../../supabase/supabase.module';
import {
  AddonRepository,
  ADDON_REPOSITORY_TOKEN,
} from '../../infrastructure/repositories/addon.repository';

@Module({
  imports: [SupabaseModule],
  controllers: [AddonsController],
  providers: [
    AddonsService,
    {
      provide: ADDON_REPOSITORY_TOKEN,
      useClass: AddonRepository,
    },
  ],
  exports: [AddonsService, ADDON_REPOSITORY_TOKEN],
})
export class AddonsModule {}
