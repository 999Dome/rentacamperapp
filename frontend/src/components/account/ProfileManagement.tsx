import { createElement } from "../../utils/createElement.ts";
import { getMockProfile, saveMockProfile } from "../../utils/mockData.ts";
import type { MockUserProfile } from "../../utils/mockData.ts";

export function ProfileManagement() {
  const profile = getMockProfile();

  const container = (
    <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
      <h3 className="fw-bold mb-4 text-dark custom-font-base">Profil verwalten</h3>
      <div className="alert alert-success d-none mb-4" id="profile-success-alert">
        Profil erfolgreich aktualisiert!
      </div>
      <form onsubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label small text-uppercase text-muted fw-bold">Vorname</label>
            <input type="text" name="firstname" className="form-control" value={profile.firstname} required />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-uppercase text-muted fw-bold">Nachname</label>
            <input type="text" name="lastname" className="form-control" value={profile.lastname} required />
          </div>
          <div className="col-md-12">
            <label className="form-label small text-uppercase text-muted fw-bold">E-Mail Adresse</label>
            <input type="email" name="email" className="form-control" value={profile.email} required />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-uppercase text-muted fw-bold">Telefonnummer</label>
            <input type="tel" name="phone" className="form-control" value={profile.phone} />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-uppercase text-muted fw-bold">Führerscheinklasse</label>
            <select name="driver_license_class" className="form-select" required>
              <option value="B">Klasse B</option>
              <option value="B96">Klasse B96</option>
              <option value="BE">Klasse BE</option>
              <option value="C1">Klasse C1</option>
              <option value="C1E">Klasse C1E</option>
              <option value="C">Klasse C</option>
              <option value="CE">Klasse CE</option>
            </select>
          </div>
          <div className="col-12 mt-4 text-end">
            <button type="submit" className="btn btn-primary rounded-pill px-4">
              Änderungen speichern
            </button>
          </div>
        </div>
      </form>
    </div>
  ) as HTMLElement;

  const select = container.querySelector("select[name='driver_license_class']") as HTMLSelectElement;
  if (select) {
    select.value = profile.driver_license_class || "B";
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const updated: MockUserProfile = {
      firstname: (form.elements.namedItem("firstname") as HTMLInputElement).value,
      lastname: (form.elements.namedItem("lastname") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      driver_license_class: (form.elements.namedItem("driver_license_class") as HTMLSelectElement).value
    };

    saveMockProfile(updated);

    const alertBox = container.querySelector("#profile-success-alert") as HTMLElement;
    alertBox.classList.remove("d-none");
    setTimeout(() => {
      alertBox.classList.add("d-none");
    }, 3000);
  }

  return container;
}
