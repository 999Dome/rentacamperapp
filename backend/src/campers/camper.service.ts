import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class CampersService {
  readonly highlight_camper_ids = [
    'be1d4ae1-e9bc-43b0-9a04-1d8c6dfec1a9',
    'a7c5978a-63c0-40f8-aecf-2a55ec670785',
    '33af45c5-0c50-4a20-b568-c14eed439614',
  ];
  readonly table = 'campers';

  constructor(private readonly supabase: SupabaseService) {}

  async findAllCampers() {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .select('*');

    if (error) throw new Error(error.message);
    return data;
  }

  async findHighlights() {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .select('*')
      .in('id', this.highlight_camper_ids);

    if (error) throw new Error(error.message);
    return data;
  }

  async findById(id: string) {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async calculatePrice(
    camperId: string,
    startDateStr: string,
    endDateStr: string,
    selectedAddonIds: string[] = [],
  ) {
    const { data: camper, error: camperError } = await this.supabase.client
      .from('campers')
      .select('price_per_night_base, cleaning_fee, deposit_amount')
      .eq('id', camperId)
      .single();
    if (camperError)
      throw new Error(`Camper not found: ${camperError.message}`);

    const { data: pricingRules, error: rulesError } = await this.supabase.client
      .from('pricing_rules')
      .select('*');
    if (rulesError)
      throw new Error(`Could not fetch pricing rules: ${rulesError.message}`);

    const getRule = (key: string, defaultVal: number) => {
      const rule = pricingRules.find((r) => r.rule_key === key);
      return rule ? Number(rule.rule_value) : defaultVal;
    };

    const highSeasonFactor = getRule('high_season_factor', 1.4);
    const discountLevel1Days = getRule('discount_level_1_days', 7);
    const discountLevel1Factor = getRule('discount_level_1_factor', 0.95);
    const discountLevel2Days = getRule('discount_level_2_days', 14);
    const discountLevel2Factor = getRule('discount_level_2_factor', 0.9);

    let addons: {
      id: string;
      name: string;
      price: number | string;
      is_per_night: boolean;
    }[] = [];
    if (selectedAddonIds && selectedAddonIds.length > 0) {
      const { data: addonData, error: addonError } = await this.supabase.client
        .from('addons')
        .select('*')
        .in('id', selectedAddonIds);
      if (addonError)
        throw new Error(`Could not fetch addons: ${addonError.message}`);
      addons = addonData || [];
    }

    let startObj: Date;
    let endObj: Date;

    if (startDateStr.includes('.') && endDateStr.includes('.')) {
      const [startDay, startMonth, startYear] = startDateStr
        .split('.')
        .map(Number);
      const [endDay, endMonth, endYear] = endDateStr.split('.').map(Number);
      startObj = new Date(startYear, startMonth - 1, startDay);
      endObj = new Date(endYear, endMonth - 1, endDay);
    } else {
      startObj = new Date(startDateStr);
      endObj = new Date(endDateStr);
    }

    if (isNaN(startObj.getTime()) || isNaN(endObj.getTime())) {
      throw new Error('Invalid dates provided');
    }

    startObj.setHours(0, 0, 0, 0);
    endObj.setHours(0, 0, 0, 0);

    const diffTime = endObj.getTime() - startObj.getTime();
    const nights = Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));

    if (nights === 0) {
      return { nights: 0, totalAmount: 0 };
    }

    const startMonth0 = startObj.getMonth();
    const isHighSeason = startMonth0 >= 5 && startMonth0 <= 7;
    const currentSeasonFactor = isHighSeason ? highSeasonFactor : 1.0;

    let currentDiscountFactor = 1.0;
    if (nights >= discountLevel2Days) {
      currentDiscountFactor = discountLevel2Factor;
    } else if (nights >= discountLevel1Days) {
      currentDiscountFactor = discountLevel1Factor;
    }

    const basePrice = Number(camper.price_per_night_base) || 0;
    const baseRentalPrice = basePrice * nights;
    const seasonSurchargeAmount = baseRentalPrice * (currentSeasonFactor - 1.0);
    const priceAfterSurcharge = baseRentalPrice + seasonSurchargeAmount;
    const discountAmount = priceAfterSurcharge * (1.0 - currentDiscountFactor);
    const rawRentalPrice = priceAfterSurcharge - discountAmount;

    let addonsTotal = 0;
    const addonDetails = addons.map((addon) => {
      const price = Number(addon.price) || 0;
      const cost = addon.is_per_night ? price * nights : price;
      addonsTotal += cost;
      return {
        id: addon.id,
        name: addon.name,
        cost,
        isPerNight: addon.is_per_night,
        unitPrice: price,
      };
    });

    const cleaningFee = Number(camper.cleaning_fee) || 0;
    const totalAmount = rawRentalPrice + addonsTotal + cleaningFee;

    return {
      nights,
      basePrice,
      isHighSeason,
      seasonFactor: currentSeasonFactor,
      seasonSurchargeAmount,
      discountFactor: currentDiscountFactor,
      discountPercentage: Math.round((1 - currentDiscountFactor) * 100),
      discountAmount,
      rawRentalPrice,
      addonsTotal,
      addonDetails,
      cleaningFee,
      depositAmount: Number(camper.deposit_amount) || 0,
      totalAmount,
    };
  }

  async create(dto: any) {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .insert(dto)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, dto: any) {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: string) {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
