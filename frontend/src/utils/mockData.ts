/**
 * Type used for mock/sample camper data (e.g. for local development, demos,
 * or tests) that doesn't come from the real Supabase database. It extends
 * the real `Camper` type with a few convenience fields that are normally
 * split across separate related tables (images, features, owner) so a
 * single flat mock object can be used instead of joining several tables.
 */
import type { Camper } from "../types/interface.ts";

/** A `Camper` enriched with denormalized fields, for use as mock/sample data. */
export interface MockCamper extends Camper {
  /** URL of the camper's main display image. */
  image_url: string;
  /** Human-readable names of the camper's features (flattened, instead of separate `CamperFeature` rows). */
  features_list: string[];
  /** Id of the camper's owner (flattened, instead of a separate `CamperOwner` row). */
  owner_id: string;
  /** Whether the camper's owner/listing has been blocked by an admin. */
  is_blocked?: boolean;
  /** Human-readable name of the required driver's license class. */
  license_name?: string;
}
