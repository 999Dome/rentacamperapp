import {
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import 'multer';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CamperImagesService } from './camper_images.service';

@Controller('camper-images')
export class CamperImagesController {
  constructor(private readonly camperImagesService: CamperImagesService) {}

  @Post(':camperId/upload')
  @UseInterceptors(FilesInterceptor('images'))
  async uploadImages(
    @Param('camperId') camperId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.camperImagesService.uploadImages(camperId, files);
  }

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
