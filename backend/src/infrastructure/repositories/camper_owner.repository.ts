import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

/** Link row associating a camper with its owning user. */
export interface CamperOwnerRow {
  id: string;
  camper_id: string;
  user_id: string;
}

/** Insert payload for a camper-owner link (`id` is server-generated). */
export interface CamperOwnerInsert {
  id?: string;
  camper_id: string;
  user_id: string;
}

/**
 * Data-access layer for the `camper_owner` join table, which records which
 * user owns which camper (a camper has exactly one owner).
 */
@Injectable()
export class CamperOwnerRepository {
  private readonly table = 'camper_owner';

  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Lists all camper-owner links for a user (i.e. the campers they own).
   *
   * @param userId The owning user's id.
   * @returns The user's ownership links; empty if they own none.
   * @throws Error If the query fails.
   */
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

  /**
   * Finds the owner link for a single camper.
   *
   * @param camperId The camper id.
   * @returns The ownership link, or `null` if the camper has no owner set.
   * @throws Error If the query fails.
   */
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

  /**
   * Creates or updates the owner of a camper.
   *
   * `onConflict: 'camper_id'` enforces the one-owner-per-camper rule: assigning
   * a new owner to a camper that already has one overwrites the existing link
   * instead of creating a duplicate.
   *
   * @param dto The camper/user link to persist.
   * @returns The upserted ownership link.
   * @throws Error If the upsert fails.
   */
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

  /**
   * Removes the ownership link for a camper.
   *
   * @param camperId The camper whose owner link to delete.
   * @throws Error If the delete fails.
   */
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
