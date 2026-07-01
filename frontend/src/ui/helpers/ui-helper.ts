export class UIHelper {
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

  static showError(errorElement: HTMLElement, message: string | null): void {
    if (message) {
      errorElement.textContent = message;
      errorElement.classList.remove('d-none');
    } else {
      errorElement.classList.add('d-none');
      errorElement.textContent = '';
    }
  }

  static clearForms(form: HTMLFormElement): void {
    form.reset();
  }

  private static activatePill(button: HTMLButtonElement): void {
    button.classList.add('active-pill');
    button.classList.remove('text-white-50');
  }

  private static deactivatePill(button: HTMLButtonElement): void {
    button.classList.remove('active-pill');
    button.classList.add('text-white-50');
  }

  private static getElement(selector: string, parent: HTMLElement = document.documentElement): HTMLElement {
    const element = parent.querySelector(selector);
    if (!element) {
      throw new Error(`Element with selector "${selector}" not found`);
    }
    return element as HTMLElement;
  }

  static getFormValue(form: HTMLFormElement, fieldName: string): string {
    const input = form.elements.namedItem(fieldName) as HTMLInputElement | null;
    if (!input) {
      throw new Error(`Form field "${fieldName}" not found`);
    }
    return input.value;
  }
}
