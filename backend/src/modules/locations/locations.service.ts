import { Injectable } from '@nestjs/common';
import { LocationRepository } from '../../infrastructure/repositories/location.repository';
import { Location } from '../../domain/interfaces/location.interface';

/**
 * Business logic for locations. Currently a straightforward pass-through to the
 * {@link LocationRepository}, kept as a separate layer so future rules (filtering,
 * caching, access control) have a natural home.
 */
@Injectable()
export class LocationsService {
  constructor(private readonly locationRepository: LocationRepository) {}

  /**
   * Returns every location.
   *
   * @returns All {@link Location} records.
   */
  async getAllLocations(): Promise<Location[]> {
    return await this.locationRepository.findAll();
  }

  /**
   * Returns a single location by id.
   *
   * @param id - The location id to look up.
   * @returns The matching {@link Location}, or `null` if none exists.
   */
  async getLocationById(id: string): Promise<Location | null> {
    return await this.locationRepository.findById(id);
  }
}
