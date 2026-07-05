import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService, RegisterDto, LoginDto } from './auth.service';
import { AuthGuard } from './auth.guard';

/**
 * Authentication endpoints, mounted under the `/auth` route prefix.
 *
 * Delegates to {@link AuthService}. `register`/`login` are public; `me` is
 * protected by {@link AuthGuard}, which validates the bearer token and exposes
 * it on the request.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * `POST /auth/register` — creates an auth user and matching profile.
   *
   * @param registerDto Registration details (credentials + profile fields).
   * @returns A success message, access token (if any) and the created user.
   */
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * `POST /auth/login` — authenticates with email/password.
   *
   * @param loginDto Email and password.
   * @returns An access token and the authenticated user.
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * `GET /auth/me` — returns the current user plus their enriched profile.
   * Protected by {@link AuthGuard}; the token is read from the guarded request.
   *
   * @param req The request, carrying the validated bearer `token`.
   * @returns The authenticated user merged with their profile.
   */
  @UseGuards(AuthGuard)
  @Get('me')
  async getMe(@Request() req: { token: string }) {
    return this.authService.getMe(req.token);
  }
}
