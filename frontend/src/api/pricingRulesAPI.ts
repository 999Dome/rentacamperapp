/**
 * API functions for fetching pricing rules (e.g. seasonal or duration-based
 * price adjustments) used when calculating a camper's rental price.
 */

import { BaseAPIClient } from '../infrastructure/api/base-api-client';
import type { PricingRule } from "../types/interface.ts";

const client = new BaseAPIClient();

/**
 * Fetches all pricing rules from the backend.
 *
 * @returns All pricing rules, or an empty array if the request fails.
 */
export async function getAllPricingRules(): Promise<PricingRule[]> {
  try {
    return await client.request<PricingRule[]>('pricing-rules/all');
  } catch (error) {
    console.error('Error while loading the pricing rules:', error);
    return [];
  }
}
