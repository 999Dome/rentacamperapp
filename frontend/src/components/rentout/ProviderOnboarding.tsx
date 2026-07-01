import { createElement } from "../../utils/createElement.ts";
import { updateProfile } from "../../api/profilesAPI.ts";

interface ProviderOnboardingProps {
  userId: string;
  onSuccess: () => void;
}

export function ProviderOnboarding({ userId, onSuccess }: ProviderOnboardingProps) {
  let isChecked = false;

  const handleCheckboxChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    isChecked = target.checked;
    
    const btn = container.querySelector("#btn-register-provider") as HTMLButtonElement;
    if (btn) {
      btn.disabled = !isChecked;
    }
  };

  const handleRegister = async () => {
    if (!isChecked) return;
    try {
      const btn = container.querySelector("#btn-register-provider") as HTMLButtonElement;
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Wird registriert...';
      
      await updateProfile(userId, { is_provider: true });
      onSuccess();
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Fehler bei der Registrierung als Vermieter. Bitte versuche es erneut.");
      const btn = container.querySelector("#btn-register-provider") as HTMLButtonElement;
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Jetzt als Vermieter registrieren';
      }
    }
  };

  const container = (
    <div className="container py-5" style={{ maxWidth: "600px" }}>
      <div className="card border-0 shadow-lg rounded-4 p-4 p-md-5">
        <div className="text-center mb-4">
          <i className="bi bi-shop fs-1 text-custom-light-blue mb-3"></i>
          <h2 className="fw-bold custom-font-base text-dark">Als Vermieter registrieren und Camper inserieren</h2>
        </div>
        
        <p className="text-muted fs-5 text-center mb-4">
          Werde Teil unserer Vermieter-Community! Durch das Vermieten deines Campers kannst du deine Unterhaltskosten senken und anderen Menschen unvergessliche Urlaubserlebnisse ermöglichen.
        </p>

        <div className="form-check mb-4 bg-light p-3 rounded-3">
          <input 
            className="form-check-input ms-1 me-2" 
            type="checkbox" 
            id="termsCheckbox" 
            onchange={handleCheckboxChange} 
          />
          <label className="form-check-label fs-6 text-dark" htmlFor="termsCheckbox">
            Ich akzeptiere die <a href="/assets/docs/vermieterbedingungen.pdf" target="_blank" className="text-primary text-decoration-none fw-medium">Vermieterbedingungen</a>.
          </label>
        </div>

        <button 
          id="btn-register-provider" 
          className="btn btn-primary w-100 py-3 rounded-pill fw-bold fs-5 shadow-sm"
          disabled={true}
          onclick={handleRegister}
        >
          Jetzt als Vermieter registrieren
        </button>
      </div>
    </div>
  ) as HTMLElement;

  return container;
}
