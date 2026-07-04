import { createElement } from "../../utils/createElement.ts";
import { fetchCurrentUser } from "../../auth/auth.ts";
import { fetchProfile, updateProfile } from "../../api/profilesAPI.ts";

export function ProfileManagement() {
  const container = (
    <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-beige">
      <h3 className="fw-bold mb-4 text-dark custom-font-base">Profil verwalten</h3>
      <div className="alert alert-success d-none mb-4" id="profile-success-alert">
        Profil erfolgreich aktualisiert!
      </div>
      <form onsubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label small text-uppercase text-muted fw-bold">Vorname</label>
            <input type="text" name="firstname" className="form-control" required />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-uppercase text-muted fw-bold">Nachname</label>
            <input type="text" name="lastname" className="form-control" required />
          </div>
          <div className="col-md-12">
            <label className="form-label small text-uppercase text-muted fw-bold">E-Mail Adresse</label>
            <input type="email" name="email" className="form-control" disabled />
          </div>
          <div className="col-md-12">
            <label className="form-label small text-uppercase text-muted fw-bold">Führerscheinklasse</label>
            <select name="driver_license_class" className="form-select" required>
              <option value="Klasse B">Klasse B</option>
              <option value="Klasse B96">Klasse B96</option>
              <option value="Klasse BE">Klasse BE</option>
              <option value="Klasse C1">Klasse C1</option>
              <option value="Klasse C1E">Klasse C1E</option>
              <option value="Klasse C">Klasse C</option>
              <option value="Klasse CE">Klasse CE</option>
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

  const loadProfile = async () => {
    try {
      const user = await fetchCurrentUser();
      if (!user) return;
      
      const emailInput = container.querySelector("input[name='email']") as HTMLInputElement;
      if (emailInput) emailInput.value = (user.email as string) || "";

      const profile = await fetchProfile(user.id as string);
      
      const fnInput = container.querySelector("input[name='firstname']") as HTMLInputElement;
      if (fnInput) fnInput.value = profile.first_name || "";

      const lnInput = container.querySelector("input[name='lastname']") as HTMLInputElement;
      if (lnInput) lnInput.value = profile.last_name || "";

      const select = container.querySelector("select[name='driver_license_class']") as HTMLSelectElement;
      if (select) {
        select.value = profile.drivers_license_class || "Klasse B";
      }
    } catch (err) {
      console.error(err);
    }
  };

  async function handleSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Wird gespeichert...';

    try {
      const user = await fetchCurrentUser();
      if (!user) return;

      const first_name = (form.elements.namedItem("firstname") as HTMLInputElement).value;
      const last_name = (form.elements.namedItem("lastname") as HTMLInputElement).value;
      const drivers_license_class = (form.elements.namedItem("driver_license_class") as HTMLSelectElement).value;

      await updateProfile(user.id as string, {
        first_name,
        last_name,
        drivers_license_class,
      });

      const alertBox = container.querySelector("#profile-success-alert") as HTMLElement;
      alertBox.classList.remove("d-none");
      setTimeout(() => {
        alertBox.classList.add("d-none");
      }, 3000);
    } catch (err) {
      console.error(err);
      alert("Fehler beim Speichern des Profils.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  }

  loadProfile();

  return container;
}
