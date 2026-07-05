import { Injectable, Inject } from '@nestjs/common';
import type {
  IProfileRepository,
  ProfileRow,
  ProfileUpdateInput,
} from '../../infrastructure/repositories/profile.repository';
import { PROFILE_REPOSITORY_TOKEN } from '../../infrastructure/repositories/profile.repository';
import { DriversLicenseService } from '../drivers_license/drivers_license.service';

/** Request body for `PUT /profiles/:id`; every field is optional (patch). */
export class UpdateProfileDto {
  first_name?: string;
  last_name?: string;
  /** Human-readable license class (e.g. "B"); resolved to a DB id on save. */
  drivers_license_class?: string;
  is_provider?: boolean;
  is_renter?: boolean;
}

/**
 * A profile returned to the client with the license class resolved to its
 * readable name.
 *
 * `drivers_license_class` holds the class *name* (not the DB id) here, and
 * `driver_license_class` is a duplicate kept for frontend compatibility.
 */
export interface EnrichedProfile {
  id: string;
  updated_at: string | null;
  first_name: string | null;
  last_name: string | null;
  drivers_license_class: string;
  driver_license_class: string;
  is_renter: boolean | null;
  is_provider: boolean | null;
  is_admin: boolean | null;
}

/**
 * Application service for user profiles: reads and updates, always returning
 * the license-class-enriched shape ({@link EnrichedProfile}).
 */
@Injectable()
export class ProfilesService {
  constructor(
    @Inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: IProfileRepository,
    private readonly driversLicenseService: DriversLicenseService,
  ) {}

  /**
   * Fetches a profile and enriches it with the readable license class.
   *
   * @param id The profile id.
   * @returns The enriched profile, or `null` if none exists.
   */
  async getProfileById(id: string): Promise<EnrichedProfile | null> {
    const profile = await this.profileRepository.findById(id);
    if (!profile) return null;
    return await this.enrichProfile(profile);
  }

  /**
   * Applies a partial update to a profile.
   *
   * Only the fields present in the DTO are written (patch semantics), so
   * omitted fields keep their current values. `drivers_license_class` is
   * resolved from its readable name to a DB id before saving.
   *
   * @param id  The profile id to update.
   * @param dto The fields to change.
   * @returns The updated, enriched profile.
   */
  async update(id: string, dto: UpdateProfileDto): Promise<EnrichedProfile> {
    // Build the patch incrementally; always bump updated_at. Typed as the
    // repository's update payload so it stays type-safe (no `any`).
    const updateData: ProfileUpdateInput = {
      updated_at: new Date().toISOString(),
    };

    if (dto.first_name !== undefined) {
      updateData.first_name = dto.first_name;
    }
    if (dto.last_name !== undefined) {
      updateData.last_name = dto.last_name;
    }
    if (dto.drivers_license_class !== undefined) {
      // The DB stores a license id, but the client sends a readable class name
      // — translate it before persisting.
      const resolvedLicenseId =
        await this.driversLicenseService.resolveLicenseId(
          dto.drivers_license_class,
        );
      updateData.drivers_license_class = resolvedLicenseId;
    }
    if (dto.is_provider !== undefined) {
      updateData.is_provider = dto.is_provider;
    }
    if (dto.is_renter !== undefined) {
      updateData.is_renter = dto.is_renter;
    }

    const updated = await this.profileRepository.update(id, updateData);

    return await this.enrichProfile(updated);
  }

  /**
   * Converts a raw profile row into an {@link EnrichedProfile} by resolving the
   * stored license id to its readable class name.
   *
   * @param profile The raw profile row.
   * @returns The enriched profile, with "Klasse B" as a safe default when the
   *          license is unset or cannot be resolved.
   */
  private async enrichProfile(profile: ProfileRow): Promise<EnrichedProfile> {
    // Safe default so the UI always has a class to show.
    let className = 'Klasse B';
    if (profile.drivers_license_class) {
      try {
        const license = await this.driversLicenseService.findLicenseById(
          profile.drivers_license_class,
        );
        if (license && license.class) {
          className = license.class;
        }
      } catch (err) {
        // A failed license lookup shouldn't fail the whole profile read.
        console.warn('Could not load license class name:', err);
      }
    }
    return {
      id: profile.id,
      updated_at: profile.updated_at,
      first_name: profile.first_name,
      last_name: profile.last_name,
      drivers_license_class: className,
      driver_license_class: className,
      is_renter: profile.is_renter,
      is_provider: profile.is_provider,
      is_admin: profile.is_admin,
    };
  }
}
