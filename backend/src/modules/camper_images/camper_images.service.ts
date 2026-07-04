import { Injectable, Inject } from '@nestjs/common';
import 'multer';
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

  async uploadImages(camperId: string, files: Express.Multer.File[]) {
    if (!files || files.length === 0) return [];

    const uploadedFileNames: string[] = [];
    const imageRows = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileExt = file.originalname.split('.').pop() || 'jpg';
        const fileName = `${camperId}-${uniqueSuffix}.${fileExt}`;

        const publicUrl = await this.camperImageRepository.uploadToStorage(
          fileName,
          file.buffer,
          file.mimetype,
        );

        uploadedFileNames.push(fileName);

        imageRows.push({
          camper_id: camperId,
          image_path: publicUrl,
          is_primary: i === 0,
        });
      }

      const inserted = await this.camperImageRepository.bulkInsert(imageRows);
      return inserted;
    } catch (error) {
      if (uploadedFileNames.length > 0) {
        await this.camperImageRepository.deleteFromStorage(uploadedFileNames);
      }
      throw error;
    }
  }
}
