/**
 * A pickup/return station where a camper can be collected or dropped off.
 *
 * Some fields are optional because the underlying DB table does not guarantee
 * them for every row; the comments note which come straight from the DB and
 * which are computed fallbacks used by the UI.
 */
export interface Location {
  id: string;
  /** Display name; falls back to `"<city> Station"` when absent in the DB. */
  name?: string;
  street: string;
  /** House number as stored in the DB. */
  housenumber?: number;
  /** Postal code (German "Postleitzahl") as stored in the DB. */
  plz?: number;
  city: string;
  latitude?: number;
  longitude?: number;
}
