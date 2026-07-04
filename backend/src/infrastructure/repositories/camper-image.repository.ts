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
  bulkInsert(
    images: Omit<CamperImageRow, 'id' | 'created_at'>[],
  ): Promise<CamperImageRow[]>;
  uploadToStorage(
    fileName: string,
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<string>;
  deleteFromStorage(fileNames: string[]): Promise<void>;
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

  async bulkInsert(
    images: Omit<CamperImageRow, 'id' | 'created_at'>[],
  ): Promise<CamperImageRow[]> {
    if (images.length === 0) return [];

    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .insert(images)
      .select();

    if (error) {
      throw new Error(`Failed to bulk insert images: ${error.message}`);
    }

    return data || [];
  }

  async uploadToStorage(
    fileName: string,
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<string> {
    const bucket = 'camper-images';
    const { data, error } = await this.supabase.client.storage
      .from(bucket)
      .upload(fileName, fileBuffer, {
        contentType: mimeType,
      });

    if (error) {
      throw new Error(`Failed to upload to storage: ${error.message}`);
    }

    const { data: publicUrlData } = this.supabase.client.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  }

  async deleteFromStorage(fileNames: string[]): Promise<void> {
    if (fileNames.length === 0) return;
    const bucket = 'camper-images';
    const { error } = await this.supabase.client.storage
      .from(bucket)
      .remove(fileNames);

    if (error) {
      console.error(`Failed to delete from storage: ${error.message}`);
    }
  }
}

export const CAMPER_IMAGE_REPOSITORY_TOKEN = 'ICamperImageRepository';
