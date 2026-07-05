import { BaseAPIClient } from './base-api-client';
import type { Camper } from '../../types/interface';
import type { MockCamper } from '../../utils/mockData';

/**
 * Input for a price calculation request: which camper, which date range,
 * and which optional add-ons the user selected.
 */
export interface PriceCalculationRequest {
  camperId: string;
  startDate: string;
  endDate: string;
  selectedAddonIds: string[];
}

/**
 * Full breakdown of a calculated rental price, including seasonal
 * surcharges, discounts, add-on costs, cleaning fee and deposit.
 */
export interface PriceCalculationResponse {
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
 * API client specialized in camper-related backend calls (fetching,
 * creating, updating, deleting campers, and price calculation).
 *
 * Follows the Single Responsibility Principle:
 * - Only handles camper API operations.
 * - Error handling is delegated to `BaseAPIClient`.
 * - No business logic here, just API communication.
 */
export class CampersAPIClient extends BaseAPIClient {
  /**
   * Fetches the highlighted campers used for the homepage's featured section.
   * @returns The list of highlighted campers.
   */
  async getHighlightCampers(): Promise<Camper[]> {
    return await this.request<Camper[]>('campers/highlights');
  }

  /**
   * Fetches a single camper by its ID.
   * @param id - ID of the camper to fetch.
   * @returns The matching camper.
   */
  async getCamperById(id: string): Promise<Camper> {
    return await this.request<Camper>(`campers/${id}`);
  }

  /**
   * Fetches all available campers, optionally narrowed down by filters.
   * @param filters - Optional filters for required driver's license and/or emissions class.
   * @returns The list of campers matching the filters (or all campers if no filters given).
   */
  async getAllCampers(filters?: { requiredLicense?: string; emissionsClass?: string }): Promise<Camper[]> {
    let url = 'campers/all';
    if (filters) {
      const params = new URLSearchParams();
      if (filters.requiredLicense) params.append('requiredLicense', filters.requiredLicense);
      if (filters.emissionsClass) params.append('emissionsClass', filters.emissionsClass);
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    return await this.request<Camper[]>(url);
  }

  /**
   * Calculates the total rental price for a camper, including all
   * selected add-ons, seasonal surcharges, discounts, and fees.
   * @param request - Camper, date range, and selected add-ons to price.
   * @returns The full price breakdown.
   */
  async calculatePrice(request: PriceCalculationRequest): Promise<PriceCalculationResponse> {
    return await this.request<PriceCalculationResponse>('campers/calculate-price', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Creates a new camper. Admin-only operation.
   * @param data - Partial camper data to create.
   * @returns The newly created camper.
   */
  async createCamper(data: Partial<MockCamper>): Promise<MockCamper> {
    return await this.request<MockCamper>('campers/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Updates an existing camper. Admin-only operation.
   * @param id - ID of the camper to update.
   * @param data - Partial camper fields to update.
   * @returns The updated camper.
   */
  async updateCamper(id: string, data: Partial<MockCamper>): Promise<MockCamper> {
    return await this.request<MockCamper>(`campers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Deletes a camper. Admin-only operation.
   * @param id - ID of the camper to delete.
   */
  async deleteCamper(id: string): Promise<unknown> {
    return await this.request<unknown>(`campers/${id}`, {
      method: 'DELETE',
    });
  }
}
