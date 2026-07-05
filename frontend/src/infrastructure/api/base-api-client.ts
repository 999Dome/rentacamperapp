/**
 * BaseAPIClient - central API base class with shared (DRY) error handling.
 *
 * This class follows the Single Responsibility Principle by owning exactly
 * three concerns, so every other API client (auth, bookings, payments, ...)
 * can extend it instead of re-implementing the same fetch boilerplate:
 * - Request handling (building the URL, setting headers)
 * - Central error handling
 * - Type-safe response parsing
 */

/** Structured shape used to describe an API error (currently informational; not thrown as-is, see `createAPIError`). */
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
   * Generic request method with automatic error handling. Subclasses call
   * this instead of using `fetch` directly.
   *
   * @param endpoint API endpoint, relative to `baseUrl`.
   * @param options Fetch options (method, body, headers, etc.).
   * @returns The parsed response data.
   */
  public async request<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const url = new URL(endpoint, this.baseUrl).toString();

    try {
      const isFormData = options?.body instanceof FormData;
      const headers = { ...options?.headers } as Record<string, string>;
      if (!isFormData && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(url, {
        headers,
        ...options,
      });

      return await this.handleResponse<T>(response, endpoint);
    } catch (error) {
      this.handleNetworkError(error, endpoint);
      throw error;
    }
  }

  /**
   * Checks the response status and parses the body as JSON.
   *
   * @param response The raw fetch `Response`.
   * @param endpoint The endpoint that was requested (used for logging/errors).
   * @returns The parsed response data, or `null` if the body was empty.
   * @throws {Error} If the response status is not ok, or the body is not valid JSON.
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

    const text = await response.text();
    if (!text || text.trim() === '') {
      return null as unknown as T;
    }

    try {
      const data = JSON.parse(text) as T;
      return data;
    } catch (parseError) {
      const message = parseError instanceof Error ? parseError.message : 'JSON parse error';
      this.logError(response.status, endpoint, message);
      throw parseError as Error;
    }
  }

  /**
   * Logs network-level failures (e.g. no connection, DNS error) that happen
   * before a response is even received.
   *
   * @param error The caught error (of unknown type, as thrown by `fetch`).
   * @param endpoint The endpoint that was being requested.
   */
  protected handleNetworkError(error: unknown, endpoint: string): void {
    const message = error instanceof Error ? error.message : 'Unknown network error';
    this.logError(0, endpoint, message);
  }

  /**
   * Builds a single `Error` describing a failed API response.
   *
   * @param status HTTP status code of the failed response.
   * @param endpoint The endpoint that was requested.
   * @param message Raw error text from the response body.
   * @returns The constructed error.
   */
  private createAPIError(status: number, endpoint: string, message: string): Error {
    const errorMsg = `API Error [${status}] ${endpoint}: ${message}`;
    return new Error(errorMsg);
  }

  /**
   * Central logging function for API errors, used by both response and
   * network error handling so log output stays consistent.
   *
   * @param status HTTP status code, or `0` for network-level errors.
   * @param endpoint The endpoint involved.
   * @param error Error message to log.
   */
  protected logError(status: number, endpoint: string, error: string): void {
    const timestamp = new Date().toISOString();
    const statusText = status > 0 ? `[${status}]` : '[NETWORK]';
    console.error(`[API ERROR] ${statusText} ${endpoint} - ${timestamp}: ${error}`);
  }

  /**
   * Optional informational logging for non-error events.
   *
   * @param endpoint The endpoint involved.
   * @param message Message to log.
   */
  protected logInfo(endpoint: string, message: string): void {
    console.warn(`[API INFO] ${endpoint}: ${message}`);
  }
}
