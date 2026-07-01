import type { Camper } from '../../types/interface';
import type { MockCamper } from '../../utils/mockData';
import { getCamperPrimaryImageById } from '../../api/camperImagesAPI';
import { getCamperFeaturesByCamperId } from '../../api/camperFeaturesAPI';
import { getDriversLicenseById } from '../../api/driversLicenseAPI';

/**
 * CamperDetailTransformer - Reine Datentransformation
 *
 * Single Responsibility: Nur Daten-Umwandlung von Camper → MockCamper
 * - Lädt zusätzliche Daten (Bilder, Features, Lizenzen) parallel
 * - Transformiert Datenstrukturen
 * - Keine UI-Logik, keine Geschäftslogik
 */
export class CamperDetailTransformer {
  private readonly defaultImageUrl = 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7';
  private readonly defaultFeatures = ['Küche', 'Heizung', 'Klimaanlage'];
  private readonly defaultLicenseClass = 'B';

  /**
   * Transformiert einen einzelnen Camper mit allen zusätzlichen Informationen
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
   * Transformiert mehrere Camper parallel
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
   * Lädt Bild für Camper (mit Fallback)
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
   * Lädt Features für Camper (mit Fallback)
   */
  private async loadFeatures(camperId: string): Promise<string[]> {
    try {
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
   * Lädt Führerscheinklasse (mit Fallback)
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
   * Hilfsfunktion für einheitliches Logging
   */
  private logLoadWarning(resource: string, id: string, error: unknown): void {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`Failed to load ${resource} for ${id}: ${message}`);
  }
}
