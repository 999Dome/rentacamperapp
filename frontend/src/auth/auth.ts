export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function isLoggedIn(): boolean {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();                
  } catch {
    return false;
  }
}

export function logout(): void {
  localStorage.removeItem('token');
  document.cookie = 'token=; path=/; max-age=0; SameSite=Strict';
}

export async function fetchCurrentUser() {
  const token = getToken();
  if (!token) return null;
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const url = new URL("auth/me", API_BASE_URL).toString();
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}