export interface Location {
  id: string;
  name?: string; // fallback if not in DB
  street: string;
  housenumber?: number; // from DB
  plz?: number; // from DB
  city: string;
  latitude?: number;
  longitude?: number;
}
