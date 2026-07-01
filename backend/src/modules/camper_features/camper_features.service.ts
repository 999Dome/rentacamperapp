import { Injectable, Inject } from '@nestjs/common';
import type { ICamperFeatureRepository } from '../../infrastructure/repositories/camper-feature.repository';
import { CAMPER_FEATURE_REPOSITORY_TOKEN } from '../../infrastructure/repositories/camper-feature.repository';

@Injectable()
export class CamperFeaturesService {
  constructor(
    @Inject(CAMPER_FEATURE_REPOSITORY_TOKEN)
    private readonly camperFeatureRepository: ICamperFeatureRepository,
  ) {}

  async findByCamperId(camperId: string) {
    return await this.camperFeatureRepository.findByCamperId(camperId);
  }
}
