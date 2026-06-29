import { createElement } from "../../utils/createElement.ts";
import {
  AboutUsHero,
  Location,
  OpeningHours,
  Staff,
  Impressum
} from "./AboutUsComponents.tsx";

export function AboutUsPage() {
  return (
    <div className="container py-5" style={{ minHeight: "80vh" }}>
      <AboutUsHero />
      <Location />
      <OpeningHours />
      <Staff />
      <Impressum />
    </div>
  );
}
