import type { MockCamper } from '../../utils/mockData';

export interface CamperFilterCriteria {
  query?: string;
  manufacturer?: string;
  fuelType?: string;
  emissionsClass?: string;
  priceMin?: number;
  priceMax?: number;
  bedsMin?: number;
  bedsMax?: number;
  heightMax?: number;
  widthMax?: number;
  weightMax?: number;
  hasTowHitch?: boolean;
  selectedFeatures?: string[];
  providerType?: string;
  sortVal?: string;
}

export class CamperFilterService {
  static filterAndSort(campers: MockCamper[], criteria: CamperFilterCriteria): MockCamper[] {
    const {
      query,
      manufacturer,
      fuelType,
      emissionsClass,
      priceMin = 0,
      priceMax = Infinity,
      bedsMin = 0,
      bedsMax = Infinity,
      heightMax = Infinity,
      widthMax = Infinity,
      weightMax = Infinity,
      hasTowHitch = false,
      selectedFeatures = [],
      providerType,
      sortVal,
    } = criteria;

    const queryLower = query?.toLowerCase().trim();

    const filtered = campers.filter((camper) => {
      if (queryLower) {
        const nameMatch = camper.name?.toLowerCase().includes(queryLower);
        const descMatch =
          camper.description?.toLowerCase().includes(queryLower) ||
          camper.short_desc?.toLowerCase().includes(queryLower);
        const manufacturerMatch = camper.manufacturer?.toLowerCase().includes(queryLower);
        if (!nameMatch && !descMatch && !manufacturerMatch) return false;
      }

      if (manufacturer && camper.manufacturer !== manufacturer) return false;

      if (fuelType) {
        if (fuelType === 'Diesel' && camper.fuel_type !== 'Diesel') return false;
        if (fuelType === 'Benzine' && !['Super', 'Super Plus', 'Super E10'].includes(camper.fuel_type)) return false;
        if (fuelType === 'Electric' && camper.fuel_consumption !== 0) return false;
      }

      if (emissionsClass) {
        if (emissionsClass === 'Elektro' && camper.fuel_consumption !== 0) return false;
        if (emissionsClass === 'Euro 6' && camper.fuel_consumption === 0) return false;
      }

      if (camper.price_per_night_base < priceMin || camper.price_per_night_base > priceMax) return false;

      const beds = camper.beds || 0;
      if (beds < bedsMin || beds > bedsMax) return false;

      if (heightMax && camper.height_cm && camper.height_cm > heightMax) return false;
      if (widthMax && camper.width_cm && camper.width_cm > widthMax) return false;
      if (weightMax && camper.max_weight_kg && camper.max_weight_kg > weightMax) return false;

      if (hasTowHitch && !camper.has_tow_hitch) return false;

      if (selectedFeatures.length > 0) {
        const hasAllFeatures = selectedFeatures.every((f) => camper.features_list?.includes(f) ?? false);
        if (!hasAllFeatures) return false;
      }

      if (providerType && camper.providerType !== providerType) {
        return false;
      }

      return true;
    });

    if (sortVal) {
      filtered.sort((a, b) => {
        if (sortVal === 'priceAsc') return a.price_per_night_base - b.price_per_night_base;
        if (sortVal === 'priceDesc') return b.price_per_night_base - a.price_per_night_base;
        if (sortVal === 'nameAsc') return (a.name || '').localeCompare(b.name || '');
        if (sortVal === 'nameDesc') return (b.name || '').localeCompare(a.name || '');
        return 0;
      });
    }

    return filtered;
  }
}
