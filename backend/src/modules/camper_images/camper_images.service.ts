import { Injectable, Inject } from '@nestjs/common';
import type { ICamperImageRepository } from '../../infrastructure/repositories/camper-image.repository';
import { CAMPER_IMAGE_REPOSITORY_TOKEN } from '../../infrastructure/repositories/camper-image.repository';
import { CampersConfigService } from '../../domain/services/campers-config.service';

@Injectable()
export class CamperImagesService {
  constructor(
    @Inject(CAMPER_IMAGE_REPOSITORY_TOKEN)
    private readonly camperImageRepository: ICamperImageRepository,
    private readonly campersConfigService: CampersConfigService,
  ) {}

  async findHighlights() {
    const highlightIds = this.campersConfigService.getHighlightCamperIds();
    return await this.camperImageRepository.findHighlights(highlightIds);
  }

  async findPrimaryByCamperId(camperId: string) {
    return await this.camperImageRepository.findPrimaryByCamperId(camperId);
  }

  async findAllByCamperId(camperId: string) {
    return await this.camperImageRepository.findAllByCamperId(camperId);
  }
}
