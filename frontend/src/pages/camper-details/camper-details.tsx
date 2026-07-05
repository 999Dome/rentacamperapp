import "bootstrap/dist/css/bootstrap.min.css";
import "../../scss/theme.scss";
import { createElement } from "../../utils/createElement.ts";

import { MainHeader } from "../../components/mainheader.tsx";
import { MainFooter } from "../../components/mainfooter.tsx";

import { CampersAPIClient } from '../../infrastructure/api/camper-api-client';
import { getAllCamperImagesById } from "../../api/camperImagesAPI.ts";
import { getCamperFeaturesByCamperId } from "../../api/camperFeaturesAPI.ts";
import { getAllAddons } from "../../api/addonsAPI.ts";
import { getAllPricingRules } from "../../api/pricingRulesAPI.ts";
import { getDriversLicenseById } from "../../api/driversLicenseAPI.ts";

import { ImageGallery } from "../../components/camper-details/ImageGallery.tsx";
import { CamperInfo } from "../../components/camper-details/CamperInfo.tsx";
import { BookingCard } from "../../components/camper-details/BookingCard.tsx";

/**
 * Bootstrap entry point for the camper-details MPA page. Reads the camper id
 * from either the `id` query param or the `/campers/:id` path segment, loads
 * all data needed to render the page in parallel, and mounts the page into
 * `document.body`.
 */
async function renderCamperDetails() {
  const pathParts = window.location.pathname.split('/');
  const urlParams = new URLSearchParams(window.location.search);
  let camperId = urlParams.get("id");

  if (!camperId && pathParts.includes("campers")) {
    camperId = pathParts[pathParts.indexOf("campers") + 1];
  }

  document.body.appendChild(MainHeader());

  if (!camperId) {
    document.body.appendChild(<h2 className="error-message-block">Keine Camper-ID angegeben</h2>);
    document.body.appendChild(MainFooter());
    return;
  }

  try {
    const campersClient = new CampersAPIClient();

    const [camper, image, features, addons, pricingRules, locations] = await Promise.all([
      campersClient.getCamperById(camperId),
      getAllCamperImagesById(camperId),
      getCamperFeaturesByCamperId(camperId),
      getAllAddons(),
      getAllPricingRules(),
      import('../../api/locationsAPI.ts').then(m => m.getAllLocations())
    ]);

    const licenseRaw = await getDriversLicenseById(camper.required_license);
    const license = licenseRaw || {
      id: camper.required_license,
      created_at: new Date().toISOString(),
      class: "Klasse B" as const,
      value: 100,
      max_vehicle_wieght: 3500,
      max_trailer_weight: 750,
      total_weight: 3500
    };

    document.body.appendChild(
      <main className="container camper-details-v2-container my-5">
        {ImageGallery(image)}
        <div className="row g-4 mt-4 mb-5">
          {CamperInfo(camper, features, license)}
          {BookingCard(camper, addons, pricingRules, locations)}
        </div>
      </main>
    );

  } catch (error) {
    document.body.appendChild(
      <h2 className="error-message-block">
        Fehler beim Laden: {error instanceof Error ? error.message : 'Unbekannt'}
      </h2>
    );
  }

  document.body.appendChild(MainFooter());
}

renderCamperDetails();
