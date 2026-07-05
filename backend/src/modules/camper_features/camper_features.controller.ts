import { Controller, Get, Param } from '@nestjs/common';
import { CamperFeaturesService } from './camper_features.service';

/**
 * HTTP controller for camper feature data. All routes here are mounted under
 * the `/camper-features` prefix. It is a thin layer that simply forwards
 * requests to {@link CamperFeaturesService}.
 */
@Controller('camper-features')
export class CamperFeaturesController {
  // NestJS injects the service automatically based on the constructor type.
  // `private readonly` both declares and assigns the field (a TypeScript
  // shorthand that has no direct Java equivalent).
  constructor(private readonly camperFeaturesService: CamperFeaturesService) {}

  /**
   * Returns all features belonging to a single camper.
   * Handles `GET /camper-features/:camperId`.
   *
   * @param camperId - id of the camper taken from the URL path segment
   * @returns the camper's feature records
   */
  @Get(':camperId')
  async getByCamperId(@Param('camperId') camperId: string) {
    return await this.camperFeaturesService.findByCamperId(camperId);
  }
}
