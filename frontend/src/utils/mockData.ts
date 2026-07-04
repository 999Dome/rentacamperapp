import type { Camper } from "../types/interface.ts";

export interface MockCamper extends Camper {
  image_url: string;
  features_list: string[];
  owner_id: string;
  is_blocked?: boolean;
  license_name?: string;
}
