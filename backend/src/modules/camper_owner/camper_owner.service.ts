import { Injectable } from '@nestjs/common';
import {
  CamperOwnerRepository,
  CamperOwnerInsert,
  CamperOwnerRow,
} from '../../infrastructure/repositories/camper_owner.repository';

@Injectable()
export class CamperOwnerService {
  constructor(private readonly camperOwnerRepository: CamperOwnerRepository) {}

  async findByUserId(userId: string): Promise<CamperOwnerRow[]> {
    return await this.camperOwnerRepository.findByUserId(userId);
  }

  async findByCamperId(camperId: string): Promise<CamperOwnerRow | null> {
    return await this.camperOwnerRepository.findByCamperId(camperId);
  }

  async assignOwner(dto: CamperOwnerInsert): Promise<CamperOwnerRow> {
    return await this.camperOwnerRepository.upsert(dto);
  }

  async removeOwner(camperId: string): Promise<void> {
    return await this.camperOwnerRepository.deleteByCamperId(camperId);
  }
}
