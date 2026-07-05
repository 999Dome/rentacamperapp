import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { createClient } from '@supabase/supabase-js';
import type { ProfileRow } from '../../infrastructure/repositories/profile.repository';

import { DriversLicenseService } from '../drivers_license/drivers_license.service';

/** Request body for `POST /auth/register`. */
export class RegisterDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  /** Optional role hint from the client (defaults are applied server-side). */
  role?: string;
  /** Human-readable license class (e.g. "B"); resolved to an id on save. */
  driversLicenseClass?: string;
}

/** Request body for `POST /auth/login`. */
export class LoginDto {
  email?: string;
  password?: string;
}

/**
 * A profile augmented with the human-readable license class.
 *
 * `drivers_license_class` is overwritten with the resolved class *name* (the
 * DB stores an id), and `driver_license_class` is an alias kept for frontend
 * compatibility.
 */
type EnrichedAuthProfile = ProfileRow & {
  drivers_license_class: string;
  driver_license_class: string;
};

/**
 * Handles registration, login and "current user" lookup on top of Supabase
 * Auth.
 *
 * A key detail: sign-up/sign-in use a *separate* client created with the
 * public ("publishable") key and no session persistence (see
 * {@link getAuthClient}), while profile reads/writes use the injected
 * service-role client. This keeps end-user auth flows off the privileged key.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly driversLicenseService: DriversLicenseService,
  ) {}

  /**
   * Builds a short-lived Supabase client for end-user auth operations.
   *
   * Uses the publishable (anon) key and disables session persistence /
   * auto-refresh because the backend is stateless — it only needs to perform a
   * single sign-up/sign-in call, not hold a session.
   *
   * @returns A fresh Supabase client configured for auth calls.
   */
  private getAuthClient() {
    return createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );
  }

  /**
   * Registers a new user: creates the Supabase auth account, then inserts the
   * matching row in `profiles`.
   *
   * The license class is resolved from its human-readable name to a DB id
   * before saving. New users default to renter (not provider/admin).
   *
   * @param registerDto Credentials and profile details.
   * @returns Success message, access token (if a session was returned) and the
   *          created auth user.
   * @throws ConflictException If the email is already registered.
   * @throws BadRequestException If sign-up fails or the profile insert fails.
   */
  async register(registerDto: RegisterDto) {
    const { firstName, lastName, email, password, driversLicenseClass } =
      registerDto;
    const authClient = this.getAuthClient();

    const { data: authData, error: authError } = await authClient.auth.signUp({
      email: email!,
      password: password!,
    });

    if (authError) {
      // Supabase signals a duplicate email either via HTTP 409 or a message;
      // map both to a clean 409 Conflict for the client.
      if (
        authError.status === 409 ||
        authError.message.includes('already registered')
      ) {
        throw new ConflictException('Diese E-Mail ist bereits vergeben.');
      }
      throw new BadRequestException(authError.message);
    }

    if (!authData.user) {
      throw new BadRequestException(
        'Fehler bei der Registrierung (kein User erhalten).',
      );
    }

    const resolvedLicenseId =
      await this.driversLicenseService.resolveLicenseId(driversLicenseClass);

    const { error: profileError } = await this.supabaseService.client
      .from('profiles')
      .insert({
        id: authData.user.id,
        first_name: firstName || '',
        last_name: lastName || '',
        is_provider: false,
        is_renter: true,
        is_admin: false,
        drivers_license_class: resolvedLicenseId,
      });

    if (profileError) {
      // The auth account already exists at this point but the profile insert
      // failed, leaving the user in a half-created state — surface it clearly.
      console.error('Error creating profile:', profileError);
      throw new BadRequestException(
        'Account erstellt, aber Profil konnte nicht angelegt werden.',
      );
    }

    return {
      message: 'Registrierung erfolgreich',
      access_token: authData.session?.access_token || null,
      user: authData.user,
    };
  }

  /**
   * Authenticates a user with email/password.
   *
   * @param loginDto Email and password.
   * @returns An access token and the authenticated user.
   * @throws UnauthorizedException If the credentials are invalid.
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const authClient = this.getAuthClient();

    const { data, error } = await authClient.auth.signInWithPassword({
      email: email!,
      password: password!,
    });

    if (error) {
      throw new UnauthorizedException(
        'Ungültige E-Mail oder falsches Passwort.',
      );
    }

    return {
      access_token: data.session.access_token,
      user: data.user,
    };
  }

  /**
   * Resolves the current user from a token and attaches their enriched profile.
   *
   * The stored `drivers_license_class` is a DB id; this method resolves it to
   * the readable class name (defaulting to "Klasse B") and returns it under
   * both `drivers_license_class` and the legacy `driver_license_class` alias
   * the frontend expects.
   *
   * @param token A valid Supabase access token.
   * @returns The auth user merged with a `profile` field (or `null` profile if
   *          none exists).
   * @throws UnauthorizedException If the token is invalid.
   */
  async getMe(token: string) {
    const authClient = this.getAuthClient();
    const { data: authData, error: authError } =
      await authClient.auth.getUser(token);

    if (authError || !authData.user) {
      throw new UnauthorizedException('Ungültiges Token');
    }

    const { data: profile, error: profileError } =
      await this.supabaseService.client
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

    if (profileError) {
      console.warn('Fehler beim Laden des Profils:', profileError);
    }

    let enrichedProfile: EnrichedAuthProfile | null = null;
    if (profile) {
      // Default class shown when the profile has no license set or the lookup
      // fails, so the frontend always receives a usable value.
      let className = 'Klasse B';
      if (profile.drivers_license_class) {
        try {
          const license = await this.driversLicenseService.findLicenseById(
            profile.drivers_license_class,
          );
          if (license && license.class) {
            className = license.class;
          }
        } catch (err) {
          // A missing/failed license lookup must not break the whole /me call;
          // fall back to the default class name and continue.
          console.warn('Could not load license class name in getMe:', err);
        }
      }
      enrichedProfile = {
        ...profile,
        drivers_license_class: className,
        driver_license_class: className, // Fallback for frontend compatibility
      };
    }

    return {
      ...authData.user,
      profile: enrichedProfile,
    };
  }
}
