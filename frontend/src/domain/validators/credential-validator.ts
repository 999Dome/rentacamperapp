/** A single field-level validation failure. */
export interface ValidationError {
  /** Name of the field the error belongs to, e.g. `'email'`. */
  field: string;
  /** Human-readable, German-language message shown to the user. */
  message: string;
}

/** Outcome of running one or more validation checks. */
export interface ValidationResult {
  /** `true` only if `errors` is empty. */
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Pure, stateless validation rules for login/registration form fields.
 * Every method just inspects its inputs and returns a {@link ValidationResult}
 * - no side effects, no access to the DOM or network. This class is used
 * like a namespace/utility bag (all members `static`), never instantiated.
 */
export class CredentialValidator {
  /**
   * Checks that an email address was provided and looks structurally valid.
   * @param email The email address to validate.
   */
  static validateEmail(email: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!email || email.trim().length === 0) {
      errors.push({
        field: 'email',
        message: 'E-Mail ist erforderlich',
      });
    } else if (!this.isValidEmailFormat(email)) {
      errors.push({
        field: 'email',
        message: 'Ungültige E-Mail-Adresse',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Checks that a password was provided and meets the minimum length.
   * @param password The password to validate.
   */
  static validatePassword(password: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!password || password.length === 0) {
      errors.push({
        field: 'password',
        message: 'Passwort ist erforderlich',
      });
    } else if (password.length < 6) {
      errors.push({
        field: 'password',
        message: 'Passwort muss mindestens 6 Zeichen lang sein',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Checks that a password and its confirmation match.
   * @param password The originally entered password.
   * @param confirmation The value entered in the "repeat password" field.
   */
  static validatePasswordConfirmation(password: string, confirmation: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (password !== confirmation) {
      errors.push({
        field: 'password_confirmation',
        message: 'Die Passwörter stimmen nicht überein',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Runs all registration-form checks (required names, email format,
   * password strength, password confirmation match) and combines their
   * errors into a single result.
   * @param firstName The user's first name.
   * @param lastName The user's last name.
   * @param email The user's email address.
   * @param password The chosen password.
   * @param confirmPassword The repeated password, expected to match `password`.
   * @returns A combined {@link ValidationResult} listing every failed check.
   */
  static validateRegistrationForm(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    confirmPassword: string,
  ): ValidationResult {
    const allErrors: ValidationError[] = [];

    if (!firstName || firstName.trim().length === 0) {
      allErrors.push({
        field: 'firstName',
        message: 'Vorname ist erforderlich',
      });
    }

    if (!lastName || lastName.trim().length === 0) {
      allErrors.push({
        field: 'lastName',
        message: 'Nachname ist erforderlich',
      });
    }

    const emailValidation = this.validateEmail(email);
    if (!emailValidation.isValid) {
      allErrors.push(...emailValidation.errors);
    }

    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.isValid) {
      allErrors.push(...passwordValidation.errors);
    }

    const confirmValidation = this.validatePasswordConfirmation(password, confirmPassword);
    if (!confirmValidation.isValid) {
      allErrors.push(...confirmValidation.errors);
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
    };
  }

  /**
   * Checks the email against a simple `local@domain.tld` pattern. This is a
   * basic sanity check, not a full RFC 5322 validation.
   * @param email The email address to check.
   */
  private static isValidEmailFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
