import type { MockCamper } from '../../utils/mockData';

/**
 * All the optional search/filter/sort inputs the camper listing page can
 * combine. Every field is optional so callers only need to set the ones the
 * user actually picked; unset fields are treated as "no restriction" by
 * {@link CamperFilterService.filterAndSort}.
 */
export interface CamperFilterCriteria {
  /** Free-text search matched against name, description and manufacturer. */
  query?: string;
  manufacturer?: string;
  /** One of `'Diesel'`, `'Benzine'` or `'Electric'`. */
  fuelType?: string;
  requiredLicense?: string;
  /** One of `'Elektro'` or `'Euro 6'`. */
  emissionsClass?: string;
  priceMin?: number;
  priceMax?: number;
  bedsMin?: number;
  bedsMax?: number;
  heightMax?: number;
  widthMax?: number;
  weightMax?: number;
  hasTowHitch?: boolean;
  /** Feature names that a camper must have ALL of to match. */
  selectedFeatures?: string[];
  providerType?: string;
  /** One of `'priceAsc'`, `'priceDesc'`, `'nameAsc'` or `'nameDesc'`. */
  sortVal?: string;
}

/**
 * Applies search/filter criteria to a list of campers and optionally sorts
 * the result, all in one pure, stateless pass. Used by the camper listing
 * page to turn the raw camper data plus the user's filter form into what
 * gets rendered. This class is used like a namespace/utility bag (its only
 * member is `static`), never instantiated.
 */
export class CamperFilterService {
  /**
   * Filters `campers` down to the ones matching every set field in
   * `criteria`, then sorts them if `criteria.sortVal` is set.
   * @param campers The full list of campers to filter.
   * @param criteria The filter/sort options selected by the user.
   * @returns A new array; the input array is not mutated.
   */
  static filterAndSort(campers: MockCamper[], criteria: CamperFilterCriteria): MockCamper[] {
    const {
      query,
      manufacturer,
      fuelType,
      requiredLicense,
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

      if (requiredLicense && camper.required_license !== requiredLicense) return false;

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
