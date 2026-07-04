import { BaseAPIClient } from './base-api-client';
import type { Camper } from '../../types/interface';
import type { MockCamper } from '../../utils/mockData';

export interface PriceCalculationRequest {
  camperId: string;
  startDate: string;
  endDate: string;
  selectedAddonIds: string[];
}

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
 * CampersAPIClient - Spezialisiert auf Camper-spezifische API-Calls
 *
 * Diese Klasse folgt dem Single Responsibility Principle:
 * - Nur Camper-API-Operationen
 * - Fehlerbehandlung delegiert an BaseAPIClient
 * - Keine Geschäftslogik, reine API-Kommunikation
 */
export class CampersAPIClient extends BaseAPIClient {
  /**
   * Abrufen der Highlight-Camper (Homepage-Featured)
   */
  async getHighlightCampers(): Promise<Camper[]> {
    return await this.request<Camper[]>('campers/highlights');
  }

  /**
   * Abrufen eines einzelnen Campers nach ID
   */
  async getCamperById(id: string): Promise<Camper> {
    return await this.request<Camper>(`campers/${id}`);
  }

  /**
   * Abrufen aller verfügbaren Camper
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
   * Berechnung des Mietpreises mit allen Zusätzen
   */
  async calculatePrice(request: PriceCalculationRequest): Promise<PriceCalculationResponse> {
    return await this.request<PriceCalculationResponse>('campers/calculate-price', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Neuen Camper erstellen (Admin-Operation)
   */
  async createCamper(data: Partial<MockCamper>): Promise<MockCamper> {
    return await this.request<MockCamper>('campers/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Existierenden Camper aktualisieren (Admin-Operation)
   */
  async updateCamper(id: string, data: Partial<MockCamper>): Promise<MockCamper> {
    return await this.request<MockCamper>(`campers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Camper löschen (Admin-Operation)
   */
  async deleteCamper(id: string): Promise<unknown> {
    return await this.request<unknown>(`campers/${id}`, {
      method: 'DELETE',
    });
  }
}
