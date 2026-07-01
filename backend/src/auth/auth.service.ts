import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { createClient } from '@supabase/supabase-js';

export class RegisterDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: string;
  driversLicenseClass?: string;
}

export class LoginDto {
  email?: string;
  password?: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

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

  async register(registerDto: RegisterDto) {
    const { firstName, lastName, email, password, role, driversLicenseClass } =
      registerDto;
    const authClient = this.getAuthClient();

    const { data: authData, error: authError } = await authClient.auth.signUp({
      email: email!,
      password: password!,
    });

    if (authError) {
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

    const { error: profileError } = await this.supabaseService.client
      .from('profiles')
      .insert({
        id: authData.user.id,
        first_name: firstName || '',
        last_name: lastName || '',
        is_provider: role === 'provider',
        is_renter: role === 'renter' || role !== 'provider',
        drivers_license_class: driversLicenseClass || null,
      });

    if (profileError) {
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

    return {
      ...authData.user,
      profile,
    };
  }
}
