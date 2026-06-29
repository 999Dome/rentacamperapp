import type { Camper } from "../types/interface.ts";
import { getMockCampers } from "../utils/mockData.ts";
import { getCamperPrimaryImageById } from "./camperImagesAPI.ts";
import { getCamperFeaturesByCamperId } from "./camperFeaturesAPI.ts";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export async function getHighlightCampers(): Promise<Camper[]> {
  try {
    const url = new URL("campers/highlights", API_BASE_URL).toString();
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      console.error(`Fetch error ${response.status} for ${url}:`, text);
    }

    return await response.json();
  } catch (error) {
    console.error("Error while loading the highlight campers:", error);
    return [];
  }
}

export async function getCamperById(id: string): Promise<Camper> {
  try {
    const url = new URL(`campers/${id}`, API_BASE_URL).toString();
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      console.error(`Fetch error ${response.status} for ${url}:`, text);
    }

    return await response.json();
  } catch (error) {
    console.error("Error while loading the camper:", error);
    throw error;
  }
}
export async function calculatePrice(camperId: string, startDate: string, endDate: string, selectedAddonIds: string[]): Promise<unknown> {
  try {
    const url = new URL(`campers/calculate-price`, API_BASE_URL).toString();
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ camperId, startDate, endDate, selectedAddonIds })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Fetch error ${response.status} for ${url}:`, text);
    }

    return await response.json();
  } catch (error) {
    console.error("Error while calculating the price:", error);
    throw error;
  }
}

export async function getAllCampers(): Promise<Camper[]> {
  try {
    const url = new URL("campers/all", API_BASE_URL).toString();
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Fetch error: ${response.status}`);
    }
    const campers = await response.json();
    if (Array.isArray(campers) && campers.length > 0) {
      const mapped = await Promise.all(
        campers.map(async (c: any) => {
          let image_url = "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7";
          let features_list: string[] = [];
          try {
            const primaryImg = await getCamperPrimaryImageById(c.id);
            if (primaryImg && primaryImg.image_path) {
              image_url = primaryImg.image_path;
            }
          } catch (err) {
          }
          try {
            const feats = await getCamperFeaturesByCamperId(c.id);
            features_list = feats.map((f: any) => f.features?.name).filter(Boolean);
          } catch (err) {
          }
          if (features_list.length === 0) {
            features_list = ["Küche", "Heizung", "Klimaanlage"];
          }
          return {
            ...c,
            image_url,
            features_list
          };
        })
      );
      return mapped;
    }
    return getMockCampers();
  } catch (error) {
    console.error("Error while fetching all campers from backend:", error);
    return getMockCampers();
  }
}
