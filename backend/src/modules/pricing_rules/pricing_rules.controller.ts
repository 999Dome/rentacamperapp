import { Controller, Get } from '@nestjs/common';
import { PricingRulesService } from './pricing_rules.service';

@Controller('pricing-rules')
export class PricingRulesController {
  constructor(private readonly pricingRulesService: PricingRulesService) {}

  @Get('all')
  async getAll(): Promise<unknown> {
    return await this.pricingRulesService.getAllPricingRules();
  }
}
