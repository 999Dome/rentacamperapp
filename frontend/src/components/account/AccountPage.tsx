import { createElement } from "../../utils/createElement.ts";
import { logout } from "../../auth/auth.ts";
import { ProfileManagement } from "./ProfileManagement.tsx";
import { BookingsTable } from "./BookingsTable.tsx";
import { getMockProfile } from "../../utils/mockData.ts";

export function AccountPage() {
  const profile = getMockProfile();

  const handleLogout = (e: Event) => {
    e.preventDefault();
    logout();
    window.location.reload();
  };

  const container = (
    <div className="container py-5" style={{ minHeight: "80vh" }}>
      <header className="mb-5 text-center">
        <h1 className="display-4 fw-bold custom-font-burbank text-custom-light-blue text-stroke-grey mb-2" style={{ letterSpacing: "2px" }}>
          Mein Konto
        </h1>
        <p className="fs-5 text-muted">Willkommen zurück, {profile.firstname}! Hier kannst du deine Buchungen einsehen und deine Profildaten pflegen.</p>
      </header>

      <div className="row g-4">
        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
            <div className="text-center mb-4 border-bottom pb-3">
              <div
                className="rounded-circle bg-custom-light-blue text-white d-flex align-items-center justify-content-center mx-auto mb-3 fw-bold"
                style={{ width: "80px", height: "80px", fontSize: "32px" }}
              >
                {profile.firstname.charAt(0) || "U"}
              </div>
              <h4 className="fw-bold mb-1 text-dark">{profile.firstname} {profile.lastname}</h4>
              <span className="badge bg-secondary-subtle text-secondary rounded-pill px-3 py-1">Kunde</span>
            </div>

            <div className="d-flex flex-column gap-2">
              <button
                type="button"
                className="btn btn-primary rounded-pill w-100 text-start px-3 py-2 fw-medium"
                id="btn-tab-profile"
                onclick={() => switchTab("profile")}
              >
                Profil bearbeiten
              </button>
              <button
                type="button"
                className="btn btn-light rounded-pill w-100 text-start px-3 py-2 text-secondary fw-medium"
                id="btn-tab-bookings"
                onclick={() => switchTab("bookings")}
                style={{ backgroundColor: "transparent", border: "none" }}
              >
                Meine Buchungen
              </button>
              <hr />
              <button
                type="button"
                className="btn btn-outline-danger rounded-pill w-100 text-start px-3 py-2 fw-medium"
                onclick={handleLogout}
              >
                Abmelden
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

    if (tab === "profile") {
      btnProfile.className = "btn btn-primary rounded-pill w-100 text-start px-3 py-2 fw-medium";
      btnBookings.className = "btn btn-light rounded-pill w-100 text-start px-3 py-2 text-secondary fw-medium";
      btnBookings.style.backgroundColor = "transparent";
      btnBookings.style.border = "none";
      paneProfile.classList.remove("d-none");
      paneBookings.classList.add("d-none");
    } else {
      btnBookings.className = "btn btn-primary rounded-pill w-100 text-start px-3 py-2 fw-medium";
      btnProfile.className = "btn btn-light rounded-pill w-100 text-start px-3 py-2 text-secondary fw-medium";
      btnProfile.style.backgroundColor = "transparent";
      btnProfile.style.border = "none";
      paneBookings.classList.remove("d-none");
      paneProfile.classList.add("d-none");
    }
  };

  setTimeout(refreshPanes, 0);

  return container;
}
