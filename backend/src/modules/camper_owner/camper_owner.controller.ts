import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { CamperOwnerService } from './camper_owner.service';
import type {
  CamperOwnerInsert,
  CamperOwnerRow,
} from '../../infrastructure/repositories/camper_owner.repository';

/**
 * HTTP controller managing camper-to-owner relationships, mounted under the
 * `/camper-owner` prefix. It exposes lookups by user and by camper plus
 * assign/remove operations, delegating all work to {@link CamperOwnerService}.
 */
@Controller('camper-owner')
export class CamperOwnerController {
  constructor(private readonly camperOwnerService: CamperOwnerService) {}

  /**
   * Returns all ownership records for a user (a user may own several campers).
   * Handles `GET /camper-owner/user/:userId`.
   *
   * @param userId - id of the user
   * @returns the user's ownership records
   */
  @Get('user/:userId')
  async getByUserId(
    @Param('userId') userId: string,
  ): Promise<CamperOwnerRow[]> {
    return await this.camperOwnerService.findByUserId(userId);
  }

  /**
   * Returns the ownership record for a single camper.
   * Handles `GET /camper-owner/camper/:camperId`.
   *
   * @param camperId - id of the camper
   * @returns the ownership record, or `null` if the camper has no owner
   */
  @Get('camper/:camperId')
  async getByCamperId(
    @Param('camperId') camperId: string,
  ): Promise<CamperOwnerRow | null> {
    return await this.camperOwnerService.findByCamperId(camperId);
  }

  /**
   * Assigns (or reassigns) an owner to a camper.
   * Handles `POST /camper-owner`.
   *
   * @param dto - ownership data parsed from the request body
   * @returns the persisted ownership record
   */
  @Post()
  async assignOwner(@Body() dto: CamperOwnerInsert): Promise<CamperOwnerRow> {
    return await this.camperOwnerService.assignOwner(dto);
  }

  /**
   * Removes the owner of a camper.
   * Handles `DELETE /camper-owner/camper/:camperId`.
   *
   * @param camperId - id of the camper whose ownership should be removed
   * @returns nothing once the record is deleted
   */
  @Delete('camper/:camperId')
  async removeOwner(@Param('camperId') camperId: string): Promise<void> {
    return await this.camperOwnerService.removeOwner(camperId);
  }
}
