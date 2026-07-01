import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Database } from '../../types/supabase';

export type AddonRow = Database['public']['Tables']['addons']['Row'];

export interface IAddonRepository {
  findAll(): Promise<AddonRow[]>;
  findByIds(ids: string[]): Promise<AddonRow[]>;
}

@Injectable()
export class AddonRepository implements IAddonRepository {
  private readonly tableName = 'addons';

  constructor(private readonly supabase: SupabaseService) {}

  async findAll(): Promise<AddonRow[]> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('*');

    if (error) {
      throw new Error(`Failed to fetch addons: ${error.message}`);
    }

    return data || [];
  }

  async findByIds(ids: string[]): Promise<AddonRow[]> {
    if (!ids || ids.length === 0) return [];

    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('*')
      .in('id', ids);

    if (error) {
      throw new Error(`Failed to fetch addons by ids: ${error.message}`);
    }

    return data || [];
  }
}

export const ADDON_REPOSITORY_TOKEN = 'IAddonRepository';
