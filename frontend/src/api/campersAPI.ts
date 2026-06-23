import type { Camper } from "../types/interface.ts";

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
    console.error("Fehler beim Laden der Camper Highlights:", error);
    return [];
  }
}
