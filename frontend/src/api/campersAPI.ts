import type { Camper } from "../types/interface.ts";
import type { MockCamper } from "../utils/mockData.ts";
import { getCamperPrimaryImageById } from "./camperImagesAPI.ts";
import { getCamperFeaturesByCamperId } from "./camperFeaturesAPI.ts";
import { getDriversLicenseById } from "./driversLicenseAPI.ts";

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

export async function getAllCampers(): Promise<MockCamper[]> {
  try {
    const url = new URL("campers/all", API_BASE_URL).toString();
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Fetch error: ${response.status}`);
    }
    const campers = await response.json();
    if (Array.isArray(campers) && campers.length > 0) {
      const mapped = await Promise.all(
        campers.map(async (c: Camper) => {
          let image_url = "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7";
          let features_list: string[] = [];
          let license_name = "B";
          try {
            const primaryImg = await getCamperPrimaryImageById(c.id);
            if (primaryImg && primaryImg.image_path) {
              image_url = primaryImg.image_path;
            }
          } catch (err) {
            console.warn("Failed to load primary image for camper", c.id, err);
          }
          try {
            const feats = (await getCamperFeaturesByCamperId(c.id)) as unknown as { features?: { name: string } | null }[];
            features_list = feats.map((f) => f.features?.name).filter((name): name is string => typeof name === "string");
          } catch (err) {
            console.warn("Failed to load features for camper", c.id, err);
          }
          if (c.required_license) {
            try {
              const lic = await getDriversLicenseById(c.required_license);
              if (lic && lic.class) {
                license_name = lic.class;
              }
            } catch (err) {
              console.warn("Failed to load drivers license for camper", c.id, err);
            }
          }
          if (features_list.length === 0) {
            features_list = ["Küche", "Heizung", "Klimaanlage"];
          }
          return {
            ...c,
            image_url,
            features_list,
            owner_id: "user-1",
            license_name,
          };
        })
      );
      return mapped;
    }
    return [];
  } catch (error) {
    console.error("Error while fetching all campers from backend:", error);
    return [];
  }
}

export async function createCamper(
  data: Partial<MockCamper>,
): Promise<MockCamper> {
  const url = new URL("campers/create", API_BASE_URL).toString();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to create camper");
  }
  return await response.json();
}

export async function updateCamper(
  id: string,
  data: Partial<MockCamper>,
): Promise<MockCamper> {
  const url = new URL(`campers/${id}`, API_BASE_URL).toString();
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update camper");
  }
  return await response.json();
}

export async function deleteCamper(id: string): Promise<unknown> {
  const url = new URL(`campers/${id}`, API_BASE_URL).toString();
  const response = await fetch(url, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete camper");
  }
  return await response.json();
}
