import { Injectable } from '@nestjs/common';

export interface PricingRule {
  rule_key: string;
  rule_value: number;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
  is_per_night: boolean;
}

export interface CamperPricingInput {
  basePrice: number;
  cleaningFee: number;
  depositAmount: number;
  startDate: Date;
  endDate: Date;
  pricingRules: PricingRule[];
  addons: Addon[];
}

export interface AddonDetail {
  id: string;
  name: string;
  cost: number;
  isPerNight: boolean;
  unitPrice: number;
}

export interface PriceCalculationResult {
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
  addonDetails: AddonDetail[];
  cleaningFee: number;
  depositAmount: number;
  totalAmount: number;
}

@Injectable()
export class CamperPricingCalculator {
  private readonly MIN_RENTAL_NIGHTS = 1;
  private readonly HIGH_SEASON_MONTHS = [5, 6, 7]; // June, July, August (0-indexed: 5, 6, 7)
  private readonly DEFAULT_RULES = {
    high_season_factor: 1.4,
    discount_level_1_days: 7,
    discount_level_1_factor: 0.95,
    discount_level_2_days: 14,
    discount_level_2_factor: 0.9,
  };

  calculate(input: CamperPricingInput): PriceCalculationResult {
    this.validateInput(input);

    const nights = this.calculateNights(input.startDate, input.endDate);

    if (nights < this.MIN_RENTAL_NIGHTS) {
      return this.getZeroResult();
    }

    const basePrice = input.basePrice || 0;
    const isHighSeason = this.isHighSeason(input.startDate);
    const seasonFactor = this.getSeasonFactor(isHighSeason);
    const discountFactor = this.getDiscountFactor(nights, input.pricingRules);

    const baseRentalPrice = basePrice * nights;
    const seasonSurchargeAmount = baseRentalPrice * (seasonFactor - 1.0);
    const priceAfterSurcharge = baseRentalPrice + seasonSurchargeAmount;
    const discountAmount = priceAfterSurcharge * (1.0 - discountFactor);
    const rawRentalPrice = priceAfterSurcharge - discountAmount;

    const { addonsTotal, addonDetails } = this.calculateAddons(
      input.addons,
      nights,
    );

    const cleaningFee = input.cleaningFee || 0;
    const totalAmount = rawRentalPrice + addonsTotal + cleaningFee;

    return {
      nights,
      basePrice,
      isHighSeason,
      seasonFactor,
      seasonSurchargeAmount,
      discountFactor,
      discountPercentage: Math.round((1 - discountFactor) * 100),
      discountAmount,
      rawRentalPrice,
      addonsTotal,
      addonDetails,
      cleaningFee,
      depositAmount: input.depositAmount,
      totalAmount: Math.max(0, totalAmount),
    };
  }

  private validateInput(input: CamperPricingInput): void {
    if (!input.startDate || !input.endDate) {
      throw new Error('Start and end dates are required');
    }
    if (input.startDate >= input.endDate) {
      throw new Error('Start date must be before end date');
    }
    if (input.basePrice < 0) {
      throw new Error('Base price must be non-negative');
    }
  }

  private calculateNights(startDate: Date, endDate: Date): number {
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const diffTime = endDate.getTime() - startDate.getTime();
    return Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));
  }

  private isHighSeason(startDate: Date): boolean {
    const month = startDate.getMonth();
    return this.HIGH_SEASON_MONTHS.includes(month);
  }

  private getSeasonFactor(isHighSeason: boolean): number {
    return isHighSeason ? this.getRule('high_season_factor') : 1.0;
  }

  private getDiscountFactor(
    nights: number,
    pricingRules: PricingRule[],
  ): number {
    const discountLevel2Days = this.getRuleValue(
      pricingRules,
      'discount_level_2_days',
      this.DEFAULT_RULES.discount_level_2_days,
    );
    const discountLevel2Factor = this.getRuleValue(
      pricingRules,
      'discount_level_2_factor',
      this.DEFAULT_RULES.discount_level_2_factor,
    );
    const discountLevel1Days = this.getRuleValue(
      pricingRules,
      'discount_level_1_days',
      this.DEFAULT_RULES.discount_level_1_days,
    );
    const discountLevel1Factor = this.getRuleValue(
      pricingRules,
      'discount_level_1_factor',
      this.DEFAULT_RULES.discount_level_1_factor,
    );

    if (nights >= discountLevel2Days) {
      return discountLevel2Factor;
    }
    if (nights >= discountLevel1Days) {
      return discountLevel1Factor;
    }
    return 1.0;
  }

  private calculateAddons(
    addons: Addon[],
    nights: number,
  ): { addonsTotal: number; addonDetails: AddonDetail[] } {
    let addonsTotal = 0;
    const addonDetails: AddonDetail[] = [];

    for (const addon of addons) {
      const price = addon.price || 0;
      const cost = addon.is_per_night ? price * nights : price;
      addonsTotal += cost;

      addonDetails.push({
        id: addon.id,
        name: addon.name,
        cost,
        isPerNight: addon.is_per_night,
        unitPrice: price,
      });
    }

    return { addonsTotal, addonDetails };
  }

  private getRule(ruleKey: string): number {
    return this.DEFAULT_RULES[ruleKey as keyof typeof this.DEFAULT_RULES] || 0;
  }

  private getRuleValue(
    pricingRules: PricingRule[],
    ruleKey: string,
    defaultVal: number,
  ): number {
    const rule = pricingRules.find((r) => r.rule_key === ruleKey);
    return rule ? Number(rule.rule_value) : defaultVal;
  }

  private getZeroResult(): PriceCalculationResult {
    return {
      nights: 0,
      basePrice: 0,
      isHighSeason: false,
      seasonFactor: 1.0,
      seasonSurchargeAmount: 0,
      discountFactor: 1.0,
      discountPercentage: 0,
      discountAmount: 0,
      rawRentalPrice: 0,
      addonsTotal: 0,
      addonDetails: [],
      cleaningFee: 0,
      depositAmount: 0,
      totalAmount: 0,
    };
  }
}
