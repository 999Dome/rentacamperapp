import { Controller, Get, Param } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { Location } from '../../domain/interfaces/location.interface';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  async getAll(): Promise<Location[]> {
    return await this.locationsService.getAllLocations();
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<Location | null> {
    return await this.locationsService.getLocationById(id);
  }
}
