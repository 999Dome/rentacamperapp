/**
 * BaseAPIClient - Zentrale API-Basis mit DRY Error Handling
 *
 * Diese Klasse implementiert die Single Responsibility Principle:
 * - Request-Verwaltung (URL-Building, Header-Setup)
 * - Zentrale Error-Behandlung
 * - Response-Parsing mit Typ-Sicherheit
 */

export interface APIError {
  status: number;
  message: string;
  endpoint: string;
  timestamp: Date;
}

export class BaseAPIClient {
  protected baseUrl: string;

  constructor() {
    const envRaw = (import.meta.env.VITE_BACKEND_URL) as unknown;
    const envUrl = typeof envRaw === 'string' ? envRaw : '';
    this.baseUrl = envUrl;
    if (!this.baseUrl) {
      throw new Error('VITE_BACKEND_URL environment variable is not configured');
    }
  }

  /**
   * Generische Request-Methode mit automatischem Error-Handling
   * @param endpoint - API Endpoint (relative zur baseUrl)
   * @param options - Fetch-Optionen (Method, Body, Headers, etc.)
   * @returns Promise mit geparsten Response-Daten
   */
  public async request<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const url = new URL(endpoint, this.baseUrl).toString();

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      return await this.handleResponse<T>(response, endpoint);
    } catch (error) {
      this.handleNetworkError(error, endpoint);
      throw error;
    }
  }

  /**
   * Verarbeitet Responses mit Fehlerprüfung und Typ-Konvertierung
   */
  protected async handleResponse<T>(
    response: Response,
    endpoint: string,
  ): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      this.logError(response.status, endpoint, errorText);
      throw this.createAPIError(response.status, endpoint, errorText);
    }

    try {
      const data = (await response.json()) as T;
      return data;
    } catch (parseError) {
      const message = parseError instanceof Error ? parseError.message : 'JSON parse error';
      this.logError(response.status, endpoint, message);
      throw parseError as Error;
    }
  }

  /**
   * Fehlerbehandlung für Netzwerkfehler
   */
  protected handleNetworkError(error: unknown, endpoint: string): void {
    const message = error instanceof Error ? error.message : 'Unknown network error';
    this.logError(0, endpoint, message);
  }

  /**
   * Erstellt strukturiertes API-Error-Objekt
   */
  private createAPIError(status: number, endpoint: string, message: string): Error {
    const errorMsg = `API Error [${status}] ${endpoint}: ${message}`;
    return new Error(errorMsg);
  }

  /**
   * Zentrale Logging-Funktion
   */
  protected logError(status: number, endpoint: string, error: string): void {
    const timestamp = new Date().toISOString();
    const statusText = status > 0 ? `[${status}]` : '[NETWORK]';
    console.error(`[API ERROR] ${statusText} ${endpoint} - ${timestamp}: ${error}`);
  }

  /**
   * Optional: Info-Logging
   */
  protected logInfo(endpoint: string, message: string): void {
    console.warn(`[API INFO] ${endpoint}: ${message}`);
  }
}
