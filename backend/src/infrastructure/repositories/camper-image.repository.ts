import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Database } from '../../types/supabase';

export type CamperImageRow =
  Database['public']['Tables']['camper_images']['Row'];

export interface ICamperImageRepository {
  findHighlights(
    highlightCamperIds: string[],
  ): Promise<Array<{ camper_id: string | null; image_path: string | null }>>;
  findPrimaryByCamperId(camperId: string): Promise<CamperImageRow | null>;
  findAllByCamperId(camperId: string): Promise<CamperImageRow[]>;
}

@Injectable()
export class CamperImageRepository implements ICamperImageRepository {
  private readonly tableName = 'camper_images';

  constructor(private readonly supabase: SupabaseService) {}

  async findHighlights(
    highlightCamperIds: string[],
  ): Promise<Array<{ camper_id: string | null; image_path: string | null }>> {
    if (!highlightCamperIds || highlightCamperIds.length === 0) return [];

    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('camper_id, image_path')
      .in('camper_id', highlightCamperIds)
      .eq('is_primary', true);

    if (error) {
      throw new Error(
        `Failed to fetch highlight camper images: ${error.message}`,
      );
    }

    return data || [];
  }

  async findPrimaryByCamperId(
    camperId: string,
  ): Promise<CamperImageRow | null> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('*')
      .eq('camper_id', camperId)
      .eq('is_primary', true)
      .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to fetch primary image for camper ${camperId}: ${error.message}`,
      );
    }

    return data;
  }

  async findAllByCamperId(camperId: string): Promise<CamperImageRow[]> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('*')
      .eq('camper_id', camperId);

    if (error) {
      throw new Error(
        `Failed to fetch images for camper ${camperId}: ${error.message}`,
      );
    }

    return data || [];
  }
}

export const CAMPER_IMAGE_REPOSITORY_TOKEN = 'ICamperImageRepository';
