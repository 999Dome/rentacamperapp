const API_BASE_URL = import.meta.env.VITE_BACKEND_URL as string;

export class AuthAPIClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
    if (!this.baseUrl) {
      throw new Error('VITE_BACKEND_URL environment variable is not set');
    }
  }

  async login(email: string, password: string): Promise<Record<string, unknown>> {
    const url = new URL('auth/login', this.baseUrl).toString();
    return this.postRequest(url, { email, password });
  }

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

  private async parseErrorResponse(response: Response): Promise<Record<string, unknown>> {
    try {
      return (await response.json()) as Record<string, unknown>;
    } catch {
      return { message: `HTTP Error ${response.status}` };
    }
  }

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
