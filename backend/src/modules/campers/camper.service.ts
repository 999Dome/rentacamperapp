import { Injectable, Inject } from '@nestjs/common';
import {
  CampersRepository,
  CamperInsertInput,
  CamperUpdateInput,
} from '../../infrastructure/repositories/camper.repository';
import { CamperPricingCalculator } from '../../domain/services/camper-pricing.calculator';
import { DriversLicenseService } from '../drivers_license/drivers_license.service';
import { CampersConfigService } from '../../domain/services/campers-config.service';
import type { IPricingRuleRepository } from '../../infrastructure/repositories/pricing-rule.repository';
import { PRICING_RULE_REPOSITORY_TOKEN } from '../../infrastructure/repositories/pricing-rule.repository';
import type { IAddonRepository } from '../../infrastructure/repositories/addon.repository';
import { ADDON_REPOSITORY_TOKEN } from '../../infrastructure/repositories/addon.repository';

/** Input for a price-quote request coming from the controller. */
export interface PriceCalculationInput {
  camperId: string;
  /** Rental start as a string; accepts ISO or `DD.MM.YYYY` (see `parseDate`). */
  startDateStr: string;
  /** Rental end as a string; accepts ISO or `DD.MM.YYYY`. */
  endDateStr: string;
  selectedAddonIds?: string[];
}

/**
 * The price breakdown returned to the client. Mirrors the calculator's
 * `PriceCalculationResult`; kept as a separate type so the module's public
 * contract does not leak the domain layer's internal type.
 */
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

/**
 * Application service for campers.
 *
 * Handles browsing and CRUD by delegating to {@link CampersRepository}, and
 * assembles the inputs for price calculation: it gathers the camper, the DB
 * pricing rules and the selected add-ons, then hands them to the pure
 * {@link CamperPricingCalculator}. The service itself contains no pricing
 * maths — that lives in the domain calculator.
 */
@Injectable()
export class CampersService {
  constructor(
    private readonly campersRepository: CampersRepository,
    private readonly pricingCalculator: CamperPricingCalculator,
    private readonly configService: CampersConfigService,
    private readonly driversLicenseService: DriversLicenseService,
    @Inject(PRICING_RULE_REPOSITORY_TOKEN)
    private readonly pricingRuleRepository: IPricingRuleRepository,
    @Inject(ADDON_REPOSITORY_TOKEN)
    private readonly addonRepository: IAddonRepository,
  ) {}

  /**
   * Lists campers, optionally filtered.
   *
   * @param requiredLicense Optional exact license-class filter.
   * @param emissionsClass  Optional emissions-class filter.
   * @returns The matching campers.
   */
  async findAllCampers(requiredLicense?: string, emissionsClass?: string) {
    return await this.campersRepository.findAll(
      requiredLicense,
      emissionsClass,
    );
  }

  /**
   * Returns the homepage highlight campers, resolving the curated id list from
   * {@link CampersConfigService} and loading those campers.
   *
   * @returns The highlighted campers.
   */
  async findHighlights() {
    const highlightIds = this.configService.getHighlightCamperIds();
    return await this.campersRepository.findByIds(highlightIds);
  }

  /**
   * @param id The camper id.
   * @returns The camper.
   */
  async findById(id: string) {
    return await this.campersRepository.findById(id);
  }

  /**
   * Produces a price quote for a camper over a date range with add-ons.
   *
   * Gathers the three inputs the pure calculator needs — the camper (for base
   * price/fees), all pricing rules, and the selected add-ons — maps them to
   * the calculator's expected shape, and returns the resulting breakdown.
   *
   * @param input Camper id, date strings and selected add-on ids.
   * @returns The full price breakdown.
   * @throws Error If the camper is missing or a date string is unparseable.
   */
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

  /**
   * Creates a camper. @param dto Insert payload. @returns The created camper.
   */
  async create(dto: CamperInsertInput) {
    if (dto.required_license) {
      const resolved = await this.driversLicenseService.resolveLicenseId(dto.required_license);
      if (resolved) {
        dto.required_license = resolved;
      }
    }
    return await this.campersRepository.create(dto);
  }

  /**
   * Updates a camper. @param id Camper id. @param dto Update payload.
   * @returns The updated camper.
   */
  async update(id: string, dto: CamperUpdateInput) {
    if (dto.required_license) {
      const resolved = await this.driversLicenseService.resolveLicenseId(dto.required_license);
      if (resolved) {
        dto.required_license = resolved;
      }
    }
    return await this.campersRepository.update(id, dto);
  }

  /**
   * Deletes a camper. @param id Camper id. @returns The deleted camper.
   */
  async delete(id: string) {
    return await this.campersRepository.delete(id);
  }

  /** @returns All pricing rules from the repository. */
  private async fetchPricingRules() {
    return await this.pricingRuleRepository.findAll();
  }

  /**
   * @param addonIds Ids of add-ons to load.
   * @returns The matching add-ons (empty if none selected).
   */
  private async fetchAddons(addonIds: string[]) {
    return await this.addonRepository.findByIds(addonIds);
  }

  /**
   * Parses a date string into a `Date`, accepting two formats the frontend may
   * send: German `DD.MM.YYYY` and ISO. The dotted form is detected first
   * because `new Date('DD.MM.YYYY')` would otherwise misparse it.
   *
   * @param dateStr The date string to parse.
   * @returns The parsed date.
   * @throws Error If the string is not a valid date in either format.
   */
  private parseDate(dateStr: string): Date {
    // Support both DD.MM.YYYY and ISO formats
    if (dateStr.includes('.')) {
      // month - 1 because the JS Date constructor's month argument is 0-indexed.
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
