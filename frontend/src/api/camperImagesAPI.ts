import type { CamperImage } from "../types/interface.ts";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export async function getHighlightCamperImages(): Promise<CamperImage[]> {
  try {
    const url = new URL("camper-images/highlights", API_BASE_URL).toString();
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      console.error(`Fetch error ${response.status} for ${url}:`, text);
    }

    return await response.json();
  } catch (error) {
    console.error("Error while fetching highlight camper images:", error);
    return [];
  }
}

export async function getCamperPrimaryImageById(camperId: string): Promise<CamperImage> {
  try {
    const url = new URL(`camper-images/${camperId}/primary`, API_BASE_URL).toString();
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      console.error(`Fetch error ${response.status} for ${url}:`, text);
    }

    return await response.json();
  } catch (error) {
    console.error("Error while loading the camper image:", error);
    throw error;
  }
}

export async function getAllCamperImagesById(camperId: string): Promise<CamperImage[]> {
    try {
    const url = new URL(`camper-images/${camperId}`, API_BASE_URL).toString();
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      console.error(`Fetch error ${response.status} for ${url}:`, text);
    }

    return await response.json();
  } catch (error) {
    console.error("error while loading the camper-images:", error);
    throw error;
  }
}

