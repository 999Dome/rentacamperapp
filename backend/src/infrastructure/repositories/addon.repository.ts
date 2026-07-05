import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Database } from '../../types/supabase';

/** An add-on row, generated from the Supabase schema. */
export type AddonRow = Database['public']['Tables']['addons']['Row'];

/**
 * Abstraction over add-on persistence. Injected via
 * {@link ADDON_REPOSITORY_TOKEN} so services depend on the seam, not Supabase.
 */
export interface IAddonRepository {
  findAll(): Promise<AddonRow[]>;
  findByIds(ids: string[]): Promise<AddonRow[]>;
}

/** Supabase-backed implementation of {@link IAddonRepository}. */
@Injectable()
export class AddonRepository implements IAddonRepository {
  private readonly tableName = 'addons';

  constructor(private readonly supabase: SupabaseService) {}

  /**
   * @returns All available add-ons.
   * @throws Error If the query fails.
   */
  async findAll(): Promise<AddonRow[]> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('*');

    if (error) {
      throw new Error(`Failed to fetch addons: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Batch-fetches add-ons by id (used when pricing a booking's selection).
   *
   * @param ids Add-on ids to fetch.
   * @returns The matching add-ons; empty if `ids` is empty.
   * @throws Error If the query fails.
   */
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

/** DI token used to inject {@link IAddonRepository} implementations. */
export const ADDON_REPOSITORY_TOKEN = 'IAddonRepository';
