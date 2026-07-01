import { Controller, Get, Param } from '@nestjs/common';
import { DriversLicenseService } from './drivers_license.service';

@Controller('drivers-license')
export class DriversLicenseController {
  constructor(private readonly driversLicenseService: DriversLicenseService) {}

  @Get(':licenseId')
  async getLicenseById(@Param('licenseId') licenseId: string) {
    return await this.driversLicenseService.findLicenseById(licenseId);
  }
}
