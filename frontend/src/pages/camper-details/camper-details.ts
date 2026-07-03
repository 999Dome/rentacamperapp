import "bootstrap/dist/css/bootstrap.min.css";
import "../../scss/camper-details-v2.scss";

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

async function renderCamperDetails() {
  const pathParts = window.location.pathname.split('/');
  const urlParams = new URLSearchParams(window.location.search);
  let camperId = urlParams.get("id");

  if (!camperId && pathParts.includes("campers")) {
    camperId = pathParts[pathParts.indexOf("campers") + 1];
  }

  document.body.appendChild(MainHeader());

  if (!camperId) {
    const errorDiv = document.createElement("div");
    errorDiv.innerHTML = "<h2 style='text-align: center; margin: 50px;'>Keine Camper-ID angegeben</h2>";
    document.body.appendChild(errorDiv);
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

    const mainContainer = document.createElement("main");
    mainContainer.className = "container camper-details-v2-container my-5";

    mainContainer.appendChild(ImageGallery(image));

    const contentLayout = document.createElement("div");
    contentLayout.className = "row g-4 mt-4 mb-5";

    contentLayout.appendChild(CamperInfo(camper, features, license));
    contentLayout.appendChild(BookingCard(camper, addons, pricingRules, locations));

    mainContainer.appendChild(contentLayout);
    document.body.appendChild(mainContainer);

  } catch (error) {
    const errorDiv = document.createElement("div");
    errorDiv.innerHTML = `<h2 style='text-align: center; margin: 50px;'>Fehler beim Laden: ${error instanceof Error ? error.message : 'Unbekannt'}</h2>`;
    document.body.appendChild(errorDiv);
  }

  document.body.appendChild(MainFooter());
}

renderCamperDetails();
