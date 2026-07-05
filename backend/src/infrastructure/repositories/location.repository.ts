import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { ILocationRepository } from './location-repository.interface';
import { Location } from '../../domain/interfaces/location.interface';

/**
 * Supabase-backed implementation of {@link ILocationRepository} for the
 * `locations` table.
 */
@Injectable()
export class LocationRepository implements ILocationRepository {
  private readonly tableName = 'locations';

  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Lists all locations, alphabetically by city (for select menus).
   *
   * @returns All locations, each normalised via {@link mapToLocation}.
   * @throws Error If the query fails.
   */
  async findAll(): Promise<Location[]> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('*')
      .order('city', { ascending: true });

    if (error) {
      throw new Error(`Failed to find locations: ${error.message}`);
    }

    return (data || []).map((loc) => this.mapToLocation(loc));
  }

  /**
   * Fetches a single location by id.
   *
   * @param id The location id.
   * @returns The location, or `null` if none exists.
   * @throws Error If the query fails.
   */
  async findById(id: string): Promise<Location | null> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to find location: ${error.message}`);
    }

    return data ? this.mapToLocation(data) : null;
  }

  /**
   * Maps a raw DB row to the domain {@link Location} shape, supplying a
   * human-friendly `name` fallback ("<city> Station") when the column is empty.
   *
   * @param data Raw location row.
   * @returns The normalised location.
   */
  private mapToLocation(data: Record<string, unknown>): Location {
    return {
      id: data.id as string,
      name: (data.name as string) || `${data.city as string} Station`, // Fallback for name
      street: data.street as string,
      housenumber: data.housenumber as number | undefined,
      plz: data.plz as number | undefined,
      city: data.city as string,
      latitude: data.latitude as number | undefined,
      longitude: data.longitude as number | undefined,
    };
  }
}
