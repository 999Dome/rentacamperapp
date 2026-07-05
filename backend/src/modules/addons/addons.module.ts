import { Module } from '@nestjs/common';
import { AddonsController } from './addons.controller';
import { AddonsService } from './addons.service';
import { SupabaseModule } from '../../supabase/supabase.module';
import {
  AddonRepository,
  ADDON_REPOSITORY_TOKEN,
} from '../../infrastructure/repositories/addon.repository';

/**
 * Wires together the add-on feature: the {@link AddonsController} (HTTP layer)
 * and {@link AddonsService} (business logic). It binds the
 * {@link ADDON_REPOSITORY_TOKEN} token to the concrete {@link AddonRepository}
 * so consumers can depend on the interface instead of the implementation.
 * Both the service and the repository token are exported so other modules can
 * reuse them.
 */
@Module({
  imports: [SupabaseModule],
  controllers: [AddonsController],
  providers: [
    AddonsService,
    {
      // Bind the DI token to a concrete class: whenever `IAddonRepository` is
      // requested via this token, Nest instantiates an `AddonRepository`.
      provide: ADDON_REPOSITORY_TOKEN,
      useClass: AddonRepository,
    },
  ],
  exports: [AddonsService, ADDON_REPOSITORY_TOKEN],
})
export class AddonsModule {}
