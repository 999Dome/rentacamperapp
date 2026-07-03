import { Injectable } from '@nestjs/common';
import { LocationRepository } from '../../infrastructure/repositories/location.repository';
import { Location } from '../../domain/interfaces/location.interface';

@Injectable()
export class LocationsService {
  constructor(private readonly locationRepository: LocationRepository) {}

  async getAllLocations(): Promise<Location[]> {
    return await this.locationRepository.findAll();
  }

  async getLocationById(id: string): Promise<Location | null> {
    return await this.locationRepository.findById(id);
  }
}
