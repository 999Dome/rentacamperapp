import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class PricingRulesService {
  readonly table = 'pricing_rules';

  constructor(private readonly supabase: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .select('*');

    if (error) throw new Error(error.message);
    return data;
  }
}
