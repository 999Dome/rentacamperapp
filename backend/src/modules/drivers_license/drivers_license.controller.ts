import { Controller, Get, Param } from '@nestjs/common';
import { DriversLicenseService } from './drivers_license.service';

/**
 * HTTP controller for driver's license lookups.
 *
 * All routes are mounted under the `drivers-license` prefix. This controller is
 * deliberately thin: it only forwards requests to {@link DriversLicenseService}
 * (the NestJS equivalent of a Spring `@RestController` delegating to a service bean).
 */
@Controller('drivers-license')
export class DriversLicenseController {
  constructor(private readonly driversLicenseService: DriversLicenseService) {}

  /**
   * Fetches a single driver's license by its id.
   *
   * HTTP: `GET /drivers-license/:licenseId`
   *
   * @param licenseId - The license id taken from the URL path.
   * @returns The matching license record, or whatever the repository returns
   *          when nothing is found (typically `null`).
   */
  @Get(':licenseId')
  async getLicenseById(@Param('licenseId') licenseId: string) {
    return await this.driversLicenseService.findLicenseById(licenseId);
  }
}
