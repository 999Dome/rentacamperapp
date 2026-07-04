import { Injectable, Inject } from '@nestjs/common';
import type {
  IProfileRepository,
  ProfileRow,
} from '../../infrastructure/repositories/profile.repository';
import { PROFILE_REPOSITORY_TOKEN } from '../../infrastructure/repositories/profile.repository';
import { DriversLicenseService } from '../drivers_license/drivers_license.service';

export class UpdateProfileDto {
  first_name?: string;
  last_name?: string;
  drivers_license_class?: string;
  is_provider?: boolean;
  is_renter?: boolean;
}

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

@Injectable()
export class ProfilesService {
  constructor(
    @Inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: IProfileRepository,
    private readonly driversLicenseService: DriversLicenseService,
  ) {}

  async getProfileById(id: string): Promise<EnrichedProfile | null> {
    const profile = await this.profileRepository.findById(id);
    if (!profile) return null;
    return await this.enrichProfile(profile);
  }

  async update(id: string, dto: UpdateProfileDto): Promise<EnrichedProfile> {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (dto.first_name !== undefined) {
      updateData.first_name = dto.first_name;
    }
    if (dto.last_name !== undefined) {
      updateData.last_name = dto.last_name;
    }
    if (dto.drivers_license_class !== undefined) {
      const resolvedLicenseId = await this.driversLicenseService.resolveLicenseId(
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

  private async enrichProfile(profile: ProfileRow): Promise<EnrichedProfile> {
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
