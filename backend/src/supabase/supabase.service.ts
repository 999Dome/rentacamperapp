import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import ws from 'ws';

/**
 * Owns the single, application-wide Supabase client.
 *
 * The client is created with the **service-role key**, so it bypasses row-level
 * security — every consumer of this service therefore runs with full DB
 * privileges and must enforce access control itself. It is strongly typed with
 * the generated `Database` schema for compile-time-safe queries.
 */
@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabaseClient: SupabaseClient<Database>;

  /** The shared, schema-typed Supabase client. */
  get client() {
    return this.supabaseClient;
  }

  /**
   * Initialises the client once the module is ready.
   *
   * Runs in `onModuleInit` (not the constructor) so env vars are guaranteed to
   * be loaded first. Node has no global `WebSocket`, so the `ws` package is
   * injected as the realtime transport.
   *
   * @throws Error If the required Supabase env vars are missing.
   */
  onModuleInit() {
    const url = process.env.SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !secretKey) {
      throw new Error('Supabase variables are missing!');
    }

    // Adapt the Node `ws` implementation to the WebSocket constructor shape the
    // Supabase realtime client expects (Node has no built-in global WebSocket).
    const transportConstructor = ws as unknown as new (
      address: string,
      protocols?: string | string[],
      options?: unknown,
    ) => WebSocket;

    this.supabaseClient = createClient<Database>(url, secretKey, {
      realtime: {
        transport: transportConstructor,
      },
    });
  }
}
