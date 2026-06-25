import { Controller, Get, Param } from '@nestjs/common';
import { CamperFeaturesService } from './camper_features.service';

@Controller('camper-features')
export class CamperFeaturesController {
  constructor(private readonly camperFeaturesService: CamperFeaturesService) {}

  @Get(':camperId')
  async getByCamperId(@Param('camperId') camperId: string) {
    return await this.camperFeaturesService.findByCamperId(camperId);
  }
}
