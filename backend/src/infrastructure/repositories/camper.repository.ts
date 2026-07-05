import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Database } from '../../types/supabase';

/**
 * A camper as consumed by the app layer.
 *
 * The core pricing/licensing fields are typed explicitly; the index signature
 * (`[key: string]: unknown`) allows the many additional DB columns (fuel,
 * beds, description, …) to pass through without listing each one. `ownerId`
 * and `providerType` are derived from a join in {@link mapCamperRow}, not
 * stored columns.
 */
export interface Camper {
  id: string;
  name: string | null;
  price_per_night_base: number;
  cleaning_fee: number;
  deposit_amount: number;
  /** License class required to drive this camper. */
  required_license: string;
  /** `original` = admin-owned fleet vehicle, `privat` = private provider. */
  providerType?: 'original' | 'privat';
  /** Owning user's id, resolved from the `camper_owner` join. */
  ownerId?: string;
  [key: string]: unknown;
}

/** Insert payload shape, generated from the Supabase schema. */
export type CamperInsertInput =
  Database['public']['Tables']['campers']['Insert'];
/** Update payload shape, generated from the Supabase schema. */
export type CamperUpdateInput =
  Database['public']['Tables']['campers']['Update'];

export interface Addon {
  id: string;
  name: string;
  price: number;
  is_per_night: boolean;
}

/**
 * Data-access layer for the `campers` table.
 *
 * Every query eagerly joins `camper_owner → profiles` so the mapper can tag
 * each camper with its owner and provider type in one round-trip.
 */
@Injectable()
export class CampersRepository {
  private readonly table = 'campers';

  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Flattens a raw joined DB row into a clean {@link Camper}.
   *
   * Supabase returns the joined `camper_owner` relation as either an object or
   * a single-element array depending on the relationship; this normalises both
   * cases, derives `ownerId`/`providerType`, and strips the nested join so it
   * does not leak to the client.
   *
   * @param row Raw row including the `camper_owner` join.
   * @returns The mapped camper.
   */
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
      // An admin owner marks a vehicle as part of the "original" fleet;
      // anyone else is a private ("privat") provider.
      const isAdmin = profiles?.is_admin;
      camper.providerType = isAdmin ? 'original' : 'privat';
    }

    delete camper.camper_owner;
    return camper as unknown as Camper;
  }

  /**
   * Lists campers, optionally filtered by required license and emissions class.
   *
   * @param requiredLicense Only return campers requiring exactly this class.
   * @param emissionsClass  `'Elektro'` → electric (0 fuel consumption),
   *                        `'Euro 6'` → combustion (fuel consumption > 0).
   * @returns The matching campers, each enriched with owner/provider info.
   * @throws Error If the query fails.
   */
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
      // Emissions class is not a stored column; it is inferred from fuel usage:
      // electric campers record 0 consumption, combustion campers record > 0.
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

  /**
   * Fetches a single camper by id.
   *
   * @param id Camper id.
   * @returns The camper (enriched with owner/provider info).
   * @throws Error If no camper exists or the query fails.
   */
  async findById(id: string): Promise<Camper> {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .select('*, camper_owner(user_id, profiles(is_admin))')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Camper not found: ${error.message}`);
    return this.mapCamperRow(data);
  }

  /**
   * Batch-fetches campers by a list of ids (used e.g. for homepage highlights).
   *
   * @param ids Camper ids to fetch.
   * @returns The matching campers; an empty array if `ids` is empty.
   * @throws Error If the query fails.
   */
  async findByIds(ids: string[]): Promise<Camper[]> {
    if (ids.length === 0) return [];

    const { data, error } = await this.supabase.client
      .from(this.table)
      .select('*, camper_owner(user_id, profiles(is_admin))')
      .in('id', ids);

    if (error) throw new Error(`Failed to fetch campers: ${error.message}`);
    return (data || []).map((row) => this.mapCamperRow(row));
  }

  /**
   * Sanitizes the camper DTO by removing non-database fields that may be sent from the frontend.
   */
  private sanitizeDto<T extends object>(dto: T): T {
    if (!dto || typeof dto !== 'object') {
      return dto;
    }
    const {
      features_list,
      image_url,
      ownerId,
      owner_id,
      providerType,
      ...clean
    } = dto as T & {
      features_list?: unknown;
      image_url?: unknown;
      ownerId?: unknown;
      owner_id?: unknown;
      providerType?: unknown;
    };
    return clean as T;
  }

  /**
   * Inserts a new camper.
   *
   * @param dto Insert payload matching the DB schema.
   * @returns The newly created camper row.
   * @throws Error If the insert fails.
   */
  async create(dto: CamperInsertInput): Promise<Camper> {
    const sanitized = this.sanitizeDto(dto);
    const { data, error } = await this.supabase.client
      .from(this.table)
      .insert(sanitized)
      .select()
      .single();

    if (error) throw new Error(`Failed to create camper: ${error.message}`);
    return data;
  }

  /**
   * Updates an existing camper.
   *
   * @param id  Id of the camper to update.
   * @param dto Partial update payload.
   * @returns The updated camper row.
   * @throws Error If the update fails.
   */
  async update(id: string, dto: CamperUpdateInput): Promise<Camper> {
    const sanitized = this.sanitizeDto(dto);
    const { data, error } = await this.supabase.client
      .from(this.table)
      .update(sanitized)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update camper: ${error.message}`);
    return data;
  }

  /**
   * Deletes a camper.
   *
   * @param id Id of the camper to delete.
   * @returns The deleted camper row.
   * @throws Error If the delete fails.
   */
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
