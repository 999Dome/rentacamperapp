import { createElement } from "../../utils/createElement.ts";
import { getAllCampers } from "../../api/campersAPI.ts";
import { FilterBar } from "./FilterBar.tsx";
import { CamperCard } from "./CamperCard.tsx";
import { SkeletonCard } from "../common/SkeletonCard.tsx";
import type { MockCamper } from "../../utils/mockData.ts";
import { CamperFilterService } from "../../domain/services/camper-filter.service.ts";

export function RentPage() {
  let campersList: MockCamper[] = [];

  const container = (
    <div className="container-fluid py-5 px-3 px-md-5" style={{ backgroundColor: "#D1FEB8" }}>
      <header className="text-center mb-5">
        <h1 className="display-4 fw-bold custom-font-burbank text-custom-light-blue text-stroke-grey mb-2" style={{ letterSpacing: "2px" }}>
          Unsere Wohnmobile
        </h1>
        <p className="fs-5 text-muted">Finde deinen perfekten Begleiter für das nächste Abenteuer</p>
      </header>

      <div className="row">
        <aside className="col-12 col-lg-3 mb-4">
          <div id="filter-sidebar"></div>
        </aside>

        <main className="col-12 col-lg-9">
          <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white d-flex flex-row justify-content-between align-items-center flex-wrap gap-2">
            <span className="text-muted" id="results-count">
              {campersList.length} Fahrzeuge gefunden
            </span>
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="sortSelect" className="small text-uppercase text-muted fw-bold text-nowrap mb-0">Sortieren nach</label>
              <select id="sortSelect" className="form-select form-select-sm rounded-pill" style={{ width: "200px" }}>
                <option value="priceAsc">Preis: Aufsteigend</option>
                <option value="priceDesc">Preis: Absteigend</option>
                <option value="nameAsc">Name: A-Z</option>
                <option value="nameDesc">Name: Z-A</option>
              </select>
            </div>
          </div>

          <div className="row" id="camper-grid-container">
            {Array.from({ length: 6 }, () => SkeletonCard())}
          </div>
          <div className="text-center py-5 d-none" id="empty-state">
            <div className="fs-3 text-muted mb-3">Keine passenden Camper gefunden</div>
            <p className="text-muted">Passe deine Filter an, um andere Fahrzeuge zu sehen.</p>
          </div>
        </main>
      </div>
    </div>
  ) as HTMLElement;

  const updateCampersList = () => {
    const form = container.querySelector("form") as HTMLFormElement;
    if (!form) return;

    const query = ((form.elements.namedItem("searchQuery") as HTMLInputElement)?.value || "");
    const manufacturer = (form.elements.namedItem("manufacturer") as HTMLSelectElement)?.value;
    const fuelType = (form.elements.namedItem("fuelType") as HTMLSelectElement)?.value;
    const emissionsClass = (form.elements.namedItem("emissionsClass") as HTMLSelectElement)?.value;

    const priceMin = parseFloat((form.elements.namedItem("priceMin") as HTMLInputElement)?.value) || 0;
    const priceMax = parseFloat((form.elements.namedItem("priceMax") as HTMLInputElement)?.value) || Infinity;

    const bedsMin = parseInt((form.elements.namedItem("bedsMin") as HTMLInputElement)?.value) || 0;
    const bedsMax = parseInt((form.elements.namedItem("bedsMax") as HTMLInputElement)?.value) || Infinity;

    const heightMax = parseFloat((form.elements.namedItem("heightMax") as HTMLInputElement)?.value) || Infinity;
    const widthMax = parseFloat((form.elements.namedItem("widthMax") as HTMLInputElement)?.value) || Infinity;
    const weightMax = parseFloat((form.elements.namedItem("weightMax") as HTMLInputElement)?.value) || Infinity;

    const hasTowHitch = (form.elements.namedItem("hasTowHitch") as HTMLInputElement)?.checked;

    const checkboxes = form.querySelectorAll("input[name='features']:checked");
    const selectedFeatures = Array.from(checkboxes).map((cb) => (cb as HTMLInputElement).value);
    
    const providerType = (form.elements.namedItem("providerType") as HTMLSelectElement)?.value;
    const sortVal = (container.querySelector("#sortSelect") as HTMLSelectElement).value;

    const filtered = CamperFilterService.filterAndSort(campersList, {
      query,
      manufacturer,
      fuelType,
      emissionsClass,
      priceMin,
      priceMax,
      bedsMin,
      bedsMax,
      heightMax,
      widthMax,
      weightMax,
      hasTowHitch,
      selectedFeatures,
      providerType,
      sortVal,
    });

    const grid = container.querySelector("#camper-grid-container") as HTMLElement;
    const emptyState = container.querySelector("#empty-state") as HTMLElement;
    const resultsCount = container.querySelector("#results-count") as HTMLElement;

    grid.innerHTML = "";
    resultsCount.textContent = `${filtered.length} Fahrzeug${filtered.length === 1 ? "" : "e"} gefunden`;

    if (filtered.length === 0) {
      emptyState.classList.remove("d-none");
    } else {
      emptyState.classList.add("d-none");
      filtered.forEach((camper) => {
        const card = CamperCard(camper);
        card.classList.add("fade-in");
        grid.appendChild(card);
      });
    }
  };

  const filterSidebar = container.querySelector("#filter-sidebar") as HTMLElement;
  filterSidebar.appendChild(FilterBar({ onFilterChange: updateCampersList }));

  const sortSelect = container.querySelector("#sortSelect") as HTMLSelectElement;
  sortSelect.addEventListener("change", updateCampersList);

  const loadCampers = async () => {
    campersList = await getAllCampers();
    updateCampersList();
  };

  setTimeout(loadCampers, 0);

  return container;
}
