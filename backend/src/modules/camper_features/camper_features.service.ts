import { Injectable, Inject } from '@nestjs/common';
import type { ICamperFeatureRepository } from '../../infrastructure/repositories/camper-feature.repository';
import { CAMPER_FEATURE_REPOSITORY_TOKEN } from '../../infrastructure/repositories/camper-feature.repository';

/**
 * Business-logic service for camper features. It delegates persistence to an
 * {@link ICamperFeatureRepository}, staying decoupled from the concrete
 * database implementation.
 */
@Injectable()
export class CamperFeaturesService {
  constructor(
    // The repository is injected by its DI token rather than its class, so the
    // service depends only on the interface. `@Inject(...)` is required here
    // because an interface has no runtime value NestJS could resolve on its own.
    @Inject(CAMPER_FEATURE_REPOSITORY_TOKEN)
    private readonly camperFeatureRepository: ICamperFeatureRepository,
  ) {}

  /**
   * Fetches all features associated with the given camper.
   *
   * @param camperId - id of the camper to load features for
   * @returns the matching feature records
   */
  async findByCamperId(camperId: string) {
    return await this.camperFeatureRepository.findByCamperId(camperId);
  }
}
