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

@Injectable()
export class CamperBlockingsService {
  constructor(
    private readonly camperBlockingRepository: CamperBlockingRepository,
    private readonly camperOwnerRepository: CamperOwnerRepository,
  ) {}

  async createBlocking(
    userId: string,
    dto: CreateCamperBlockingDto,
  ): Promise<CamperBlocking> {
    const owner = await this.camperOwnerRepository.findByCamperId(
      dto.camper_id,
    );
    if (!owner || owner.user_id !== userId) {
      throw new ForbiddenException(
        'Sie sind nicht berechtigt, diesen Camper zu blockieren.',
      );
    }

    const start = new Date(dto.start_date);
    const end = new Date(dto.end_date);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (start >= end) {
      throw new BadRequestException('Startdatum muss vor dem Enddatum liegen.');
    }

    return this.camperBlockingRepository.create(dto);
  }

  async getBlockings(
    userId: string,
    camperId: string,
  ): Promise<CamperBlocking[]> {
    const owner = await this.camperOwnerRepository.findByCamperId(camperId);
    if (!owner || owner.user_id !== userId) {
      throw new ForbiddenException(
        'Sie sind nicht berechtigt, Blockierungen für diesen Camper abzurufen.',
      );
    }
    return this.camperBlockingRepository.findByCamperId(camperId);
  }

  async deleteBlocking(userId: string, blockingId: string): Promise<void> {
    const blocking = await this.camperBlockingRepository.findById(blockingId);
    if (!blocking) {
      throw new NotFoundException('Blockierung nicht gefunden.');
    }

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
