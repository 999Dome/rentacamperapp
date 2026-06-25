/* eslint-disable no-console */
import type { Addon } from "../types/interface.ts";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export async function getAllAddons(): Promise<Addon[]> {
  try {
    const url = new URL("addons/all", API_BASE_URL).toString();
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      console.error(`Fetch error ${response.status} for ${url}:`, text);
    }

    return await response.json();
  } catch (error) {
    console.error("Fehler beim Laden der Addons:", error);
    return [];
  }
}
