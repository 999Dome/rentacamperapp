export function setupAuthLogic(page: HTMLElement) {
  const track = page.querySelector(".auth-slider-track") as HTMLElement;
  const loginForm = page.querySelector(".login-form") as HTMLFormElement;
  const registerForm = page.querySelector(".register-form") as HTMLFormElement;

  const pillLogin = page.querySelector("#pill-login") as HTMLButtonElement;
  const pillRegister = page.querySelector(
    "#pill-register",
  ) as HTMLButtonElement;

  const forgotPwLink = page.querySelector(
    ".forgot-password-link",
  ) as HTMLAnchorElement;

  const loginErrorBox = page.querySelector(".login-error") as HTMLElement;
  const registerErrorBox = page.querySelector(".register-error") as HTMLElement;

  const showLoginError = (msg: string | null) => {
    if (msg) {
      loginErrorBox.textContent = msg;
      loginErrorBox.classList.remove("d-none");
    } else {
      loginErrorBox.classList.add("d-none");
      loginErrorBox.textContent = "";
    }
  };

  const showRegisterError = (msg: string | null) => {
    if (msg) {
      registerErrorBox.textContent = msg;
      registerErrorBox.classList.remove("d-none");
    } else {
      registerErrorBox.classList.add("d-none");
      registerErrorBox.textContent = "";
    }
  };

  pillRegister.addEventListener("click", (e) => {
    e.preventDefault();
    track.classList.add("show-register");

    pillRegister.classList.add("active-pill");
    pillRegister.classList.remove("text-white-50");

    pillLogin.classList.remove("active-pill");
    pillLogin.classList.add("text-white-50");

    showLoginError(null);
    showRegisterError(null);
  });

  pillLogin.addEventListener("click", (e) => {
    e.preventDefault();
    track.classList.remove("show-register");

    
    pillLogin.classList.add("active-pill");
    pillLogin.classList.remove("text-white-50");

    pillRegister.classList.remove("active-pill");
    pillRegister.classList.add("text-white-50");

    showLoginError(null);
    showRegisterError(null);
  });

  
  forgotPwLink.addEventListener("click", (e) => {
    e.preventDefault();
    console.warn(
      "Password reset functionality is not implemented yet. Triggered placeholder log.",
    );
    alert(
      "Passwort-Reset-Funktion ist in Vorbereitung! Bitte wende dich an den Support.",
    );
  });

  
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    showLoginError(null);

    const email = (
      loginForm.elements.namedItem("loginEmail") as HTMLInputElement
    ).value;
    const password = (
      loginForm.elements.namedItem("loginPassword") as HTMLInputElement
    ).value;

    try {
      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
      const url = new URL("auth/login", API_BASE_URL).toString();
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Ungültige E-Mail oder falsches Passwort.");
      }

      const data = await response.json();
      if (data.token || data.access_token) {
        const tokenToStore = data.token || data.access_token;
        localStorage.setItem("token", tokenToStore);
        document.cookie = `token=${tokenToStore}; path=/; max-age=86400; SameSite=Strict`;
        if (sessionStorage.getItem("pendingCheckout")) {
          window.location.href = "/pages/checkout/";
        } else {
          window.location.href = "/";
        }
      } else {
        throw new Error(
          "Erfolgreich eingeloggt, aber kein Token vom Server erhalten.",
        );
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Es ist ein unerwarteter Fehler aufgetreten.";
      showLoginError(errMsg);
    }
  });

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    showRegisterError(null);

    const firstName = (
      registerForm.elements.namedItem("regFirstName") as HTMLInputElement
    ).value;
    const lastName = (
      registerForm.elements.namedItem("regLastName") as HTMLInputElement
    ).value;
    const email = (
      registerForm.elements.namedItem("regEmail") as HTMLInputElement
    ).value;
    const password = (
      registerForm.elements.namedItem("regPassword") as HTMLInputElement
    ).value;
    const confirmPassword = (
      registerForm.elements.namedItem("regPasswordConfirm") as HTMLInputElement
    ).value;
    const role = (
      registerForm.elements.namedItem("regRole") as HTMLSelectElement
    ).value;
    const license = (
      registerForm.elements.namedItem("regLicense") as HTMLSelectElement
    ).value;

    if (password !== confirmPassword) {
      showRegisterError("Die Passwörter stimmen nicht überein.");
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
      const url = new URL("auth/register", API_BASE_URL).toString();
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          role,
          driversLicenseClass: license,
        }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error("Diese E-Mail ist bereits vergeben.");
        }
        throw new Error(
          "Registrierung fehlgeschlagen. Bitte überprüfe deine Eingaben.",
        );
      }

      const data = await response.json();
      if (data.token || data.access_token) {
        const tokenToStore = data.token || data.access_token;
        localStorage.setItem("token", tokenToStore);
        document.cookie = `token=${tokenToStore}; path=/; max-age=86400; SameSite=Strict`;
        if (sessionStorage.getItem("pendingCheckout")) {
          window.location.href = "/pages/checkout/";
        } else {
          window.location.href = "/";
        }
      } else {
        alert("Account erfolgreich erstellt! Du kannst dich nun einloggen.");
        pillLogin.click();
        registerForm.reset();
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Es ist ein unerwarteter Fehler aufgetreten.";
      showRegisterError(errMsg);
    }
  });
}
