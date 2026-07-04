import { BaseAPIClient } from '../infrastructure/api/base-api-client';
import type { PricingRule } from "../types/interface.ts";

const client = new BaseAPIClient();

export async function getAllPricingRules(): Promise<PricingRule[]> {
  try {
    return await client.request<PricingRule[]>('pricing-rules/all');
  } catch (error) {
    console.error('Error while loading the pricing rules:', error);
    return [];
  }
}
