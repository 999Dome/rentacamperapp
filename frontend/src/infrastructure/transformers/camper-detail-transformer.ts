import type { Camper } from '../../types/interface';
import type { MockCamper } from '../../utils/mockData';
import { getCamperPrimaryImageById } from '../../api/camperImagesAPI';
import { getCamperFeaturesByCamperId } from '../../api/camperFeaturesAPI';
import { getDriversLicenseById } from '../../api/driversLicenseAPI';

/**
 * CamperDetailTransformer - pure data transformation.
 *
 * Single responsibility: turn a `Camper` (as stored in the database) into a
 * `MockCamper` (the richer shape the UI expects) by:
 * - loading extra data (image, features, drivers-license class) in parallel;
 * - reshaping the combined data into the `MockCamper` structure.
 * It contains no UI logic and no business logic - just fetching and mapping.
 */
export class CamperDetailTransformer {
  private readonly defaultImageUrl = 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7';
  private readonly defaultFeatures = ['Küche', 'Heizung', 'Klimaanlage'];
  private readonly defaultLicenseClass = 'B';

  /**
   * Transforms a single camper, enriching it with its primary image,
   * feature list and drivers-license class (each with a sensible fallback
   * if that piece of data can't be loaded).
   * @param camper The raw camper record to enrich.
   * @returns The camper enriched into the `MockCamper` shape used by the UI.
   */
  async transformCamperWithDetails(camper: Camper): Promise<MockCamper> {
    const [imageUrl, features, licenseClass] = await Promise.all([
      this.loadImageUrl(camper.id),
      this.loadFeatures(camper.id),
      this.loadLicenseClass(camper.required_license as string),
    ]);

    return {
      ...camper,
      image_url: imageUrl,
      features_list: features,
      owner_id: 'user-1',
      license_name: licenseClass,
    };
  }

  /**
   * Transforms a list of campers in parallel by calling
   * {@link transformCamperWithDetails} for each one.
   * @param campers The raw camper records to enrich.
   * @returns The enriched campers, or an empty array if `campers` is empty
   * or the batch transformation fails.
   */
  async transformMultipleCampersWithDetails(campers: Camper[]): Promise<MockCamper[]> {
    if (!Array.isArray(campers) || campers.length === 0) {
      return [];
    }

    try {
      return await Promise.all(
        campers.map((camper) => this.transformCamperWithDetails(camper)),
      );
    } catch (error) {
      console.error('Error transforming campers:', error);
      return [];
    }
  }

  /**
   * Loads the camper's primary image, falling back to a default stock photo
   * if none is set or the request fails.
   * @param camperId ID of the camper to load the image for.
   */
  private async loadImageUrl(camperId: string): Promise<string> {
    try {
      const primaryImg = await getCamperPrimaryImageById(camperId);
      if (primaryImg?.image_path) {
        return primaryImg.image_path;
      }
    } catch (error) {
      this.logLoadWarning('primary image', camperId, error);
    }
    return this.defaultImageUrl;
  }

  /**
   * Loads the camper's feature names, falling back to a default feature
   * list if none are set or the request fails.
   * @param camperId ID of the camper to load features for.
   */
  private async loadFeatures(camperId: string): Promise<string[]> {
    try {
      // The generated `CamperFeature` type only describes the join-table row
      // (camper_id/feature_id/id), but the API actually embeds the related
      // `features` row (with its `name`) in each result - hence the cast.
      const features = (await getCamperFeaturesByCamperId(
        camperId,
      )) as unknown as { features?: { name: string } | null }[];

      const featureNames = features
        .map((f) => f.features?.name)
        .filter((name): name is string => typeof name === 'string');

      if (featureNames.length > 0) {
        return featureNames;
      }
    } catch (error) {
      this.logLoadWarning('features', camperId, error);
    }
    return this.defaultFeatures;
  }

  /**
   * Loads the drivers-license class required for the camper, falling back
   * to a default class if no ID is given, the record is missing, or the
   * request fails.
   * @param licenseId ID of the drivers-license record to look up.
   */
  private async loadLicenseClass(licenseId: string): Promise<string> {
    if (!licenseId) {
      return this.defaultLicenseClass;
    }

    try {
      const license = await getDriversLicenseById(licenseId);
      if (license?.class) {
        return license.class;
      }
    } catch (error) {
      this.logLoadWarning('drivers license', licenseId, error);
    }
    return this.defaultLicenseClass;
  }

  /**
   * Helper for consistent warning logs when an optional piece of detail
   * data fails to load and a fallback is used instead.
   * @param resource Short label for what failed to load, e.g. `'features'`.
   * @param id ID of the record the load was attempted for.
   * @param error The caught error (message is logged if it's an `Error`).
   */
  private logLoadWarning(resource: string, id: string, error: unknown): void {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`Failed to load ${resource} for ${id}: ${message}`);
  }
}
