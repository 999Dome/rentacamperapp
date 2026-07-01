import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

export interface CamperOwnerRow {
  id: string;
  camper_id: string;
  user_id: string;
}

export interface CamperOwnerInsert {
  id?: string;
  camper_id: string;
  user_id: string;
}

@Injectable()
export class CamperOwnerRepository {
  private readonly table = 'camper_owner';

  constructor(private readonly supabase: SupabaseService) {}

  async findByUserId(userId: string): Promise<CamperOwnerRow[]> {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw new Error(
        `Failed to fetch camper_owner for user ${userId}: ${error.message}`,
      );
    }
    return data || [];
  }

  async findByCamperId(camperId: string): Promise<CamperOwnerRow | null> {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .select('*')
      .eq('camper_id', camperId)
      .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to fetch camper_owner for camper ${camperId}: ${error.message}`,
      );
    }
    return data;
  }

  async upsert(dto: CamperOwnerInsert): Promise<CamperOwnerRow> {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .upsert(dto, { onConflict: 'camper_id' })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to upsert camper_owner: ${error.message}`);
    }
    return data;
  }

  async deleteByCamperId(camperId: string): Promise<void> {
    const { error } = await this.supabase.client
      .from(this.table)
      .delete()
      .eq('camper_id', camperId);

    if (error) {
      throw new Error(
        `Failed to delete camper_owner for camper ${camperId}: ${error.message}`,
      );
    }
  }
}
