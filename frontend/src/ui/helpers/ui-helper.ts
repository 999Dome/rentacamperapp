/**
 * Collection of small, stateless DOM utility functions used by the
 * login/register page and other forms. All methods are `static` since this
 * class is just a namespace/grouping for helpers, not an object you
 * instantiate.
 */
export class UIHelper {
  /**
   * Switches the login/register auth form between its two modes by
   * toggling a CSS class on the slider track and updating which "pill"
   * button (Login vs. Register) looks active.
   *
   * @param isRegisterMode `true` to show the register form, `false` for login.
   * @param page The container element that holds the auth form's markup.
   */
  static toggleAuthForm(isRegisterMode: boolean, page: HTMLElement): void {
    const track = this.getElement('.auth-slider-track', page);
    const pillLogin = this.getElement('#pill-login', page) as HTMLButtonElement;
    const pillRegister = this.getElement('#pill-register', page) as HTMLButtonElement;

    if (isRegisterMode) {
      track.classList.add('show-register');
      this.activatePill(pillRegister);
      this.deactivatePill(pillLogin);
    } else {
      track.classList.remove('show-register');
      this.activatePill(pillLogin);
      this.deactivatePill(pillRegister);
    }
  }

  /**
   * Shows or hides an inline error message element.
   *
   * @param errorElement The element used to display the error text.
   * @param message The error text to show, or `null`/empty to hide the element.
   */
  static showError(errorElement: HTMLElement, message: string | null): void {
    if (message) {
      errorElement.textContent = message;
      errorElement.classList.remove('d-none');
    } else {
      errorElement.classList.add('d-none');
      errorElement.textContent = '';
    }
  }

  /**
   * Resets a form back to its default, empty state.
   *
   * @param form The form element to reset.
   */
  static clearForms(form: HTMLFormElement): void {
    form.reset();
  }

  /** Marks a pill-style toggle button as the active/selected one. */
  private static activatePill(button: HTMLButtonElement): void {
    button.classList.add('active-pill');
    button.classList.remove('text-white-50');
  }

  /** Marks a pill-style toggle button as inactive/unselected. */
  private static deactivatePill(button: HTMLButtonElement): void {
    button.classList.remove('active-pill');
    button.classList.add('text-white-50');
  }

  /**
   * Looks up a single element by CSS selector within the given parent,
   * throwing if it can't be found instead of silently returning `null`.
   * This is intentional: these lookups target markup that should always be
   * present when the auth page is on screen, so a missing element points
   * to a real bug rather than something callers should handle gracefully.
   *
   * @param selector CSS selector to look up.
   * @param parent Element to search within (defaults to the whole document).
   * @returns The matching element.
   * @throws Error if no element matches the selector.
   */
  private static getElement(selector: string, parent: HTMLElement = document.documentElement): HTMLElement {
    const element = parent.querySelector(selector);
    if (!element) {
      throw new Error(`Element with selector "${selector}" not found`);
    }
    return element as HTMLElement;
  }

  /**
   * Reads the current value of a named field in a form.
   *
   * @param form The form containing the field.
   * @param fieldName The `name` attribute of the input to read.
   * @returns The field's current value.
   * @throws Error if no field with that name exists on the form.
   */
  static getFormValue(form: HTMLFormElement, fieldName: string): string {
    const input = form.elements.namedItem(fieldName) as HTMLInputElement | null;
    if (!input) {
      throw new Error(`Form field "${fieldName}" not found`);
    }
    return input.value;
  }
}
