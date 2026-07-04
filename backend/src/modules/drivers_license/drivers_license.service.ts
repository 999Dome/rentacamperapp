import { Injectable, Inject } from '@nestjs/common';
import type { IDriversLicenseRepository } from '../../infrastructure/repositories/drivers-license.repository';
import { DRIVERS_LICENSE_REPOSITORY_TOKEN } from '../../infrastructure/repositories/drivers-license.repository';

@Injectable()
export class DriversLicenseService {
  constructor(
    @Inject(DRIVERS_LICENSE_REPOSITORY_TOKEN)
    private readonly driversLicenseRepository: IDriversLicenseRepository,
  ) {}

  async findLicenseById(driversLicenseId: string) {
    return await this.driversLicenseRepository.findById(driversLicenseId);
  }

  async hasSufficientLicense(
    userLicenseId: string | null,
    requiredLicenseId: string,
  ): Promise<boolean> {
    if (!requiredLicenseId) {
      return true;
    }
    if (!userLicenseId) {
      return false;
    }

    const [userLicense, requiredLicense] = await Promise.all([
      this.driversLicenseRepository.findById(userLicenseId),
      this.driversLicenseRepository.findById(requiredLicenseId),
    ]);

    const userVal = userLicense?.value ?? 0;
    const requiredVal = requiredLicense?.value ?? 0;

    return userVal >= requiredVal;
  }

  async resolveLicenseId(
    classOrId: string | null | undefined,
  ): Promise<string | null> {
    if (!classOrId) return null;

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(classOrId)) {
      return classOrId;
    }

    let normalized = classOrId.trim();
    if (!normalized.startsWith('Klasse ') && !normalized.startsWith('alte ')) {
      normalized = 'Klasse ' + normalized;
    }

    const allLicenses = await this.driversLicenseRepository.findAll();
    const found = allLicenses.find(
      (l) => l.class?.toLowerCase() === normalized.toLowerCase(),
    );

    return found ? found.id : null;
  }
}
