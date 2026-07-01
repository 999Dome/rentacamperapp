import { Injectable, Inject } from '@nestjs/common';
import type { IAddonRepository } from '../../infrastructure/repositories/addon.repository';
import { ADDON_REPOSITORY_TOKEN } from '../../infrastructure/repositories/addon.repository';

@Injectable()
export class AddonsService {
  constructor(
    @Inject(ADDON_REPOSITORY_TOKEN)
    private readonly addonRepository: IAddonRepository,
  ) {}

  async findAll() {
    return await this.addonRepository.findAll();
  }
}
