import {
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  Body,
  Query,
} from '@nestjs/common';
import { CampersService } from './camper.service';
import type {
  CamperInsertInput,
  CamperUpdateInput,
} from '../../infrastructure/repositories/camper.repository';

/**
 * HTTP endpoints for campers, mounted under the `/campers` route prefix.
 *
 * Thin transport layer over {@link CampersService}: browsing, price
 * calculation, and CRUD. Note that `:id` is declared after the more specific
 * `all`/`highlights` routes so those literal paths are not swallowed by the
 * dynamic parameter.
 */
@Controller('campers')
export class CampersController {
  constructor(private readonly campersService: CampersService) {}

  /**
   * `GET /campers/all` — lists campers with optional filters.
   *
   * @param requiredLicense Optional exact license-class filter.
   * @param emissionsClass  Optional `'Elektro'` / `'Euro 6'` filter.
   * @returns The matching campers.
   */
  @Get('all')
  async getAll(
    @Query('requiredLicense') requiredLicense?: string,
    @Query('emissionsClass') emissionsClass?: string,
  ): Promise<unknown> {
    return await this.campersService.findAllCampers(
      requiredLicense,
      emissionsClass,
    );
  }

  /**
   * `GET /campers/highlights` — the curated campers shown on the homepage.
   *
   * @returns The highlighted campers.
   */
  @Get('highlights')
  async getHighlights(): Promise<unknown> {
    return await this.campersService.findHighlights();
  }

  /**
   * `GET /campers/:id` — fetches a single camper.
   *
   * @param id The camper id.
   * @returns The camper.
   */
  @Get(':id')
  async getById(@Param('id') id: string): Promise<unknown> {
    return await this.campersService.findById(id);
  }

  /**
   * `POST /campers/calculate-price` — computes a price quote for a date range
   * and add-on selection, without creating a booking.
   *
   * @param camperId         The camper to price.
   * @param startDate        Rental start (ISO or `DD.MM.YYYY`).
   * @param endDate          Rental end (ISO or `DD.MM.YYYY`).
   * @param selectedAddonIds Ids of the add-ons to include.
   * @returns The full price breakdown.
   */
  @Post('calculate-price')
  async calculatePrice(
    @Body('camperId') camperId: string,
    @Body('startDate') startDate: string,
    @Body('endDate') endDate: string,
    @Body('selectedAddonIds') selectedAddonIds: string[],
  ): Promise<unknown> {
    return await this.campersService.calculatePrice({
      camperId,
      startDateStr: startDate,
      endDateStr: endDate,
      selectedAddonIds,
    });
  }

  /**
   * `POST /campers/create` — creates a camper.
   *
   * @param dto Insert payload matching the DB schema.
   * @returns The created camper.
   */
  @Post('create')
  async create(@Body() dto: CamperInsertInput): Promise<unknown> {
    return await this.campersService.create(dto);
  }

  /**
   * `PUT /campers/:id` — updates a camper.
   *
   * @param id  Id of the camper to update.
   * @param dto Partial update payload.
   * @returns The updated camper.
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: CamperUpdateInput,
  ): Promise<unknown> {
    return await this.campersService.update(id, dto);
  }

  /**
   * `DELETE /campers/:id` — deletes a camper.
   *
   * @param id Id of the camper to delete.
   * @returns The deleted camper.
   */
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<unknown> {
    return await this.campersService.delete(id);
  }
}
