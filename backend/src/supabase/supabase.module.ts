import { Global, Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

/**
 * Provides the shared {@link SupabaseService} across the whole application.
 *
 * Marked `@Global()` so any module can inject `SupabaseService` without having
 * to import `SupabaseModule` explicitly — there is a single DB client instance
 * shared app-wide.
 */
@Global()
@Module({
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
