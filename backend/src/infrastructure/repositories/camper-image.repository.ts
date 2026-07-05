import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Database } from '../../types/supabase';

/** A camper-image row, generated from the Supabase schema. */
export type CamperImageRow =
  Database['public']['Tables']['camper_images']['Row'];

/**
 * Abstraction over camper-image persistence and storage.
 *
 * Images have two sides: metadata rows in the `camper_images` table and the
 * binary files in the `camper-images` storage bucket. This interface covers
 * both so callers depend on one seam (via {@link CAMPER_IMAGE_REPOSITORY_TOKEN}).
 */
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

/** Supabase-backed implementation of {@link ICamperImageRepository}. */
@Injectable()
export class CamperImageRepository implements ICamperImageRepository {
  private readonly tableName = 'camper_images';

  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Fetches the primary image path for each of the given highlight campers.
   *
   * Only `is_primary` images are returned so the homepage shows one thumbnail
   * per camper.
   *
   * @param highlightCamperIds Camper ids to fetch primary images for.
   * @returns One `{ camper_id, image_path }` per camper that has a primary
   *          image; empty if the input list is empty.
   * @throws Error If the query fails.
   */
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

  /**
   * Fetches the single primary image for a camper.
   *
   * @param camperId The camper id.
   * @returns The primary image row, or `null` if the camper has none.
   * @throws Error If the query fails.
   */
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

  /**
   * Fetches every image belonging to a camper (gallery view).
   *
   * @param camperId The camper id.
   * @returns All image rows for the camper; empty if none.
   * @throws Error If the query fails.
   */
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

  /**
   * Inserts several image metadata rows in one round-trip.
   *
   * @param images Rows to insert, without the server-generated `id`/`created_at`.
   * @returns The inserted rows; empty if `images` was empty.
   * @throws Error If the insert fails.
   */
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

  /**
   * Uploads an image file to the storage bucket and returns its public URL.
   *
   * @param fileName   Object key/path within the bucket.
   * @param fileBuffer Raw file bytes.
   * @param mimeType   Content type (e.g. `image/jpeg`).
   * @returns The public URL under which the uploaded file is served.
   * @throws Error If the upload fails.
   */
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

  /**
   * Removes files from the storage bucket.
   *
   * Failures are logged but intentionally not thrown: deleting the DB rows is
   * the source of truth, so an orphaned storage file should not fail the whole
   * operation (it can be cleaned up separately).
   *
   * @param fileNames Object keys to remove; no-op if empty.
   */
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

/** DI token used to inject {@link ICamperImageRepository} implementations. */
export const CAMPER_IMAGE_REPOSITORY_TOKEN = 'ICamperImageRepository';
