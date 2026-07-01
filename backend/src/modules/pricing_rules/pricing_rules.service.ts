import { Injectable } from '@nestjs/common';
import { PricingRuleRepository } from '../../infrastructure/repositories/pricing-rule.repository';

@Injectable()
export class PricingRulesService {
  constructor(private readonly pricingRuleRepository: PricingRuleRepository) {}

  async getAllPricingRules() {
    return await this.pricingRuleRepository.findAll();
  }

  async getPricingRuleById(id: string) {
    return await this.pricingRuleRepository.findById(Number(id));
  }
}
