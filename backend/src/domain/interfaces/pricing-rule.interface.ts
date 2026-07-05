/**
 * A configurable pricing rule row from the database.
 *
 * These parameters drive {@link PricingCalculatorService} so that price logic
 * (seasonal surcharge, long-term discount, minimum stay) can be tuned without
 * code changes.
 */
export interface PricingRule {
  id: string;
  base_price_per_day: number;
  /** Multiplier applied during the defined high season (e.g. 1.4 = +40%). */
  seasonal_factor: number;
  /** Inclusive month range (1–12) in which the seasonal factor applies. */
  season_start_month: number;
  season_end_month: number;
  minimum_rental_days: number;
  /** Discount granted for long rentals, in percent (0–100). */
  discount_percentage_for_long_term?: number;
  /** Number of rental days at/above which the long-term discount kicks in. */
  long_term_threshold_days?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Input for a single price calculation performed by
 * {@link PricingCalculatorService.calculateRentalPrice}.
 */
export interface PricingCalculationInput {
  basePrice: number;
  rentalDays: number;
  /** Seasonal multiplier already resolved for the rental period. */
  seasonalFactor: number;
  /** Optional discount to subtract, in percent (0–100). */
  discountPercentage?: number;
}

/**
 * Result of a price calculation, broken down so the UI can show a transparent
 * price breakdown (subtotal → discount → total).
 */
export interface PricingCalculationResult {
  subtotalBeforeDiscount: number;
  discountAmount: number;
  /** Final price, never negative. */
  totalPrice: number;
}
