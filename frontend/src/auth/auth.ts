import { BaseAPIClient } from '../infrastructure/api/base-api-client';

export function getToken(): string | null {
  return localStorage.getItem('token');
}

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

export function logout(): void {
  localStorage.removeItem('token');
  document.cookie = 'token=; path=/; max-age=0; SameSite=Strict';
}

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