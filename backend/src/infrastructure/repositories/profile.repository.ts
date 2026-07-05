import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Database } from '../../types/supabase';
import { EntityNotFoundException } from '../../domain/exceptions/domain.exception';

/** A profile row, generated from the Supabase schema. */
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
/** Update payload for a profile, generated from the Supabase schema. */
export type ProfileUpdateInput =
  Database['public']['Tables']['profiles']['Update'];

/**
 * Abstraction over profile persistence.
 *
 * Consumers depend on this interface (via {@link PROFILE_REPOSITORY_TOKEN})
 * rather than the concrete class, so the Supabase implementation can be
 * swapped or mocked without touching the services.
 */
export interface IProfileRepository {
  findById(id: string): Promise<ProfileRow>;
  update(id: string, data: ProfileUpdateInput): Promise<ProfileRow>;
}

/**
 * Supabase-backed implementation of {@link IProfileRepository} for the
 * `profiles` table.
 */
@Injectable()
export class ProfileRepository implements IProfileRepository {
  private readonly tableName = 'profiles';

  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Fetches a profile by id.
   *
   * @param id The profile id (equal to the auth user id).
   * @returns The profile row.
   * @throws EntityNotFoundException If no profile exists for the id.
   * @throws Error If the query itself fails.
   */
  async findById(id: string): Promise<ProfileRow> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    if (!data) {
      throw new EntityNotFoundException('Profile', id);
    }

    return data;
  }

  /**
   * Updates a profile and returns the new state.
   *
   * @param id   The profile id to update.
   * @param data Partial update payload.
   * @returns The updated profile row.
   * @throws EntityNotFoundException If no profile exists for the id.
   * @throws Error If the update itself fails.
   */
  async update(id: string, data: ProfileUpdateInput): Promise<ProfileRow> {
    const { data: updated, error } = await this.supabase.client
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    if (!updated) {
      throw new EntityNotFoundException('Profile', id);
    }

    return updated;
  }
}

/** DI token used to inject {@link IProfileRepository} implementations. */
export const PROFILE_REPOSITORY_TOKEN = 'IProfileRepository';
