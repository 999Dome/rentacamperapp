/**
 * A driver's license record as stored in the database.
 *
 * Each camper declares a `required_license` and each renter profile references
 * one of these; the booking flow compares them to decide whether a renter is
 * allowed to drive a given camper.
 */
export interface DriversLicense {
  id: string;
  /** License class code, e.g. "B", "C1", "C". */
  license_class: string;
  issuing_date: string;
  expiration_date: string;
  issuing_country: string;
  created_at: string;
  updated_at: string;
}

/**
 * Static rule describing what a license class permits. Kept as a domain type
 * so licence-eligibility logic can be expressed independently of the DB.
 */
export interface DriversLicenseValidationRule {
  classCode: string;
  /** Maximum vehicle weight (kg) this class is allowed to drive. */
  requiredForVehicleWeight: number;
  minimumAge: number;
  description: string;
}
