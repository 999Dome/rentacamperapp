import { Injectable, Inject } from '@nestjs/common';
import type { IDriversLicenseRepository } from '../../infrastructure/repositories/drivers-license.repository';
import { DRIVERS_LICENSE_REPOSITORY_TOKEN } from '../../infrastructure/repositories/drivers-license.repository';

/**
 * Business logic around driver's licenses.
 *
 * Besides plain lookups, this service owns the license-eligibility rules that the
 * booking flow relies on: deciding whether a user's license is good enough to
 * rent a given vehicle, and translating human-facing license-class labels (e.g.
 * "B", "Klasse C1") into the stable license id used elsewhere.
 *
 * The repository is injected via a DI token rather than a concrete class (the
 * NestJS way of programming against an interface, like injecting a Spring bean by
 * interface type). See {@link IDriversLicenseRepository}.
 */
@Injectable()
export class DriversLicenseService {
  constructor(
    @Inject(DRIVERS_LICENSE_REPOSITORY_TOKEN)
    private readonly driversLicenseRepository: IDriversLicenseRepository,
  ) {}

  /**
   * Loads a single license record by its id.
   *
   * @param driversLicenseId - The license id to look up.
   * @returns The license record, or `null` when no license matches.
   */
  async findLicenseById(driversLicenseId: string) {
    return await this.driversLicenseRepository.findById(driversLicenseId);
  }

  /**
   * Decides whether the user's license is sufficient to satisfy a required license.
   *
   * The comparison is based on each license's numeric `value`, which encodes the
   * license-class hierarchy: a higher `value` represents a "broader" class that
   * also covers everything below it (e.g. a truck class covers ordinary cars).
   * A user is eligible when their license value is greater than or equal to the
   * required one, so we never need per-class special-casing here.
   *
   * @param userLicenseId - The user's license id, or `null` if they have none.
   * @param requiredLicenseId - The license id demanded by the vehicle/booking.
   * @returns `true` if the user is allowed, `false` otherwise.
   */
  async hasSufficientLicense(
    userLicenseId: string | null,
    requiredLicenseId: string,
  ): Promise<boolean> {
    // No requirement means anyone qualifies, even a user without a license.
    if (!requiredLicenseId) {
      return true;
    }
    // A requirement exists but the user has no license, so they cannot qualify.
    if (!userLicenseId) {
      return false;
    }

    // Fetch both records in parallel; we only need their numeric values to compare.
    const [userLicense, requiredLicense] = await Promise.all([
      this.driversLicenseRepository.findById(userLicenseId),
      this.driversLicenseRepository.findById(requiredLicenseId),
    ]);

    // Treat a missing/unknown license as the lowest possible rank (0) so that an
    // absent user license never accidentally clears a real requirement.
    const userVal = userLicense?.value ?? 0;
    const requiredVal = requiredLicense?.value ?? 0;

    // Higher value == broader class; ">=" means the user's class covers the requirement.
    return userVal >= requiredVal;
  }

  /**
   * Normalises a license reference into a canonical license id.
   *
   * Callers may pass either an existing license id (a UUID) or a human class label
   * such as "B" or "Klasse C1". This method returns the id unchanged when it is
   * already a UUID, otherwise it resolves the class label to its stored id.
   *
   * @param classOrId - A license id, a class label, or a nullish value.
   * @returns The resolved license id, or `null` when the input is empty or the
   *          class label cannot be matched.
   */
  async resolveLicenseId(
    classOrId: string | null | undefined,
  ): Promise<string | null> {
    if (!classOrId) return null;

    // If the caller already gave us a UUID, it is an id, not a class label, so
    // return it as-is and skip the label lookup entirely.
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(classOrId)) {
      return classOrId;
    }

    // Bare class labels like "B" are stored as "Klasse B"; prepend the German
    // "Klasse " prefix unless the value already carries a known prefix
    // ("Klasse " for current classes, "alte " for legacy/old classes).
    let normalized = classOrId.trim();
    if (!normalized.startsWith('Klasse ') && !normalized.startsWith('alte ')) {
      normalized = 'Klasse ' + normalized;
    }

    // Match case-insensitively so user input like "klasse b" still resolves.
    const allLicenses = await this.driversLicenseRepository.findAll();
    const found = allLicenses.find(
      (l) => l.class?.toLowerCase() === normalized.toLowerCase(),
    );

    return found ? found.id : null;
  }
}
