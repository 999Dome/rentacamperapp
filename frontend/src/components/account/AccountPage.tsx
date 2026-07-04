import { createElement } from "../../utils/createElement.ts";
import { logout, fetchCurrentUser } from "../../auth/auth.ts";
import { ProfileManagement } from "./ProfileManagement.tsx";
import { BookingsTable } from "./BookingsTable.tsx";
import { fetchProfile } from "../../api/profilesAPI.ts";

export function AccountPage() {
  const handleLogout = (e: Event) => {
    e.preventDefault();
    logout();
    window.location.reload();
  };

  const container = (
    <div className="container py-5" style={{ minHeight: "80vh" }}>
      <header className="mb-5 text-center">
        <h1 className="display-4 fw-bold custom-font-burbank text-white" style={{ letterSpacing: "2px" }}>
          Mein Konto
        </h1>
        <p className="fs-2 text-white-50">Willkommen zurück! Hier kannst du deine Buchungen einsehen und deine Profildaten pflegen.</p>
      </header>

      <div className="row g-4">
        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-beige">
            <div className="text-center mb-3 pb-3 border-bottom">
              <h4 className="fw-bold mb-1 text-dark custom-font-base" id="account-username">Kunde</h4>
              <span className="badge bg-custom-yellow text-dark rounded-pill px-3 py-1" id="account-role-badge">Kunde</span>
            </div>

            <div className="d-flex flex-column gap-1">
              <button
                type="button"
                className="btn btn-sm w-100 text-start px-3 py-2 fw-medium rounded-3 account-tab-btn active"
                id="btn-tab-profile"
                onclick={() => switchTab("profile")}
              >
                <i className="bi bi-person-gear me-2"></i>Profil bearbeiten
              </button>
              <button
                type="button"
                className="btn btn-sm w-100 text-start px-3 py-2 fw-medium rounded-3 account-tab-btn"
                id="btn-tab-bookings"
                onclick={() => switchTab("bookings")}
              >
                <i className="bi bi-calendar-check me-2"></i>Meine Buchungen
              </button>
              <hr className="my-2" />
              <button
                type="button"
                className="btn btn-sm btn-outline-danger rounded-3 w-100 text-start px-3 py-2 fw-medium"
                onclick={handleLogout}
              >
                <i className="bi bi-box-arrow-right me-2"></i>Abmelden
              </button>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-9">
          <div id="account-tab-profile-pane"></div>
          <div id="account-tab-bookings-pane" className="d-none"></div>
        </div>
      </div>
    </div>
  ) as HTMLElement;

  const refreshPanes = () => {
    const profilePane = container.querySelector("#account-tab-profile-pane") as HTMLElement;
    const bookingsPane = container.querySelector("#account-tab-bookings-pane") as HTMLElement;

    profilePane.innerHTML = "";
    bookingsPane.innerHTML = "";

    profilePane.appendChild(ProfileManagement());
    bookingsPane.appendChild(BookingsTable());
  };

  const switchTab = (tab: "profile" | "bookings") => {
    const btnProfile = container.querySelector("#btn-tab-profile") as HTMLButtonElement;
    const btnBookings = container.querySelector("#btn-tab-bookings") as HTMLButtonElement;
    const paneProfile = container.querySelector("#account-tab-profile-pane") as HTMLElement;
    const paneBookings = container.querySelector("#account-tab-bookings-pane") as HTMLElement;

    // Reset all tab buttons
    btnProfile.classList.remove("active");
    btnBookings.classList.remove("active");

    if (tab === "profile") {
      btnProfile.classList.add("active");
      paneProfile.classList.remove("d-none");
      paneProfile.classList.remove("fade-in");
      void (paneProfile as HTMLElement).offsetWidth; // trigger reflow
      paneProfile.classList.add("fade-in");
      paneBookings.classList.add("d-none");
    } else {
      btnBookings.classList.add("active");
      paneBookings.classList.remove("d-none");
      paneBookings.classList.remove("fade-in");
      void (paneBookings as HTMLElement).offsetWidth; // trigger reflow
      paneBookings.classList.add("fade-in");
      paneProfile.classList.add("d-none");
    }
  };

  const loadHeader = async () => {
    try {
      const user = await fetchCurrentUser();
      if (!user) return;
      const profile = await fetchProfile(user.id as string);
      
      const welcome = container.querySelector("header p") as HTMLElement;
      if (welcome) {
        welcome.textContent = `Willkommen zurück, ${profile.first_name || "Kunde"}! Hier kannst du deine Buchungen einsehen und deine Profildaten pflegen.`;
      }

      const fullname = container.querySelector("#account-username") as HTMLElement;
      if (fullname) {
        fullname.textContent = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Kunde";
      }
    } catch (err) {
      console.error(err);
    }
  };

  setTimeout(refreshPanes, 0);
  loadHeader();

  return container;
}
