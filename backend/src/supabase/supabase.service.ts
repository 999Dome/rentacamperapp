import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import ws from 'ws';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabaseClient: SupabaseClient<Database>;

  get client() {
    return this.supabaseClient;
  }

  onModuleInit() {
    const url = process.env.SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !secretKey) {
      throw new Error('Supabase variables are missing!');
    }

    const transportConstructor = ws as unknown as new (
      address: string,
      protocols?: string | string[],
      options?: unknown,
    ) => any;

    this.supabaseClient = createClient<Database>(url, secretKey, {
      realtime: {
        transport: transportConstructor,
      },
    });
  }
}
