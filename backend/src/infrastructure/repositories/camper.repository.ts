import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Database } from '../../types/supabase';

export interface Camper {
  id: string;
  name: string | null;
  price_per_night_base: number;
  cleaning_fee: number;
  deposit_amount: number;
  required_license: string;
  providerType?: 'original' | 'privat';
  ownerId?: string;
  [key: string]: unknown;
}

export type CamperInsertInput =
  Database['public']['Tables']['campers']['Insert'];
export type CamperUpdateInput =
  Database['public']['Tables']['campers']['Update'];

export interface Addon {
  id: string;
  name: string;
  price: number;
  is_per_night: boolean;
}

@Injectable()
export class CampersRepository {
  private readonly table = 'campers';

  constructor(private readonly supabase: SupabaseService) {}

  private mapCamperRow(row: Record<string, unknown>): Camper {
    const camper = { ...row } as Record<string, unknown>;

    // Extract owner and provider type from nested join
    let ownerInfo = camper.camper_owner as
      | Record<string, unknown>
      | Record<string, unknown>[]
      | undefined;
    if (Array.isArray(ownerInfo) && ownerInfo.length > 0) {
      ownerInfo = ownerInfo[0];
    }

    if (ownerInfo && typeof ownerInfo === 'object' && 'user_id' in ownerInfo) {
      camper.ownerId = ownerInfo.user_id;
      const profiles = ownerInfo.profiles as
        | Record<string, unknown>
        | undefined;
      const isAdmin = profiles?.is_admin;
      camper.providerType = isAdmin ? 'original' : 'privat';
    }

    delete camper.camper_owner;
    return camper as unknown as Camper;
  }

  async findAll(
    requiredLicense?: string,
    emissionsClass?: string,
  ): Promise<Camper[]> {
    let query = this.supabase.client
      .from(this.table)
      .select('*, camper_owner(user_id, profiles(is_admin))');

    if (requiredLicense) {
      query = query.eq('required_license', requiredLicense);
    }

    if (emissionsClass) {
      if (emissionsClass === 'Elektro') {
        query = query.eq('fuel_consumption', 0);
      } else if (emissionsClass === 'Euro 6') {
        query = query.gt('fuel_consumption', 0);
      }
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to fetch campers: ${error.message}`);
    return (data || []).map((row) => this.mapCamperRow(row));
  }

  async findById(id: string): Promise<Camper> {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .select('*, camper_owner(user_id, profiles(is_admin))')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Camper not found: ${error.message}`);
    return this.mapCamperRow(data);
  }

  async findByIds(ids: string[]): Promise<Camper[]> {
    if (ids.length === 0) return [];

    const { data, error } = await this.supabase.client
      .from(this.table)
      .select('*, camper_owner(user_id, profiles(is_admin))')
      .in('id', ids);

    if (error) throw new Error(`Failed to fetch campers: ${error.message}`);
    return (data || []).map((row) => this.mapCamperRow(row));
  }

  async create(dto: CamperInsertInput): Promise<Camper> {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .insert(dto)
      .select()
      .single();

    if (error) throw new Error(`Failed to create camper: ${error.message}`);
    return data;
  }

  async update(id: string, dto: CamperUpdateInput): Promise<Camper> {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update camper: ${error.message}`);
    return data;
  }

  async delete(id: string): Promise<Camper> {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to delete camper: ${error.message}`);
    return data;
  }
}
