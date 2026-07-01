const TOKEN_KEY = 'token';
const COOKIE_NAME = 'token';
const PENDING_CHECKOUT_KEY = 'pendingCheckout';
const CHECKOUT_PATH = '/pages/checkout/';

export class SessionStorage {
  static storeAuthToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.storeTokenCookie(token);
  }

  static getAuthToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  static clearAuthToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.clearTokenCookie();
  }

  static storePendingCheckout(): void {
    sessionStorage.setItem(PENDING_CHECKOUT_KEY, 'true');
  }

  static hasPendingCheckout(): boolean {
    return sessionStorage.getItem(PENDING_CHECKOUT_KEY) !== null;
  }

  static clearPendingCheckout(): void {
    sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
  }

  static getRedirectAfterAuth(): string {
    return this.hasPendingCheckout() ? CHECKOUT_PATH : '/pages/account/';
  }

  private static storeTokenCookie(token: string): void {
    document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=86400; SameSite=Strict`;
  }

  private static clearTokenCookie(): void {
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Strict`;
  }
}
