import type { PricingRule } from "../types/interface.ts";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export async function getAllPricingRules(): Promise<PricingRule[]> {
  try {
    const url = new URL("pricing-rules/all", API_BASE_URL).toString();
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      console.error(`Fetch error ${response.status} for ${url}:`, text);
    }

    return await response.json();
  } catch (error) {
    console.error("Error while loading the pricing rules:", error);
    return [];
  }
}
