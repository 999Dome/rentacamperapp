import { CredentialValidator } from '../../domain/validators/credential-validator';
import type { ValidationResult } from '../../domain/validators/credential-validator';
import { AuthAPIClient } from '../../infrastructure/api/auth-api-client';
import { SessionStorage } from '../../infrastructure/session-storage';
import { UIHelper } from '../../ui/helpers/ui-helper';
import type { AuthResponse } from '../../domain/models/auth.model';

/**
 * Why this file is an imperative "controller" class instead of reactive
 * state/hooks: this app has no virtual DOM, no component state, and no
 * re-render mechanism (see `frontend/src/utils/createElement.ts`) - JSX only
 * ever runs once, at creation time, to produce real DOM nodes. `AuthPage.tsx`
 * builds that static markup, and this class is handed the resulting root
 * element afterwards to find already-rendered pieces (forms, buttons, error
 * boxes) with `querySelector` and wire up `addEventListener`s by hand. Any
 * later UI change (showing an error, toggling the login/register pill, etc.)
 * has to mutate the existing DOM nodes directly, because there is no
 * framework that would do that for us based on state changes.
 */

interface AuthPageElements {
  loginForm: HTMLFormElement;
  registerForm: HTMLFormElement;
  pillLogin: HTMLButtonElement;
  pillRegister: HTMLButtonElement;
  loginErrorBox: HTMLElement;
  registerErrorBox: HTMLElement;
  forgotPwLink: HTMLAnchorElement;
}

/**
 * Imperative controller that wires up the login/register markup rendered by
 * `AuthPage.tsx`. It looks up the relevant elements once (forms, pill
 * toggle buttons, error boxes), attaches all event listeners, and handles
 * form submission (validating credentials, calling the auth API, storing
 * the resulting token, and redirecting or showing errors).
 */
class AuthPageLogic {
  private page: HTMLElement;
  private elements: AuthPageElements;
  private apiClient: AuthAPIClient;
  private isProcessing = false;

  /**
   * Looks up all the elements this controller needs inside the already
   * rendered `page`, then attaches every event listener.
   *
   * @param page The root element returned by `AuthPage()`.
   */
  constructor(page: HTMLElement) {
    this.page = page;
    this.elements = this.initializeElements();
    this.apiClient = new AuthAPIClient();
    this.setupEventListeners();
  }

  /** Finds and returns every DOM element this controller reads from or writes to. */
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

  /** Wires up all event listeners this page needs (form toggle, both forms, forgot-password link). */
  private setupEventListeners(): void {
    this.setupFormToggle();
    this.setupLoginForm();
    this.setupRegisterForm();
    this.setupForgotPasswordLink();
  }

  /** Makes the login/register pill buttons switch which form panel is shown. */
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

  /** Intercepts the login form's submit event and hands it off to `handleLoginSubmit`. */
  private setupLoginForm(): void {
    this.elements.loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      void this.handleLoginSubmit();
    });
  }

  /** Intercepts the register form's submit event and hands it off to `handleRegisterSubmit`. */
  private setupRegisterForm(): void {
    this.elements.registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      void this.handleRegisterSubmit();
    });
  }

  /** Wires up the "Kennwort vergessen?" link to `handleForgotPassword`. */
  private setupForgotPasswordLink(): void {
    this.elements.forgotPwLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleForgotPassword();
    });
  }

  /** Slides the panel over to the register form and clears any shown error messages. */
  private switchToRegisterForm(): void {
    UIHelper.toggleAuthForm(true, this.page);
    UIHelper.showError(this.elements.loginErrorBox, null);
    UIHelper.showError(this.elements.registerErrorBox, null);
  }

  /** Slides the panel back to the login form and clears any shown error messages. */
  private switchToLoginForm(): void {
    UIHelper.toggleAuthForm(false, this.page);
    UIHelper.showError(this.elements.loginErrorBox, null);
    UIHelper.showError(this.elements.registerErrorBox, null);
  }

  /**
   * Validates the login form, calls the auth API, and on success stores the
   * returned token and redirects the user. Shows an error message on
   * validation or API failure. Shows a loading state on the submit button
   * while the request is in flight.
   */
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

  /**
   * Validates the register form, calls the auth API, and either logs the
   * user in directly (if a token comes back) or shows the "check your
   * inbox" success panel (if the account needs email verification). Shows
   * an error message on validation or API failure, and a loading state on
   * the submit button while the request is in flight.
   */
  private async handleRegisterSubmit(): Promise<void> {
    if (this.isProcessing) return;

    UIHelper.showError(this.elements.registerErrorBox, null);

    const firstName = UIHelper.getFormValue(this.elements.registerForm, 'regFirstName');
    const lastName = UIHelper.getFormValue(this.elements.registerForm, 'regLastName');
    const email = UIHelper.getFormValue(this.elements.registerForm, 'regEmail');
    const password = UIHelper.getFormValue(this.elements.registerForm, 'regPassword');
    const confirmPassword = UIHelper.getFormValue(this.elements.registerForm, 'regPasswordConfirm');
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

  /** Placeholder handler for the not-yet-implemented password reset feature. */
  private handleForgotPassword(): void {
    console.warn('Password reset functionality is not implemented yet.');
    alert(
      'Passwort-Reset-Funktion ist in Vorbereitung! Bitte wende dich an den Support.',
    );
  }

  /**
   * Runs the login form's email and password through their respective
   * validators.
   *
   * @param email Value of the login form's email field.
   * @param password Value of the login form's password field.
   * @returns The first failing validation result, or a valid result if both checks pass.
   */
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

  /**
   * Finds an element within the auth page by CSS selector, throwing if it's
   * missing (this should only happen if `AuthPage.tsx`'s markup and this
   * controller's selectors drift apart).
   *
   * @param selector CSS selector to look up within the page's root element.
   * @returns The matched element.
   */
  private getElement(selector: string): Element {
    const element = this.page.querySelector(selector);
    if (!element) {
      throw new Error(`Element with selector "${selector}" not found in auth page`);
    }
    return element;
  }
}

/**
 * Entry point called by `AuthPage.tsx` right after it builds the login/
 * register markup. Creates the `AuthPageLogic` controller, which wires up
 * all the interactive behavior for that markup.
 *
 * @param page The root element returned by `AuthPage()`.
 */
export function setupAuthLogic(page: HTMLElement): void {
  new AuthPageLogic(page);
}
