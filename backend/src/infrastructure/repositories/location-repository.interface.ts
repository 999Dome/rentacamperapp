import { Location } from '../../domain/interfaces/location.interface';

/**
 * Abstraction over pickup/return location persistence.
 *
 * Kept in its own file (rather than beside the implementation) because the
 * domain `Location` type is shared; the concrete Supabase implementation lives
 * in `location.repository.ts`.
 */
export interface ILocationRepository {
  findAll(): Promise<Location[]>;
  findById(id: string): Promise<Location | null>;
}
