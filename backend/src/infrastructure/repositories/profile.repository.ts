import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Database } from '../../types/supabase';
import { EntityNotFoundException } from '../../domain/exceptions/domain.exception';

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdateInput =
  Database['public']['Tables']['profiles']['Update'];

export interface IProfileRepository {
  findById(id: string): Promise<ProfileRow>;
  update(id: string, data: ProfileUpdateInput): Promise<ProfileRow>;
}

@Injectable()
export class ProfileRepository implements IProfileRepository {
  private readonly tableName = 'profiles';

  constructor(private readonly supabase: SupabaseService) {}

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

export const PROFILE_REPOSITORY_TOKEN = 'IProfileRepository';
