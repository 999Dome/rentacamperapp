import { CredentialValidator } from '../../domain/validators/credential-validator';
import type { ValidationResult } from '../../domain/validators/credential-validator';
import { AuthAPIClient } from '../../infrastructure/api/auth-api-client';
import { SessionStorage } from '../../infrastructure/session-storage';
import { UIHelper } from '../../ui/helpers/ui-helper';
import type { AuthResponse } from '../../domain/models/auth.model';

interface AuthPageElements {
  loginForm: HTMLFormElement;
  registerForm: HTMLFormElement;
  pillLogin: HTMLButtonElement;
  pillRegister: HTMLButtonElement;
  loginErrorBox: HTMLElement;
  registerErrorBox: HTMLElement;
  forgotPwLink: HTMLAnchorElement;
}

class AuthPageLogic {
  private page: HTMLElement;
  private elements: AuthPageElements;
  private apiClient: AuthAPIClient;
  private isProcessing = false;

  constructor(page: HTMLElement) {
    this.page = page;
    this.elements = this.initializeElements();
    this.apiClient = new AuthAPIClient();
    this.setupEventListeners();
  }

  private initializeElements(): AuthPageElements {
    return {
      loginForm: this.getElement('.login-form') as HTMLFormElement,
      registerForm: this.getElement('.register-form') as HTMLFormElement,
      pillLogin: this.getElement('#pill-login') as HTMLButtonElement,
      pillRegister: this.getElement('#pill-register') as HTMLButtonElement,
      loginErrorBox: this.getElement('.login-error') as HTMLElement,
      registerErrorBox: this.getElement('.register-error') as HTMLElement,
      forgotPwLink: this.getElement('.forgot-password-link') as HTMLAnchorElement,
    };
  }

  private setupEventListeners(): void {
    this.setupFormToggle();
    this.setupLoginForm();
    this.setupRegisterForm();
    this.setupForgotPasswordLink();
  }

  private setupFormToggle(): void {
    this.elements.pillRegister.addEventListener('click', (e) => {
      e.preventDefault();
      this.switchToRegisterForm();
    });

    this.elements.pillLogin.addEventListener('click', (e) => {
      e.preventDefault();
      this.switchToLoginForm();
    });
  }

  private setupLoginForm(): void {
    this.elements.loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      void this.handleLoginSubmit();
    });
  }

  private setupRegisterForm(): void {
    this.elements.registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      void this.handleRegisterSubmit();
    });
  }

  private setupForgotPasswordLink(): void {
    this.elements.forgotPwLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleForgotPassword();
    });
  }

  private switchToRegisterForm(): void {
    UIHelper.toggleAuthForm(true, this.page);
    UIHelper.showError(this.elements.loginErrorBox, null);
    UIHelper.showError(this.elements.registerErrorBox, null);
  }

  private switchToLoginForm(): void {
    UIHelper.toggleAuthForm(false, this.page);
    UIHelper.showError(this.elements.loginErrorBox, null);
    UIHelper.showError(this.elements.registerErrorBox, null);
  }

  private async handleLoginSubmit(): Promise<void> {
    if (this.isProcessing) return;

    UIHelper.showError(this.elements.loginErrorBox, null);

    const email = UIHelper.getFormValue(this.elements.loginForm, 'loginEmail');
    const password = UIHelper.getFormValue(this.elements.loginForm, 'loginPassword');

    const validation = this.validateLoginCredentials(email, password);
    if (!validation.isValid) {
      UIHelper.showError(this.elements.loginErrorBox, validation.errors[0]?.message ?? 'Validierungsfehler');
      return;
    }

    this.isProcessing = true;
    const loginBtn = this.elements.loginForm.querySelector('button[type="submit"]') as HTMLButtonElement;
    const originalLoginText = loginBtn.innerHTML;
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Wird eingeloggt...';

    try {
      const response = (await this.apiClient.login(email, password)) as AuthResponse;
      const token = response.token || response.access_token;

      if (token) {
        SessionStorage.storeAuthToken(token);
        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get('redirectTo');
        window.location.href = redirectTo || SessionStorage.getRedirectAfterAuth();
        return;
      }
      throw new Error('Erfolgreich eingeloggt, aber kein Token vom Server erhalten.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Es ist ein unerwarteter Fehler aufgetreten.';
      UIHelper.showError(this.elements.loginErrorBox, errorMessage);
    } finally {
      this.isProcessing = false;
      loginBtn.disabled = false;
      loginBtn.innerHTML = originalLoginText;
    }
  }

  private async handleRegisterSubmit(): Promise<void> {
    if (this.isProcessing) return;

    UIHelper.showError(this.elements.registerErrorBox, null);

    const firstName = UIHelper.getFormValue(this.elements.registerForm, 'regFirstName');
    const lastName = UIHelper.getFormValue(this.elements.registerForm, 'regLastName');
    const email = UIHelper.getFormValue(this.elements.registerForm, 'regEmail');
    const password = UIHelper.getFormValue(this.elements.registerForm, 'regPassword');
    const confirmPassword = UIHelper.getFormValue(this.elements.registerForm, 'regPasswordConfirm');
    const role = UIHelper.getFormValue(this.elements.registerForm, 'regRole');
    const license = UIHelper.getFormValue(this.elements.registerForm, 'regLicense');

    const validation = CredentialValidator.validateRegistrationForm(
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    );

    if (!validation.isValid) {
      UIHelper.showError(this.elements.registerErrorBox, validation.errors[0]?.message ?? 'Validierungsfehler');
      return;
    }

    this.isProcessing = true;
    const registerBtn = this.elements.registerForm.querySelector('button[type="submit"]') as HTMLButtonElement;
    const originalRegisterText = registerBtn.innerHTML;
    registerBtn.disabled = true;
    registerBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Wird registriert...';

    try {
      const response = (await this.apiClient.register(
        firstName,
        lastName,
        email,
        password,
        role,
        license,
      )) as AuthResponse;
      const token = response.token || response.access_token;

      if (token) {
        SessionStorage.storeAuthToken(token);
        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get('redirectTo');
        window.location.href = redirectTo || SessionStorage.getRedirectAfterAuth();
        return;
      } else {
        this.elements.registerForm.classList.add('d-none');
        const successDiv = this.page.querySelector('.register-success') as HTMLElement;
        if (successDiv) {
          successDiv.classList.remove('d-none');
          
          const backBtn = successDiv.querySelector('.btn-back-to-login');
          if (backBtn) {
            backBtn.addEventListener('click', () => {
              successDiv.classList.add('d-none');
              this.elements.registerForm.classList.remove('d-none');
              this.elements.pillLogin.click();
              UIHelper.clearForms(this.elements.registerForm);
            });
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Es ist ein unerwarteter Fehler aufgetreten.';
      UIHelper.showError(this.elements.registerErrorBox, errorMessage);
    } finally {
      this.isProcessing = false;
      registerBtn.disabled = false;
      registerBtn.innerHTML = originalRegisterText;
    }
  }

  private handleForgotPassword(): void {
    console.warn('Password reset functionality is not implemented yet.');
    alert(
      'Passwort-Reset-Funktion ist in Vorbereitung! Bitte wende dich an den Support.',
    );
  }

  private validateLoginCredentials(email: string, password: string): ValidationResult {
    const emailValidation = CredentialValidator.validateEmail(email);
    if (!emailValidation.isValid) {
      return emailValidation;
    }

    const passwordValidation = CredentialValidator.validatePassword(password);
    if (!passwordValidation.isValid) {
      return passwordValidation;
    }

    return { isValid: true, errors: [] };
  }

  private getElement(selector: string): Element {
    const element = this.page.querySelector(selector);
    if (!element) {
      throw new Error(`Element with selector "${selector}" not found in auth page`);
    }
    return element;
  }
}

export function setupAuthLogic(page: HTMLElement): void {
  new AuthPageLogic(page);
}
