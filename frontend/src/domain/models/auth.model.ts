/**
 * Shared type definitions for authentication: what data the login/register
 * forms collect, what the backend expects to receive, and what it sends
 * back. Keeping these as plain interfaces (no logic) means both the UI
 * layer and the API layer can import the same shapes instead of each
 * defining their own.
 */

/** Credentials entered by the user on the login form. */
export interface AuthCredentials {
  email: string;
  password: string;
}

/** An access token as issued by the backend after a successful login. */
export interface AuthToken {
  accessToken: string;
  tokenType: string;
  /** Lifetime of the token in seconds, counted from the moment it was issued. */
  expiresIn: number;
}

/** The logged-in user's profile data as known to the frontend. */
export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

/** Request body sent to the login endpoint. */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Request body sent to the registration endpoint. */
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
  driversLicenseClass: string;
}

/**
 * Response body returned by the login/registration endpoints.
 *
 * Both `access_token` and `token` are marked optional because different
 * backend endpoints have historically used different field names for the
 * same value - callers should check both when reading the token out of a response.
 */
export interface AuthResponse {
  access_token?: string;
  token?: string;
  user?: AuthUser;
  message?: string;
}
