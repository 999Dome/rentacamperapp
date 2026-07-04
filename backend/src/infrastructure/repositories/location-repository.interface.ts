import { Location } from '../../domain/interfaces/location.interface';

export interface ILocationRepository {
  findAll(): Promise<Location[]>;
  findById(id: string): Promise<Location | null>;
}
