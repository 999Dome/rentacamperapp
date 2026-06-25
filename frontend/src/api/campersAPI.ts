/* eslint-disable no-console */
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

export async function getCamperById(id: string): Promise<Camper> {
  try {
    const url = new URL(`campers/${id}`, API_BASE_URL).toString();
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      console.error(`Fetch error ${response.status} for ${url}:`, text);
      throw new Error(`Fehler beim Laden des Campers: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fehler beim Laden des Campers:", error);
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
      throw new Error(`Fehler bei der Preisberechnung: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fehler bei der Preisberechnung:", error);
    throw error;
  }
}
