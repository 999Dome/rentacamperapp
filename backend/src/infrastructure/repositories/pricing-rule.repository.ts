import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Database } from '../../types/supabase';
import { EntityNotFoundException } from '../../domain/exceptions/domain.exception';

/** A pricing-rule row, generated from the Supabase schema. */
export type PricingRuleRow =
  Database['public']['Tables']['pricing_rules']['Row'];

/**
 * Abstraction over pricing-rule persistence. Injected via
 * {@link PRICING_RULE_REPOSITORY_TOKEN} and consumed by the camper pricing flow.
 */
export interface IPricingRuleRepository {
  findAll(): Promise<PricingRuleRow[]>;
  findById(id: number): Promise<PricingRuleRow>;
}

/** Supabase-backed implementation of {@link IPricingRuleRepository}. */
@Injectable()
export class PricingRuleRepository implements IPricingRuleRepository {
  private readonly tableName = 'pricing_rules';

  constructor(private readonly supabase: SupabaseService) {}

  /**
   * @returns All pricing rules; the pricing calculator reads the ones it needs.
   * @throws Error If the query fails.
   */
  async findAll(): Promise<PricingRuleRow[]> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('*');

    if (error) {
      throw new Error(`Failed to fetch pricing rules: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Fetches a single pricing rule by numeric id.
   *
   * @param id The pricing-rule id.
   * @returns The pricing rule row.
   * @throws EntityNotFoundException If no rule exists for the id.
   * @throws Error If the query itself fails.
   */
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

/** DI token used to inject {@link IPricingRuleRepository} implementations. */
export const PRICING_RULE_REPOSITORY_TOKEN = 'IPricingRuleRepository';
