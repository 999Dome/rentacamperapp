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

/**
 * HTTP controller for camper images, mounted under the `/camper-images`
 * prefix. It exposes read endpoints for image lookup plus a multipart upload
 * endpoint, delegating all work to {@link CamperImagesService}.
 */
@Controller('camper-images')
export class CamperImagesController {
  constructor(private readonly camperImagesService: CamperImagesService) {}

  /**
   * Uploads one or more images for a camper.
   * Handles `POST /camper-images/:camperId/upload`.
   *
   * The {@link FilesInterceptor} parses the multipart body and exposes the
   * files sent under the form field named `images`; each becomes an entry in
   * the injected `files` array.
   *
   * @param camperId - id of the camper the images belong to
   * @param files - uploaded files parsed from the multipart request
   * @returns the persisted image records
   */
  @Post(':camperId/upload')
  @UseInterceptors(FilesInterceptor('images'))
  async uploadImages(
    @Param('camperId') camperId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.camperImagesService.uploadImages(camperId, files);
  }

  /**
   * Returns the images for the campers configured as homepage highlights.
   * Handles `GET /camper-images/highlights`.
   *
   * @returns the highlight campers' images
   */
  @Get('highlights')
  async getHighlights() {
    return await this.camperImagesService.findHighlights();
  }

  /**
   * Returns the single primary (cover) image of a camper.
   * Handles `GET /camper-images/:camperId/primary`.
   *
   * @param camperId - id of the camper
   * @returns the primary image record, or a null-ish result if none exists
   */
  @Get(':camperId/primary')
  async getPrimaryByCamperId(@Param('camperId') camperId: string) {
    return await this.camperImagesService.findPrimaryByCamperId(camperId);
  }

  /**
   * Returns all images of a camper.
   * Handles `GET /camper-images/:camperId`.
   *
   * @param camperId - id of the camper
   * @returns all image records for the camper
   */
  @Get(':camperId')
  async getAllByCamperId(@Param('camperId') camperId: string) {
    return await this.camperImagesService.findAllByCamperId(camperId);
  }
}
