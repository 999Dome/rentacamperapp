import { BaseAPIClient } from '../infrastructure/api/base-api-client';
import type { Addon } from "../types/interface.ts";

const client = new BaseAPIClient();

export async function getAllAddons(): Promise<Addon[]> {
  try {
    return await client.request<Addon[]>('addons/all');
  } catch (error) {
    console.error('Error while loading the addons:', error);
    return [];
  }
}
