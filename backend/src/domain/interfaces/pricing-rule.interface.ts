export interface PricingRule {
  id: string;
  base_price_per_day: number;
  seasonal_factor: number;
  season_start_month: number;
  season_end_month: number;
  minimum_rental_days: number;
  discount_percentage_for_long_term?: number;
  long_term_threshold_days?: number;
  created_at: string;
  updated_at: string;
}

export interface PricingCalculationInput {
  basePrice: number;
  rentalDays: number;
  seasonalFactor: number;
  discountPercentage?: number;
}

export interface PricingCalculationResult {
  subtotalBeforeDiscount: number;
  discountAmount: number;
  totalPrice: number;
}
