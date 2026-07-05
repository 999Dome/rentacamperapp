import { createElement } from "../../utils/createElement.ts";
import {
  AboutUsHero,
  LocationSection,
  OpeningHours,
  Staff,
  Impressum
} from "./AboutUsComponents.tsx";

import type { LocationResponse } from "../../infrastructure/api/location-api-client.ts";

/**
 * Assembles the full About Us page out of its sections: hero, station
 * locations, opening hours, staff, and legal notice.
 *
 * @param locations The rental locations to display in {@link LocationSection}.
 */
export function AboutUsPage(locations: LocationResponse[]) {
  return (
    <div className="container py-5 min-vh-80">
      <AboutUsHero />
      <LocationSection locations={locations} />
      <OpeningHours />
      <Staff />
      <Impressum />
    </div>
  );
}
