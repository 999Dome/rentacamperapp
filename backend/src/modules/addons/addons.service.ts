import { Injectable, Inject } from '@nestjs/common';
import type { IAddonRepository } from '../../infrastructure/repositories/addon.repository';
import { ADDON_REPOSITORY_TOKEN } from '../../infrastructure/repositories/addon.repository';

/**
 * Business-logic service for the add-on catalog. It reads add-ons through the
 * {@link IAddonRepository} abstraction, which is injected via the
 * {@link ADDON_REPOSITORY_TOKEN} DI token so the concrete data source can be
 * swapped without changing this class (dependency inversion).
 */
@Injectable()
export class AddonsService {
  constructor(
    // Injected by token rather than by class, because the dependency is an
    // interface (`IAddonRepository`) — TypeScript interfaces do not exist at
    // runtime, so Nest needs an explicit token to resolve the provider.
    @Inject(ADDON_REPOSITORY_TOKEN)
    private readonly addonRepository: IAddonRepository,
  ) {}

  /**
   * Retrieves all add-ons from the underlying repository.
   *
   * @returns A promise resolving to the complete list of add-on records.
   */
  async findAll() {
    return await this.addonRepository.findAll();
  }
}
