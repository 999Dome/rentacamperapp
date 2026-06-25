/* eslint-disable no-console */
import type { DriversLicense } from "../types/interface.ts";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export async function getDriversLicenseById(id: string): Promise<DriversLicense> {
  try {
    const url = new URL(`drivers-license/${id}`, API_BASE_URL).toString();
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      console.error(`Fetch error ${response.status} for ${url}:`, text);
      return null as unknown as DriversLicense;
    }

    return await response.json();
  } catch (error) {
    console.error("Fehler beim Laden des Führerscheins:", error);
    return null as unknown as DriversLicense;
  }
}
