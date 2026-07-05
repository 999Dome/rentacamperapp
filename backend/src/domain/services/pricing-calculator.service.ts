import { Injectable } from '@nestjs/common';
import {
  PricingCalculationInput,
  PricingCalculationResult,
  PricingRule,
} from '../interfaces/pricing-rule.interface';
import { ValidationException } from '../exceptions/domain.exception';

/**
 * Pure, generic rental-price calculator driven by {@link PricingRule} values.
 *
 * "Pure" means it has no dependencies (no DB, no framework state) — given the
 * same input it always returns the same result, which makes it trivial to unit
 * test. It applies: base price × days × seasonal factor, then subtracts a
 * percentage discount.
 *
 * Note: this is the generic engine. The camper-specific rules (fixed high
 * season months, tiered night discounts, add-ons) live in
 * {@link CamperPricingCalculator}, which is what the camper flow actually uses.
 */
@Injectable()
export class PricingCalculatorService {
  /** A rental must span at least this many days to be valid. */
  private readonly MIN_RENTAL_DAYS = 1;
  /** Guard rails so a misconfigured rule cannot double the price or more. */
  private readonly MAX_SEASONAL_FACTOR = 2.0;
  private readonly MIN_SEASONAL_FACTOR = 0.5;

  /**
   * Calculates the total rental price with an itemised breakdown.
   *
   * @param input Base price, rental days, seasonal factor and optional discount.
   * @returns Subtotal, discount amount and final (non-negative) total price.
   * @throws ValidationException If any input is out of its allowed range.
   */
  calculateRentalPrice(
    input: PricingCalculationInput,
  ): PricingCalculationResult {
    this.validateCalculationInput(input);

    const subtotalBeforeDiscount = this.calculateSubtotal(
      input.basePrice,
      input.rentalDays,
      input.seasonalFactor,
    );

    const discountAmount = this.calculateDiscountAmount(
      subtotalBeforeDiscount,
      input.discountPercentage ?? 0,
    );

    const totalPrice = subtotalBeforeDiscount - discountAmount;

    return {
      subtotalBeforeDiscount,
      discountAmount,
      totalPrice: Math.max(0, totalPrice),
    };
  }

  /**
   * Decides whether a rental qualifies for the long-term discount.
   *
   * @param rentalDays Number of days the camper is rented for.
   * @param rule       The pricing rule holding the threshold/discount config.
   * @returns `true` only if the stay reaches the threshold AND a positive
   *          long-term discount is configured.
   */
  isLongTermRental(rentalDays: number, rule: PricingRule): boolean {
    return (
      rentalDays >= (rule.long_term_threshold_days ?? Infinity) &&
      (rule.discount_percentage_for_long_term ?? 0) > 0
    );
  }

  /**
   * Ensures a seasonal factor stays within the configured guard rails.
   *
   * @param factor The multiplier to validate.
   * @throws ValidationException If the factor is outside
   *         [{@link MIN_SEASONAL_FACTOR}, {@link MAX_SEASONAL_FACTOR}].
   */
  validateSeasonalFactor(factor: number): void {
    if (
      factor < this.MIN_SEASONAL_FACTOR ||
      factor > this.MAX_SEASONAL_FACTOR
    ) {
      throw new ValidationException(
        `Seasonal factor must be between ${this.MIN_SEASONAL_FACTOR} and ${this.MAX_SEASONAL_FACTOR}`,
        'seasonal_factor',
      );
    }
  }

  /**
   * Validates every field of a calculation input before any maths runs, so
   * failures point at the exact offending field instead of producing a
   * silently wrong price.
   *
   * @param input The calculation input to check.
   * @throws ValidationException On the first invalid field encountered.
   */
  private validateCalculationInput(input: PricingCalculationInput): void {
    if (input.basePrice < 0) {
      throw new ValidationException(
        'Base price cannot be negative',
        'basePrice',
      );
    }
    if (input.rentalDays < this.MIN_RENTAL_DAYS) {
      throw new ValidationException(
        `Rental days must be at least ${this.MIN_RENTAL_DAYS}`,
        'rentalDays',
      );
    }
    if (
      input.seasonalFactor < this.MIN_SEASONAL_FACTOR ||
      input.seasonalFactor > this.MAX_SEASONAL_FACTOR
    ) {
      throw new ValidationException(
        `Seasonal factor must be between ${this.MIN_SEASONAL_FACTOR} and ${this.MAX_SEASONAL_FACTOR}`,
        'seasonalFactor',
      );
    }
    if (
      (input.discountPercentage ?? 0) < 0 ||
      (input.discountPercentage ?? 0) > 100
    ) {
      throw new ValidationException(
        'Discount percentage must be between 0 and 100',
        'discountPercentage',
      );
    }
  }

  /**
   * @returns The pre-discount subtotal: base price × days × seasonal factor.
   */
  private calculateSubtotal(
    basePrice: number,
    rentalDays: number,
    seasonalFactor: number,
  ): number {
    return basePrice * rentalDays * seasonalFactor;
  }

  /**
   * @returns The absolute discount amount for a given percentage of `price`.
   */
  private calculateDiscountAmount(
    price: number,
    discountPercentage: number,
  ): number {
    return (price * discountPercentage) / 100;
  }
}
