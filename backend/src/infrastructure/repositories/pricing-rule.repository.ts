import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Database } from '../../types/supabase';
import { EntityNotFoundException } from '../../domain/exceptions/domain.exception';

export type PricingRuleRow =
  Database['public']['Tables']['pricing_rules']['Row'];

export interface IPricingRuleRepository {
  findAll(): Promise<PricingRuleRow[]>;
  findById(id: number): Promise<PricingRuleRow>;
}

@Injectable()
export class PricingRuleRepository implements IPricingRuleRepository {
  private readonly tableName = 'pricing_rules';

  constructor(private readonly supabase: SupabaseService) {}

  async findAll(): Promise<PricingRuleRow[]> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('*');

    if (error) {
      throw new Error(`Failed to fetch pricing rules: ${error.message}`);
    }

    return data || [];
  }

  async findById(id: number): Promise<PricingRuleRow> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch pricing rule: ${error.message}`);
    }

    if (!data) {
      throw new EntityNotFoundException('PricingRule', id);
    }

    return data;
  }
}

export const PRICING_RULE_REPOSITORY_TOKEN = 'IPricingRuleRepository';
