import { createElement } from "../../utils/createElement.ts";
import {
  AboutUsHero,
  LocationSection,
  OpeningHours,
  Staff,
  Impressum
} from "./AboutUsComponents.tsx";

import type { LocationResponse } from "../../infrastructure/api/location-api-client.ts";

export function AboutUsPage(locations: LocationResponse[]) {
  return (
    <div className="container py-5" style={{ minHeight: "80vh" }}>
      <AboutUsHero />
      <LocationSection locations={locations} />
      <OpeningHours />
      <Staff />
      <Impressum />
    </div>
  );
}
