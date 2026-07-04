export interface DriversLicense {
  id: string;
  license_class: string;
  issuing_date: string;
  expiration_date: string;
  issuing_country: string;
  created_at: string;
  updated_at: string;
}

export interface DriversLicenseValidationRule {
  classCode: string;
  requiredForVehicleWeight: number;
  minimumAge: number;
  description: string;
}
