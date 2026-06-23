import type { Database } from "./supabase.ts";

export type Camper = Database["public"]["Tables"]["campers"]["Row"];

export type CamperInsert = Database["public"]["Tables"]["campers"]["Insert"];

export type CamperUpdate = Database["public"]["Tables"]["campers"]["Update"];

export type CamperImage = Database["public"]["Tables"]["camper_images"]["Row"];
