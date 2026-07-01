import type { Database } from "./supabase.ts";

export type DatabaseCamper = Database["public"]["Tables"]["campers"]["Row"];
export interface Camper extends DatabaseCamper {
  providerType?: 'original' | 'privat';
  ownerId?: string;
}

export type CamperInsert = Database["public"]["Tables"]["campers"]["Insert"];

export type CamperUpdate = Database["public"]["Tables"]["campers"]["Update"];

export type CamperImage = Database["public"]["Tables"]["camper_images"]["Row"];

export type CamperFeature =
  Database["public"]["Tables"]["camper_features"]["Row"];

export type Addon = Database["public"]["Tables"]["addons"]["Row"];

export type PricingRule = Database["public"]["Tables"]["pricing_rules"]["Row"];

export type DriversLicense = Database["public"]["Tables"]["drivers_license"]["Row"];

export type CamperOwner = Database["public"]["Tables"]["camper_owner"]["Row"];
export type CamperOwnerInsert = Database["public"]["Tables"]["camper_owner"]["Insert"];
