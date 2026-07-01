import { Controller, Get, Param } from '@nestjs/common';
import { CamperImagesService } from './camper_images.service';

@Controller('camper-images')
export class CamperImagesController {
  constructor(private readonly camperImagesService: CamperImagesService) {}

  @Get('highlights')
  async getHighlights() {
    return await this.camperImagesService.findHighlights();
  }

  @Get(':camperId/primary')
  async getPrimaryByCamperId(@Param('camperId') camperId: string) {
    return await this.camperImagesService.findPrimaryByCamperId(camperId);
  }

  @Get(':camperId')
  async getAllByCamperId(@Param('camperId') camperId: string) {
    return await this.camperImagesService.findAllByCamperId(camperId);
  }
}
