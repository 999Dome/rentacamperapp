/**
 * Hand-written, app-facing type definitions that build on top of the
 * auto-generated Supabase database types (see `types/supabase.ts`).
 *
 * The raw `Database["public"]["Tables"][...]["Row"/"Insert"/"Update"]` types
 * describe exactly what's stored in the database. This file re-exports them
 * under shorter, friendlier names, and extends a few of them with extra
 * fields that only exist on the frontend (e.g. `Camper.providerType`).
 */
import type { Database } from "./supabase.ts";

/** Raw shape of a `campers` row exactly as stored in the database. */
export type DatabaseCamper = Database["public"]["Tables"]["campers"]["Row"];

/**
 * A camper as used throughout the frontend. Extends the raw database row
 * with a couple of fields the UI needs but the database doesn't store
 * directly.
 */
export interface Camper extends DatabaseCamper {
  /** Whether the camper is offered by the platform itself ("original") or by a private owner ("privat"). */
  providerType?: 'original' | 'privat';
  /** Id of the owner who listed the camper, if it's a privately-owned camper. */
  ownerId?: string;
}

/** Shape required to insert a new `campers` row. */
export type CamperInsert = Database["public"]["Tables"]["campers"]["Insert"];

/** Shape accepted when updating an existing `campers` row (all fields optional). */
export type CamperUpdate = Database["public"]["Tables"]["campers"]["Update"];

/** A single image belonging to a camper. */
export type CamperImage = Database["public"]["Tables"]["camper_images"]["Row"];

/** A single feature (e.g. "air conditioning") attached to a camper. */
export type CamperFeature =
  Database["public"]["Tables"]["camper_features"]["Row"];

/** An optional extra (e.g. bike rack, extra bedding) that can be booked with a camper. */
export type Addon = Database["public"]["Tables"]["addons"]["Row"];

/** A pricing rule used to calculate the rental price of a camper (e.g. seasonal surcharges). */
export type PricingRule = Database["public"]["Tables"]["pricing_rules"]["Row"];

/** A driver's license class/entry as stored in the database. */
export type DriversLicense = Database["public"]["Tables"]["drivers_license"]["Row"];

/** Association between a camper and its owner. */
export type CamperOwner = Database["public"]["Tables"]["camper_owner"]["Row"];
/** Shape required to insert a new `camper_owner` row. */
export type CamperOwnerInsert = Database["public"]["Tables"]["camper_owner"]["Insert"];
