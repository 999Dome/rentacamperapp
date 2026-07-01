import { Injectable } from '@nestjs/common';
import {
  PricingCalculationInput,
  PricingCalculationResult,
  PricingRule,
} from '../interfaces/pricing-rule.interface';
import { ValidationException } from '../exceptions/domain.exception';

@Injectable()
export class PricingCalculatorService {
  private readonly MIN_RENTAL_DAYS = 1;
  private readonly MAX_SEASONAL_FACTOR = 2.0;
  private readonly MIN_SEASONAL_FACTOR = 0.5;

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

  isLongTermRental(rentalDays: number, rule: PricingRule): boolean {
    return (
      rentalDays >= (rule.long_term_threshold_days ?? Infinity) &&
      (rule.discount_percentage_for_long_term ?? 0) > 0
    );
  }

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

  private calculateSubtotal(
    basePrice: number,
    rentalDays: number,
    seasonalFactor: number,
  ): number {
    return basePrice * rentalDays * seasonalFactor;
  }

  private calculateDiscountAmount(
    price: number,
    discountPercentage: number,
  ): number {
    return (price * discountPercentage) / 100;
  }
}
