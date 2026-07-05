import { createElement } from "../../utils/createElement.ts";
import { CamperCRUD } from "./CamperCRUD.tsx";
import { ProviderDashboard } from "./ProviderDashboard.tsx";
import { ProviderOnboarding } from "./ProviderOnboarding.tsx";
import { getUserIdFromToken } from "../../auth/auth.ts";
import { fetchProfile } from "../../api/profilesAPI.ts";

/**
 * Renders the "Vermieter-Portal" (provider portal) page. It first checks
 * whether the logged-in user is already a registered provider: if not, it
 * shows the `ProviderOnboarding` flow; once they are (or right after
 * onboarding succeeds), it shows the provider dashboard with two tabs
 * ("Dashboard & Anfragen" and "Fahrzeug-Verwaltung") switched imperatively
 * via `switchTab`, since there is no reactive state system in this app.
 *
 * @returns The page's root element.
 */
export function RentoutPage() {
  const container = (
    <div className="container py-5 min-vh-80">
      <div id="rentout-loading" className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
      <div id="rentout-content" className="d-none">
        <header className="mb-5 text-center">
          <h1 className="display-4 fw-bold custom-font-burbank text-white letter-spacing-2">
            Vermieter-Portal
          </h1>
          <p className="fs-5 text-white-50">Verwalte deine Inserate, checke Buchungsraten und beantworte Anfragen</p>
        </header>

        <div className="d-flex justify-content-center mb-5">
          <div className="d-inline-flex bg-white rounded-pill p-1 shadow-sm border border-secondary-subtle">
            <button
              type="button"
              className="btn rounded-pill px-4 py-2 btn-primary fw-medium text-white"
              id="tab-btn-dashboard"
              onclick={() => switchTab("dashboard")}
            >
              Dashboard &amp; Anfragen
            </button>
            <button
              type="button"
              className="btn rounded-pill px-4 py-2 fw-medium rentout-tab-btn-inactive"
              id="tab-btn-crud"
              onclick={() => switchTab("crud")}
            >
              Fahrzeug-Verwaltung
            </button>
          </div>
        </div>

        <div id="rentout-dashboard-pane"></div>
        <div id="rentout-crud-pane" className="d-none"></div>
      </div>
      <div id="rentout-onboarding-container"></div>
    </div>
  ) as HTMLElement;

  const init = async () => {
    const userId = getUserIdFromToken();
    if (!userId) {
      window.location.hash = "#/login";
      return;
    }

    try {
      const profile = await fetchProfile(userId);
      const loading = container.querySelector("#rentout-loading") as HTMLElement;
      loading.classList.add("d-none");

      if (profile.is_provider) {
        showDashboard(userId);
      } else {
        showOnboarding(userId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const showOnboarding = (userId: string) => {
    const onboardingContainer = container.querySelector("#rentout-onboarding-container") as HTMLElement;
    onboardingContainer.innerHTML = "";
    onboardingContainer.appendChild(ProviderOnboarding({
      userId,
      onSuccess: () => {
        onboardingContainer.innerHTML = "";
        showDashboard(userId);
      }
    }));
  };

  const showDashboard = (ownerId: string) => {
    const content = container.querySelector("#rentout-content") as HTMLElement;
    content.classList.remove("d-none");
    refreshComponents(ownerId);
  };

  const refreshComponents = (ownerId: string) => {
    const dashboardPane = container.querySelector("#rentout-dashboard-pane") as HTMLElement;
    const crudPane = container.querySelector("#rentout-crud-pane") as HTMLElement;

    dashboardPane.innerHTML = "";
    crudPane.innerHTML = "";

    dashboardPane.appendChild(
      ProviderDashboard({
        ownerId,
        onDataChanged: () => refreshComponents(ownerId)
      })
    );

    crudPane.appendChild(
      CamperCRUD({
        ownerId,
        onDataChanged: () => refreshComponents(ownerId)
      })
    );
  };

  const switchTab = (tab: "dashboard" | "crud") => {
    const btnDashboard = container.querySelector("#tab-btn-dashboard") as HTMLButtonElement;
    const btnCrud = container.querySelector("#tab-btn-crud") as HTMLButtonElement;
    const paneDashboard = container.querySelector("#rentout-dashboard-pane") as HTMLElement;
    const paneCrud = container.querySelector("#rentout-crud-pane") as HTMLElement;

    if (!btnDashboard || !btnCrud) return;

    if (tab === "dashboard") {
      btnDashboard.className = "btn rounded-pill px-4 py-2 btn-primary fw-medium text-white";
      btnCrud.className = "btn rounded-pill px-4 py-2 fw-medium rentout-tab-btn-inactive";

      paneDashboard.classList.remove("d-none");
      paneCrud.classList.add("d-none");
    } else {
      btnCrud.className = "btn rounded-pill px-4 py-2 btn-primary fw-medium text-white";
      btnDashboard.className = "btn rounded-pill px-4 py-2 fw-medium rentout-tab-btn-inactive";

      paneCrud.classList.remove("d-none");
      paneDashboard.classList.add("d-none");
    }
  };

  setTimeout(init, 0);

  return container;
}
