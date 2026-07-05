/**
 * Client for the authentication endpoints (login/register).
 *
 * This client does not extend `BaseAPIClient` because it needs its own
 * error handling: auth failures are turned into user-facing German error
 * messages (e.g. wrong password, email already taken) instead of the
 * generic API error format used elsewhere.
 */

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL as string;

export class AuthAPIClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
    if (!this.baseUrl) {
      throw new Error('VITE_BACKEND_URL environment variable is not set');
    }
  }

  /**
   * Logs a user in.
   *
   * @param email User's email address.
   * @param password User's password.
   * @returns The raw JSON response from the backend (e.g. user info/session data).
   */
  async login(email: string, password: string): Promise<Record<string, unknown>> {
    const url = new URL('auth/login', this.baseUrl).toString();
    return this.postRequest(url, { email, password });
  }

  /**
   * Registers a new user account.
   *
   * @param firstName User's first name.
   * @param lastName User's last name.
   * @param email User's email address.
   * @param password User's chosen password.
   * @param driversLicenseClass Driver's license class, required for renters.
   * @param role Optional role to assign (e.g. "provider"); omitted defaults to the backend's default role.
   * @returns The raw JSON response from the backend (e.g. created user info).
   */
  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    driversLicenseClass: string,
    role?: string,
  ): Promise<Record<string, unknown>> {
    const url = new URL('auth/register', this.baseUrl).toString();
    return this.postRequest(url, {
      firstName,
      lastName,
      email,
      password,
      driversLicenseClass,
      ...(role && { role }),
    });
  }

  /**
   * Sends a POST request with a JSON body and parses the JSON response.
   *
   * @param url Full request URL.
   * @param data Body to serialize as JSON.
   * @returns The parsed JSON response.
   * @throws {Error} A user-facing auth error if the response is not ok.
   */
  private async postRequest(
    url: string,
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await this.parseErrorResponse(response);
      throw this.createAuthError(response.status, errorData);
    }

    return (await response.json()) as Record<string, unknown>;
  }

  /**
   * Safely parses an error response body as JSON, falling back to a generic
   * message if the body is missing or not valid JSON.
   *
   * @param response The failed fetch `Response`.
   * @returns The parsed error body, or a fallback message object.
   */
  private async parseErrorResponse(response: Response): Promise<Record<string, unknown>> {
    try {
      return (await response.json()) as Record<string, unknown>;
    } catch {
      return { message: `HTTP Error ${response.status}` };
    }
  }

  /**
   * Maps an HTTP status/error body to a user-facing (German) error message.
   *
   * @param status HTTP status code of the failed response.
   * @param errorData Parsed error body from the backend.
   * @returns An `Error` with a friendly message for known status codes.
   */
  private createAuthError(status: number, errorData: Record<string, unknown>): Error {
    if (status === 409) {
      return new Error('Diese E-Mail ist bereits vergeben.');
    }
    if (status === 401) {
      return new Error('Ungültige E-Mail oder falsches Passwort.');
    }
    const message = typeof errorData.message === 'string' ? errorData.message : 'Authentifizierungsfehler';
    return new Error(message);
  }
}
