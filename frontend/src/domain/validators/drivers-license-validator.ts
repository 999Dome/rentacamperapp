/**
 * Maps every driver's license class we support to a numeric "rank".
 * A higher number means the license allows driving heavier/bigger vehicles.
 * Both the modern class names (e.g. "B") and the German long-form names
 * (e.g. "Klasse B") map to the same rank, and old East-German-era classes
 * ("alte Klasse 3", "alte Klasse 2") are mapped to their closest modern
 * equivalent so they compare correctly too.
 */
const LICENSE_VALUES: Record<string, number> = {
  'Klasse B': 100,
  'Klasse B96': 200,
  'Klasse BE': 300,
  'Klasse C1': 400,
  'Klasse C1E': 500,
  'alte Klasse 3': 500,
  'Klasse C': 600,
  'Klasse CE': 700,
  'alte Klasse 2': 700,
  'B': 100,
  'B96': 200,
  'BE': 300,
  'C1': 400,
  'C1E': 500,
  'C': 600,
  'CE': 700,
};

/**
 * Domain rule for deciding whether a driver's license is "big enough" to
 * drive a given camper. Driver's license classes in Germany form a rough
 * hierarchy (e.g. class C allows everything class B does, plus more), so
 * comparing them can be done with a simple numeric ranking instead of a
 * complicated set of if/else rules.
 */
export class DriversLicenseValidator {
  /**
   * Checks if the user's driver license class is sufficient to drive the camper.
   * Compares the hierarchical values of the license classes.
   *
   * @param userLicenseClass The license class the user currently holds, or
   *   `null`/`undefined` if unknown.
   * @param requiredLicenseClass The license class required to drive the
   *   camper. If not set, no license is required.
   * @returns `true` if the user is allowed to drive the camper, `false` otherwise.
   */
  static isLicensedToDrive(
    userLicenseClass: string | null | undefined,
    requiredLicenseClass: string | null | undefined,
  ): boolean {
    if (!requiredLicenseClass) {
      return true;
    }
    if (!userLicenseClass) {
      return false;
    }

    const userVal = LICENSE_VALUES[userLicenseClass] || 0;
    const requiredVal = LICENSE_VALUES[requiredLicenseClass] || 0;

    return userVal >= requiredVal;
  }
}
