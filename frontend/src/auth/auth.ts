/**
 * Small helper module around the app's authentication token.
 *
 * The backend issues a JWT (JSON Web Token) on login, which is stored in
 * `localStorage`. A JWT is just a base64-encoded string with three parts
 * separated by dots (`header.payload.signature`); the functions here decode
 * the middle "payload" part to read basic info (user id, expiry) without
 * needing a library, and never verify the signature — verification is the
 * backend's job, this is only used for quick client-side checks like "is the
 * user still logged in?".
 */
import { BaseAPIClient } from '../infrastructure/api/base-api-client';

/**
 * Reads the raw JWT auth token from `localStorage`.
 *
 * @returns The stored token, or `null` if the user isn't logged in.
 */
export function getToken(): string | null {
  return localStorage.getItem('token');
}

/**
 * Decodes the current JWT's payload to extract the logged-in user's id.
 * Returns `null` if there is no token or it can't be parsed.
 *
 * @returns The user id from the token's `sub` or `id` claim, or `null`.
 */
export function getUserIdFromToken(): string | null {
  const token = getToken();
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payloadStr = atob(parts[1]);
    const payload = JSON.parse(payloadStr) as { sub?: string; id?: string };
    return payload.sub || payload.id || null;
  } catch {
    return null;
  }
}

/**
 * Checks whether the user has a token and that token has not expired yet.
 * This only inspects the token's `exp` claim locally; it does not ask the
 * backend to verify the token is still valid/not revoked.
 *
 * @returns `true` if a non-expired token is present, `false` otherwise.
 */
export function isLoggedIn(): boolean {
  const token = getToken();
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return false;
    const payloadStr = atob(parts[1]);
    const payload = JSON.parse(payloadStr) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp * 1000 > Date.now() : false;
  } catch {
    return false;
  }
}

/**
 * Logs the user out by removing the stored token and clearing the
 * corresponding cookie, if one was set.
 */
export function logout(): void {
  localStorage.removeItem('token');
  document.cookie = 'token=; path=/; max-age=0; SameSite=Strict';
}

/**
 * Fetches the currently logged-in user's profile from the backend using
 * the stored token.
 *
 * @returns The user data returned by the `auth/me` endpoint, or `null` if
 *   there is no token or the request fails.
 */
export async function fetchCurrentUser(): Promise<Record<string, unknown> | null> {
  const token = getToken();
  if (!token) return null;
  const client = new BaseAPIClient();
  try {
    return await client.request<Record<string, unknown>>('auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error('Failed to fetch current user', error);
    return null;
  }
}