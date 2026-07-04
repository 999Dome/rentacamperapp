import { BaseAPIClient } from '../infrastructure/api/base-api-client';
import type { CamperImage } from "../types/interface.ts";

const client = new BaseAPIClient();

export async function getHighlightCamperImages(): Promise<CamperImage[]> {
  try {
    return await client.request<CamperImage[]>('camper-images/highlights');
  } catch (error) {
    console.error('Error while fetching highlight camper images:', error);
    return [];
  }
}

export async function getCamperPrimaryImageById(camperId: string): Promise<CamperImage | null> {
  try {
    return await client.request<CamperImage>(`camper-images/${camperId}/primary`);
  } catch (error) {
    console.error('Error while loading the camper image:', error);
    return null;
  }
}

export async function getAllCamperImagesById(camperId: string): Promise<CamperImage[]> {
  try {
    return await client.request<CamperImage[]>(`camper-images/${camperId}`);
  } catch (error) {
    console.error('error while loading the camper-images:', error);
    return [];
  }
}

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

