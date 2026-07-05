import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import type { User } from '@supabase/supabase-js';

/**
 * The subset of the HTTP request this guard reads from and writes to.
 * On success the resolved `user` and raw `token` are attached so downstream
 * handlers (e.g. `@Request() req`) can use them.
 */
interface RequestWithAuth {
  headers: Record<string, string | undefined>;
  user?: User;
  token?: string | null;
}

/**
 * Route guard that authenticates requests via a Supabase bearer token.
 *
 * Apply with `@UseGuards(AuthGuard)`. It extracts the `Authorization: Bearer
 * <token>` header, verifies it against Supabase, and — if valid — attaches the
 * user and token to the request. Any missing/invalid token rejects the request
 * with 401 before the handler runs.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService) {}

  /**
   * @param context The execution context for the incoming request.
   * @returns `true` if the request carries a valid token (request is then
   *          enriched with `user`/`token`).
   * @throws UnauthorizedException If the token is absent or invalid.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithAuth>();
    const header = req.headers['authorization'];
    // Accept only the "Bearer <token>" scheme; anything else is treated as no
    // token (slice(7) drops the "Bearer " prefix).
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) throw new UnauthorizedException('Kein Token');

    const { data, error } = await this.supabase.client.auth.getUser(token);
    if (error || !data.user)
      throw new UnauthorizedException('Ungültiges Token');

    // Expose the authenticated identity to downstream handlers.
    req.user = data.user;
    req.token = token;
    return true;
  }
}
