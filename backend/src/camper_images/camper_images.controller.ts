import { Controller, Get } from '@nestjs/common';
import { CamperImagesService } from './camper_images.service';

@Controller('camper-images')
export class CamperImagesController {
  constructor(private readonly camperImagesService: CamperImagesService) {}

  @Get('highlights')
  async getHighlights() {
    return await this.camperImagesService.findHighlights();
  }
}
