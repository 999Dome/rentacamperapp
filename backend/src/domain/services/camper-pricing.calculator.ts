import { Injectable } from '@nestjs/common';

/**
 * A key/value pricing rule as loaded from the `pricing_rules` table, e.g.
 * `{ rule_key: 'high_season_factor', rule_value: 1.4 }`.
 */
export interface PricingRule {
  rule_key: string;
  rule_value: number;
}

/** An optional extra that can be added to a booking (e.g. bike rack, bedding). */
export interface Addon {
  id: string;
  name: string;
  price: number;
  /** When `true` the price is charged per night, otherwise once per booking. */
  is_per_night: boolean;
}

/** Everything the calculator needs to price one camper booking. */
export interface CamperPricingInput {
  /** Nightly base price of the camper. */
  basePrice: number;
  /** One-off cleaning fee added to every booking. */
  cleaningFee: number;
  /** Refundable deposit; passed through to the result, not part of the total. */
  depositAmount: number;
  startDate: Date;
  endDate: Date;
  /** Rules loaded from the DB; missing keys fall back to {@link DEFAULT_RULES}. */
  pricingRules: PricingRule[];
  addons: Addon[];
}

/** Per-add-on line item in the price breakdown. */
export interface AddonDetail {
  id: string;
  name: string;
  /** Total cost of this add-on for the whole booking. */
  cost: number;
  isPerNight: boolean;
  /** The add-on's unit price (per night or per booking). */
  unitPrice: number;
}

/**
 * Fully itemised pricing result. Every intermediate value is exposed so the
 * frontend can render a transparent breakdown and so the numbers can be
 * asserted in unit tests.
 */
export interface PriceCalculationResult {
  nights: number;
  basePrice: number;
  isHighSeason: boolean;
  /** Seasonal multiplier applied (1.0 outside high season). */
  seasonFactor: number;
  /** EUR added on top of the base rental due to the seasonal surcharge. */
  seasonSurchargeAmount: number;
  /** Multiplier applied for the long-stay discount (1.0 = no discount). */
  discountFactor: number;
  /** The discount expressed as a whole percentage, for display. */
  discountPercentage: number;
  /** EUR subtracted due to the long-stay discount. */
  discountAmount: number;
  /** Rental price after surcharge and discount, excluding add-ons/cleaning. */
  rawRentalPrice: number;
  addonsTotal: number;
  addonDetails: AddonDetail[];
  cleaningFee: number;
  depositAmount: number;
  /** Final amount payable (rental + add-ons + cleaning), never negative. */
  totalAmount: number;
}

/**
 * Core, framework-agnostic engine that prices a single camper booking.
 *
 * The pricing formula, in order:
 *   1. nights = (endDate − startDate)
 *   2. base rental = basePrice × nights
 *   3. + seasonal surcharge if the start date falls in high season
 *   4. − long-stay discount based on the number of nights (tiered)
 *   5. + add-ons (per-night or flat) + one-off cleaning fee
 *
 * All rule values (season factor, discount tiers) come from the DB but fall
 * back to {@link DEFAULT_RULES} when a rule is missing, so pricing never breaks
 * on incomplete config. The class holds no external state, which keeps it pure
 * and easy to unit test.
 */
@Injectable()
export class CamperPricingCalculator {
  /** A booking must cover at least this many nights to be priced. */
  private readonly MIN_RENTAL_NIGHTS = 1;
  /** Months counted as high season. NOTE: JS months are 0-indexed → Jun/Jul/Aug. */
  private readonly HIGH_SEASON_MONTHS = [5, 6, 7];
  /** Fallback rule values used whenever a rule is absent from the DB. */
  private readonly DEFAULT_RULES = {
    high_season_factor: 1.4,
    discount_level_1_days: 7,
    discount_level_1_factor: 0.95,
    discount_level_2_days: 14,
    discount_level_2_factor: 0.9,
  };

  /**
   * Prices a booking end-to-end and returns a full breakdown.
   *
   * @param input Camper prices, date range, DB pricing rules and add-ons.
   * @returns The itemised {@link PriceCalculationResult}; an all-zero result if
   *          the range is shorter than {@link MIN_RENTAL_NIGHTS}.
   * @throws Error If dates are missing/invalid or the base price is negative.
   */
  calculate(input: CamperPricingInput): PriceCalculationResult {
    this.validateInput(input);

    const nights = this.calculateNights(input.startDate, input.endDate);

    // A zero/negative-night range is not a priceable booking → return zeros
    // rather than throwing, so callers can render an empty breakdown.
    if (nights < this.MIN_RENTAL_NIGHTS) {
      return this.getZeroResult();
    }

    const basePrice = input.basePrice || 0;
    const isHighSeason = this.isHighSeason(input.startDate);
    const seasonFactor = this.getSeasonFactor(isHighSeason);
    const discountFactor = this.getDiscountFactor(nights, input.pricingRules);

    // Build the price up step by step so each component is auditable.
    const baseRentalPrice = basePrice * nights;
    const seasonSurchargeAmount = baseRentalPrice * (seasonFactor - 1.0);
    const priceAfterSurcharge = baseRentalPrice + seasonSurchargeAmount;
    // discountFactor is a multiplier (e.g. 0.9); (1 - factor) is the cut taken.
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

  /**
   * Rejects inputs that would produce a nonsensical price.
   *
   * @param input The pricing input to validate.
   * @throws Error If dates are missing, out of order, or base price is negative.
   */
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

  /**
   * Counts the number of nights between two dates.
   *
   * @returns Whole nights (rounded); zero if the range is empty/negative.
   *          Times are normalised to midnight first so that a differing
   *          time-of-day does not skew the day count.
   */
  private calculateNights(startDate: Date, endDate: Date): number {
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const diffTime = endDate.getTime() - startDate.getTime();
    return Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));
  }

  /**
   * @returns `true` if the booking's start month is in {@link HIGH_SEASON_MONTHS}.
   */
  private isHighSeason(startDate: Date): boolean {
    const month = startDate.getMonth();
    return this.HIGH_SEASON_MONTHS.includes(month);
  }

  /**
   * @returns The seasonal multiplier: the configured high-season factor, or
   *          1.0 (no surcharge) outside high season.
   */
  private getSeasonFactor(isHighSeason: boolean): number {
    return isHighSeason ? this.getRule('high_season_factor') : 1.0;
  }

  /**
   * Resolves the long-stay discount multiplier for a given number of nights.
   *
   * Two tiers are checked from longest to shortest so the biggest applicable
   * discount wins: level 2 (e.g. 14+ nights) before level 1 (e.g. 7+ nights).
   *
   * @param nights       Number of nights booked.
   * @param pricingRules DB rules; missing values fall back to defaults.
   * @returns A multiplier ≤ 1.0 (e.g. 0.9 = 10% off); 1.0 when no tier matches.
   */
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

  /**
   * Totals the selected add-ons and produces a per-item breakdown.
   *
   * Per-night add-ons are multiplied by the number of nights; flat add-ons are
   * charged once.
   *
   * @param addons The add-ons selected for the booking.
   * @param nights Number of nights, used for per-night pricing.
   * @returns The combined add-on total and a detailed list of line items.
   */
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

  /**
   * Looks up a hard-coded default rule value by key.
   *
   * @returns The default value, or 0 if the key is unknown.
   */
  private getRule(ruleKey: string): number {
    return this.DEFAULT_RULES[ruleKey as keyof typeof this.DEFAULT_RULES] || 0;
  }

  /**
   * Reads a rule value from the DB-provided rules, with a fallback.
   *
   * @param pricingRules Rules loaded from the DB.
   * @param ruleKey      The rule to look up.
   * @param defaultVal   Value to use when the rule is absent.
   * @returns The rule value coerced to a number, or `defaultVal`.
   */
  private getRuleValue(
    pricingRules: PricingRule[],
    ruleKey: string,
    defaultVal: number,
  ): number {
    const rule = pricingRules.find((r) => r.rule_key === ruleKey);
    return rule ? Number(rule.rule_value) : defaultVal;
  }

  /**
   * @returns A neutral, all-zero result used when there is nothing to price
   *          (e.g. a zero-night range). Keeps the return type consistent so
   *          callers never have to null-check.
   */
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
