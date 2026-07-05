const TOKEN_KEY = 'token';
const COOKIE_NAME = 'token';
const PENDING_CHECKOUT_KEY = 'pendingCheckout';
const CHECKOUT_PATH = '/pages/checkout/';

/**
 * Wraps browser storage (localStorage, sessionStorage, cookies) so the rest
 * of the app doesn't talk to the Web Storage APIs directly.
 *
 * It is responsible for two unrelated concerns that both need a persisted
 * "did the user already do X" flag:
 * - Auth: keeps the login token in `localStorage` (so it survives page
 *   reloads) and mirrors it into a cookie (so the backend can read it too).
 * - Checkout: remembers, for the current browser tab only (`sessionStorage`),
 *   that the user tried to check out before they were logged in, so they can
 *   be sent back to checkout right after they sign in.
 *
 * All members are `static` - this class is used like a namespace/utility
 * bag, never instantiated.
 */
export class SessionStorage {
  /**
   * Persists the auth token for the current browser (localStorage) and
   * mirrors it into a cookie so server-rendered pages can read it too.
   * @param token The access token returned by the login/register API.
   */
  static storeAuthToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.storeTokenCookie(token);
  }

  /**
   * Reads the currently stored auth token.
   * @returns The token, or `null` if the user is not logged in.
   */
  static getAuthToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /** Removes the auth token from both localStorage and the cookie (logout). */
  static clearAuthToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.clearTokenCookie();
  }

  /** Marks that the user attempted to check out while not yet authenticated. */
  static storePendingCheckout(): void {
    sessionStorage.setItem(PENDING_CHECKOUT_KEY, 'true');
  }

  /**
   * Checks whether a checkout attempt is waiting to be resumed after login.
   * @returns `true` if {@link storePendingCheckout} was called and not yet cleared.
   */
  static hasPendingCheckout(): boolean {
    return sessionStorage.getItem(PENDING_CHECKOUT_KEY) !== null;
  }

  /** Clears the pending-checkout flag, e.g. once the checkout flow completes. */
  static clearPendingCheckout(): void {
    sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
  }

  /**
   * Decides where to send the user right after a successful login/registration.
   * @returns The checkout page path if a checkout was pending, otherwise the account page path.
   */
  static getRedirectAfterAuth(): string {
    return this.hasPendingCheckout() ? CHECKOUT_PATH : '/pages/account/';
  }

  /**
   * Writes the auth token into a cookie so it is also available to
   * non-JS/server-rendered requests, not just client-side code.
   * @param token The access token to store.
   */
  private static storeTokenCookie(token: string): void {
    document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=86400; SameSite=Strict`;
  }

  /** Expires the auth cookie immediately by setting `max-age=0`. */
  private static clearTokenCookie(): void {
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Strict`;
  }
}
