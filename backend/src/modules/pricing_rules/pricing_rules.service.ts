import { Injectable } from '@nestjs/common';
import { PricingRuleRepository } from '../../infrastructure/repositories/pricing-rule.repository';

/**
 * Business logic for pricing rules. A thin layer over {@link PricingRuleRepository}
 * that provides read access to the rules used when calculating rental prices.
 */
@Injectable()
export class PricingRulesService {
  constructor(private readonly pricingRuleRepository: PricingRuleRepository) {}

  /**
   * Returns every pricing rule.
   *
   * @returns All pricing rule records.
   */
  async getAllPricingRules() {
    return await this.pricingRuleRepository.findAll();
  }

  /**
   * Returns a single pricing rule by id.
   *
   * @param id - The rule id as a string (e.g. from a URL). It is converted to a
   *             number because pricing rules are keyed numerically in the store.
   * @returns The matching pricing rule, or `null` if none exists.
   */
  async getPricingRuleById(id: string) {
    return await this.pricingRuleRepository.findById(Number(id));
  }
}
