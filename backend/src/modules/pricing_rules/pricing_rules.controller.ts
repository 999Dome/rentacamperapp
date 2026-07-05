import { Controller, Get } from '@nestjs/common';
import { PricingRulesService } from './pricing_rules.service';

/**
 * HTTP controller for pricing rules.
 *
 * All routes are mounted under the `pricing-rules` prefix. It delegates directly
 * to {@link PricingRulesService}.
 */
@Controller('pricing-rules')
export class PricingRulesController {
  constructor(private readonly pricingRulesService: PricingRulesService) {}

  /**
   * Lists all pricing rules.
   *
   * HTTP: `GET /pricing-rules/all`
   *
   * @returns All pricing rule records.
   */
  @Get('all')
  async getAll(): Promise<unknown> {
    return await this.pricingRulesService.getAllPricingRules();
  }
}
