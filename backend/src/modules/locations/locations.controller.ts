import { Controller, Get, Param } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { Location } from '../../domain/interfaces/location.interface';

/**
 * HTTP controller for pickup/return locations.
 *
 * All routes are mounted under the `locations` prefix. It is a thin layer that
 * delegates to {@link LocationsService} and returns {@link Location} data as-is.
 */
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  /**
   * Lists all known locations.
   *
   * HTTP: `GET /locations`
   *
   * @returns All {@link Location} records.
   */
  @Get()
  async getAll(): Promise<Location[]> {
    return await this.locationsService.getAllLocations();
  }

  /**
   * Fetches a single location by id.
   *
   * HTTP: `GET /locations/:id`
   *
   * @param id - The location id from the URL path.
   * @returns The matching {@link Location}, or `null` if none exists.
   */
  @Get(':id')
  async getById(@Param('id') id: string): Promise<Location | null> {
    return await this.locationsService.getLocationById(id);
  }
}
