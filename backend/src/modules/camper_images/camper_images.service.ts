import { Injectable, Inject } from '@nestjs/common';
import 'multer';
import type { ICamperImageRepository } from '../../infrastructure/repositories/camper-image.repository';
import { CAMPER_IMAGE_REPOSITORY_TOKEN } from '../../infrastructure/repositories/camper-image.repository';
import { CampersConfigService } from '../../domain/services/campers-config.service';

/**
 * Business-logic service for camper images. It coordinates image lookups and
 * uploads, delegating persistence and object storage to an
 * {@link ICamperImageRepository} and reading the highlight configuration from
 * {@link CampersConfigService}.
 */
@Injectable()
export class CamperImagesService {
  constructor(
    // Injected by DI token so the service depends only on the repository
    // interface, not a concrete class.
    @Inject(CAMPER_IMAGE_REPOSITORY_TOKEN)
    private readonly camperImageRepository: ICamperImageRepository,
    private readonly campersConfigService: CampersConfigService,
  ) {}

  /**
   * Returns the images of the campers marked as homepage highlights.
   * The set of highlighted campers comes from configuration, not the database.
   *
   * @returns the highlight campers' images
   */
  async findHighlights() {
    const highlightIds = this.campersConfigService.getHighlightCamperIds();
    return await this.camperImageRepository.findHighlights(highlightIds);
  }

  /**
   * Returns the primary (cover) image of a camper.
   *
   * @param camperId - id of the camper
   * @returns the primary image record, or a null-ish result if none exists
   */
  async findPrimaryByCamperId(camperId: string) {
    return await this.camperImageRepository.findPrimaryByCamperId(camperId);
  }

  /**
   * Returns all images of a camper.
   *
   * @param camperId - id of the camper
   * @returns all image records for the camper
   */
  async findAllByCamperId(camperId: string) {
    return await this.camperImageRepository.findAllByCamperId(camperId);
  }

  /**
   * Uploads a batch of images for a camper: each file is pushed to object
   * storage first, then all resulting rows are written to the database in a
   * single bulk insert. The first file in the batch is flagged as the primary
   * (cover) image.
   *
   * If the database insert fails after files were already uploaded, every
   * uploaded file is deleted again so storage does not leak orphaned objects.
   *
   * @param camperId - id of the camper the images belong to
   * @param files - uploaded files from the multipart request; may be empty
   * @returns the inserted image rows, or an empty array when no files are given
   * @throws re-throws any storage or database error after best-effort cleanup
   */
  async uploadImages(camperId: string, files: Express.Multer.File[]) {
    // Nothing to do for an empty upload; avoids a pointless DB round-trip.
    if (!files || files.length === 0) return [];

    // Track uploaded storage object names so we can roll them back on failure.
    const uploadedFileNames: string[] = [];
    const imageRows: {
      camper_id: string;
      image_path: string;
      is_primary: boolean;
    }[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Timestamp + random number keeps names unique so concurrent uploads
        // for the same camper never overwrite each other in storage.
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        // Fall back to 'jpg' when the original file name carries no extension.
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
          // The first uploaded image becomes the camper's cover image.
          is_primary: i === 0,
        });
      }

      // Persist all rows at once only after every file uploaded successfully.
      const inserted = await this.camperImageRepository.bulkInsert(imageRows);
      return inserted;
    } catch (error) {
      // Compensating action: remove already-uploaded objects so a failed
      // insert does not leave orphaned files behind in storage.
      if (uploadedFileNames.length > 0) {
        await this.camperImageRepository.deleteFromStorage(uploadedFileNames);
      }
      throw error;
    }
  }
}
