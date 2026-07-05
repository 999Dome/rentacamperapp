import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { CamperBlockingsService } from './camper_blockings.service';
import type {
  CamperBlocking,
  CreateCamperBlockingDto,
} from '../../domain/interfaces/camper_blocking.interface';

/**
 * HTTP controller for camper blockings — date ranges during which an owner
 * makes a camper unavailable for booking. Handles routes under the
 * `/camper-blockings` prefix and delegates to {@link CamperBlockingsService}.
 * The `userId` query parameter identifies the caller and is used downstream
 * for ownership authorization.
 */
@Controller('camper-blockings')
export class CamperBlockingsController {
  constructor(
    private readonly camperBlockingsService: CamperBlockingsService,
  ) {}

  /**
   * Creates a new blocking for a camper.
   * HTTP: POST /camper-blockings
   *
   * @param userId - Id of the calling user (must own the camper).
   * @param dto - The blocking to create (camper id and date range).
   * @returns A promise resolving to the created blocking.
   * @throws ForbiddenException if the user does not own the camper.
   * @throws BadRequestException if the date range is invalid.
   */
  @Post()
  async createBlocking(
    @Query('userId') userId: string,
    @Body() dto: CreateCamperBlockingDto,
  ): Promise<CamperBlocking> {
    return this.camperBlockingsService.createBlocking(userId, dto);
  }

  /**
   * Lists all blockings for a given camper.
   * HTTP: GET /camper-blockings/camper/:camperId
   *
   * @param userId - Id of the calling user (must own the camper).
   * @param camperId - Id of the camper whose blockings are requested.
   * @returns A promise resolving to the camper's blockings.
   * @throws ForbiddenException if the user does not own the camper.
   */
  @Get('camper/:camperId')
  async getBlockings(
    @Query('userId') userId: string,
    @Param('camperId') camperId: string,
  ): Promise<CamperBlocking[]> {
    return this.camperBlockingsService.getBlockings(userId, camperId);
  }

  /**
   * Deletes a blocking by id.
   * HTTP: DELETE /camper-blockings/:id
   *
   * @param userId - Id of the calling user (must own the camper).
   * @param id - Id of the blocking to delete.
   * @returns A promise that resolves once the blocking is deleted.
   * @throws NotFoundException if no blocking with that id exists.
   * @throws ForbiddenException if the user does not own the camper.
   */
  @Delete(':id')
  async deleteBlocking(
    @Query('userId') userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.camperBlockingsService.deleteBlocking(userId, id);
  }
}
