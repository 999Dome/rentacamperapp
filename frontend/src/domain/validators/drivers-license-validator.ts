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

export class DriversLicenseValidator {
  /**
   * Checks if the user's driver license class is sufficient to drive the camper.
   * Compares the hierarchical values of the license classes.
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
