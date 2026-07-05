import { Injectable } from '@nestjs/common';
import {
  CamperOwnerRepository,
  CamperOwnerInsert,
  CamperOwnerRow,
} from '../../infrastructure/repositories/camper_owner.repository';

/**
 * Business-logic service for camper ownership. It delegates persistence to
 * {@link CamperOwnerRepository} and provides the read/assign/remove operations
 * used by {@link CamperOwnerController}.
 */
@Injectable()
export class CamperOwnerService {
  constructor(private readonly camperOwnerRepository: CamperOwnerRepository) {}

  /**
   * Returns all ownership records belonging to a user.
   *
   * @param userId - id of the user
   * @returns the user's ownership records
   */
  async findByUserId(userId: string): Promise<CamperOwnerRow[]> {
    return await this.camperOwnerRepository.findByUserId(userId);
  }

  /**
   * Returns the ownership record for a single camper.
   *
   * @param camperId - id of the camper
   * @returns the ownership record, or `null` if the camper has no owner
   */
  async findByCamperId(camperId: string): Promise<CamperOwnerRow | null> {
    return await this.camperOwnerRepository.findByCamperId(camperId);
  }

  /**
   * Assigns an owner to a camper. Uses an upsert, so calling it again for the
   * same camper updates the existing record instead of creating a duplicate.
   *
   * @param dto - ownership data to persist
   * @returns the persisted ownership record
   */
  async assignOwner(dto: CamperOwnerInsert): Promise<CamperOwnerRow> {
    return await this.camperOwnerRepository.upsert(dto);
  }

  /**
   * Removes the ownership record of a camper.
   *
   * @param camperId - id of the camper whose ownership should be removed
   * @returns nothing once the record is deleted
   */
  async removeOwner(camperId: string): Promise<void> {
    return await this.camperOwnerRepository.deleteByCamperId(camperId);
  }
}
