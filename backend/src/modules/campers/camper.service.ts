import { Injectable, Inject } from '@nestjs/common';
import {
  CampersRepository,
  CamperInsertInput,
  CamperUpdateInput,
} from '../../infrastructure/repositories/camper.repository';
import { CamperPricingCalculator } from '../../domain/services/camper-pricing.calculator';
import { CampersConfigService } from '../../domain/services/campers-config.service';
import type { IPricingRuleRepository } from '../../infrastructure/repositories/pricing-rule.repository';
import { PRICING_RULE_REPOSITORY_TOKEN } from '../../infrastructure/repositories/pricing-rule.repository';
import type { IAddonRepository } from '../../infrastructure/repositories/addon.repository';
import { ADDON_REPOSITORY_TOKEN } from '../../infrastructure/repositories/addon.repository';

export interface PriceCalculationInput {
  camperId: string;
  startDateStr: string;
  endDateStr: string;
  selectedAddonIds?: string[];
}

export interface PriceCalculationOutput {
  nights: number;
  basePrice: number;
  isHighSeason: boolean;
  seasonFactor: number;
  seasonSurchargeAmount: number;
  discountFactor: number;
  discountPercentage: number;
  discountAmount: number;
  rawRentalPrice: number;
  addonsTotal: number;
  addonDetails: Array<{
    id: string;
    name: string;
    cost: number;
    isPerNight: boolean;
    unitPrice: number;
  }>;
  cleaningFee: number;
  depositAmount: number;
  totalAmount: number;
}

@Injectable()
export class CampersService {
  constructor(
    private readonly campersRepository: CampersRepository,
    private readonly pricingCalculator: CamperPricingCalculator,
    private readonly configService: CampersConfigService,
    @Inject(PRICING_RULE_REPOSITORY_TOKEN)
    private readonly pricingRuleRepository: IPricingRuleRepository,
    @Inject(ADDON_REPOSITORY_TOKEN)
    private readonly addonRepository: IAddonRepository,
  ) {}

  async findAllCampers() {
    return await this.campersRepository.findAll();
  }

  async findHighlights() {
    const highlightIds = this.configService.getHighlightCamperIds();
    return await this.campersRepository.findByIds(highlightIds);
  }

  async findById(id: string) {
    return await this.campersRepository.findById(id);
  }

  async calculatePrice(
    input: PriceCalculationInput,
  ): Promise<PriceCalculationOutput> {
    const camper = await this.campersRepository.findById(input.camperId);
    const pricingRules = await this.fetchPricingRules();
    const addons = await this.fetchAddons(input.selectedAddonIds ?? []);

    const startDate = this.parseDate(input.startDateStr);
    const endDate = this.parseDate(input.endDateStr);

    const result = this.pricingCalculator.calculate({
      basePrice: camper.price_per_night_base,
      cleaningFee: camper.cleaning_fee,
      depositAmount: camper.deposit_amount,
      startDate,
      endDate,
      pricingRules: pricingRules.map((rule) => ({
        rule_key: rule.rule_key,
        rule_value: rule.rule_value,
      })),
      addons: addons.map((addon) => ({
        id: addon.id,
        name: addon.name,
        price: addon.price,
        is_per_night: addon.is_per_night,
      })),
    });

    return result;
  }

  async create(dto: CamperInsertInput) {
    return await this.campersRepository.create(dto);
  }

  async update(id: string, dto: CamperUpdateInput) {
    return await this.campersRepository.update(id, dto);
  }

  async delete(id: string) {
    return await this.campersRepository.delete(id);
  }

  private async fetchPricingRules() {
    return await this.pricingRuleRepository.findAll();
  }

  private async fetchAddons(addonIds: string[]) {
    return await this.addonRepository.findByIds(addonIds);
  }

  private parseDate(dateStr: string): Date {
    // Support both DD.MM.YYYY and ISO formats
    if (dateStr.includes('.')) {
      const [day, month, year] = dateStr.split('.').map(Number);
      const date = new Date(year, month - 1, day);
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date format: ${dateStr}`);
      }
      return date;
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date format: ${dateStr}`);
    }
    return date;
  }
}
