export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class CredentialValidator {
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

  private static isValidEmailFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
