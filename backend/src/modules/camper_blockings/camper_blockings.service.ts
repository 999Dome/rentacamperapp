import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CamperBlockingRepository } from '../../infrastructure/repositories/camper_blocking.repository';
import { CamperOwnerRepository } from '../../infrastructure/repositories/camper_owner.repository';
import {
  CamperBlocking,
  CreateCamperBlockingDto,
} from '../../domain/interfaces/camper_blocking.interface';

/**
 * Business logic for camper blockings. Every operation first verifies that the
 * calling user actually owns the camper (via {@link CamperOwnerRepository})
 * before touching blocking data through {@link CamperBlockingRepository}, so a
 * user can never read or modify another owner's blockings.
 */
@Injectable()
export class CamperBlockingsService {
  constructor(
    private readonly camperBlockingRepository: CamperBlockingRepository,
    private readonly camperOwnerRepository: CamperOwnerRepository,
  ) {}

  /**
   * Creates a blocking after validating ownership and the date range.
   *
   * @param userId - Id of the calling user; must be the camper's owner.
   * @param dto - Blocking data (camper id and start/end dates).
   * @returns A promise resolving to the created blocking.
   * @throws ForbiddenException if the user does not own the camper.
   * @throws BadRequestException if the start date is not before the end date.
   */
  async createBlocking(
    userId: string,
    dto: CreateCamperBlockingDto,
  ): Promise<CamperBlocking> {
    // Authorization: only the camper's owner may block it.
    const owner = await this.camperOwnerRepository.findByCamperId(
      dto.camper_id,
    );
    if (!owner || owner.user_id !== userId) {
      throw new ForbiddenException(
        'Sie sind nicht berechtigt, diesen Camper zu blockieren.',
      );
    }

    // Normalize both dates to midnight so the comparison is purely day-based
    // and unaffected by the time-of-day component of the incoming strings.
    const start = new Date(dto.start_date);
    const end = new Date(dto.end_date);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // A blocking must span at least one day; reject inverted or zero-length ranges.
    if (start >= end) {
      throw new BadRequestException('Startdatum muss vor dem Enddatum liegen.');
    }

    return this.camperBlockingRepository.create(dto);
  }

  /**
   * Returns all blockings for a camper the caller owns.
   *
   * @param userId - Id of the calling user; must be the camper's owner.
   * @param camperId - Id of the camper whose blockings are requested.
   * @returns A promise resolving to the camper's blockings.
   * @throws ForbiddenException if the user does not own the camper.
   */
  async getBlockings(
    userId: string,
    camperId: string,
  ): Promise<CamperBlocking[]> {
    // Authorization: only the owner may view a camper's blockings.
    const owner = await this.camperOwnerRepository.findByCamperId(camperId);
    if (!owner || owner.user_id !== userId) {
      throw new ForbiddenException(
        'Sie sind nicht berechtigt, Blockierungen für diesen Camper abzurufen.',
      );
    }
    return this.camperBlockingRepository.findByCamperId(camperId);
  }

  /**
   * Deletes a blocking after confirming it exists and the caller owns its camper.
   *
   * @param userId - Id of the calling user; must own the blocking's camper.
   * @param blockingId - Id of the blocking to delete.
   * @returns A promise that resolves once the blocking is removed.
   * @throws NotFoundException if no blocking with that id exists.
   * @throws ForbiddenException if the user does not own the camper.
   */
  async deleteBlocking(userId: string, blockingId: string): Promise<void> {
    // Load first so a missing blocking yields a 404 rather than a silent no-op.
    const blocking = await this.camperBlockingRepository.findById(blockingId);
    if (!blocking) {
      throw new NotFoundException('Blockierung nicht gefunden.');
    }

    // Authorization: derive the owner from the blocking's camper, since the
    // caller only supplies the blocking id (not the camper id).
    const owner = await this.camperOwnerRepository.findByCamperId(
      blocking.camper_id,
    );
    if (!owner || owner.user_id !== userId) {
      throw new ForbiddenException(
        'Sie sind nicht berechtigt, diese Blockierung zu löschen.',
      );
    }

    await this.camperBlockingRepository.delete(blockingId);
  }
}
