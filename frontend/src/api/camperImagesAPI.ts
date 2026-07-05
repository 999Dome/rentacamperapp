import { BaseAPIClient } from '../infrastructure/api/base-api-client';
import type { CamperImage } from "../types/interface.ts";

/**
 * Talks to the backend's "camper images" endpoints: fetching highlighted
 * images, a camper's primary/all images, and uploading new images for a
 * camper. Read operations fail softly (log + fallback value); the upload
 * re-throws so the caller can show an error to the user.
 */

const client = new BaseAPIClient();

/**
 * Fetches a curated set of "highlight" images used e.g. on the homepage.
 * @returns The highlight images, or an empty array if the request fails.
 */
export async function getHighlightCamperImages(): Promise<CamperImage[]> {
  try {
    return await client.request<CamperImage[]>('camper-images/highlights');
  } catch (error) {
    console.error('Error while fetching highlight camper images:', error);
    return [];
  }
}

/**
 * Fetches the primary (main) image for a given camper.
 * @param camperId ID of the camper.
 * @returns The primary image, or `null` if none exists or the request fails.
 */
export async function getCamperPrimaryImageById(camperId: string): Promise<CamperImage | null> {
  try {
    return await client.request<CamperImage>(`camper-images/${camperId}/primary`);
  } catch (error) {
    console.error('Error while loading the camper image:', error);
    return null;
  }
}

/**
 * Fetches every image belonging to a given camper.
 * @param camperId ID of the camper.
 * @returns All images for the camper, or an empty array if the request fails.
 */
export async function getAllCamperImagesById(camperId: string): Promise<CamperImage[]> {
  try {
    return await client.request<CamperImage[]>(`camper-images/${camperId}`);
  } catch (error) {
    console.error('error while loading the camper-images:', error);
    return [];
  }
}

/**
 * Uploads one or more image files for a camper.
 * @param camperId ID of the camper the images belong to.
 * @param files Image files selected by the user (sent as multipart form data).
 * @returns The newly created image records.
 * @throws Re-throws the underlying error so the caller can surface an upload failure.
 */
export async function uploadCamperImages(camperId: string, files: File[]): Promise<CamperImage[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append('images', file);
  }

  try {
    return await client.request<CamperImage[]>(`camper-images/${camperId}/upload`, {
      method: 'POST',
      body: formData,
    });
  } catch (error) {
    console.error('Error while uploading camper images:', error);
    throw error;
  }
}

