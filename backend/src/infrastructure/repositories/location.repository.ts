import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { ILocationRepository } from './location-repository.interface';
import { Location } from '../../domain/interfaces/location.interface';

@Injectable()
export class LocationRepository implements ILocationRepository {
  private readonly tableName = 'locations';

  constructor(private readonly supabase: SupabaseService) {}

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
