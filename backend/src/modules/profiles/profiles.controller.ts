import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { ProfilesService, UpdateProfileDto } from './profiles.service';
import type { EnrichedProfile } from './profiles.service';

/**
 * HTTP endpoints for user profiles, mounted under the `/profiles` route prefix.
 * Thin layer over {@link ProfilesService}.
 */
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  /**
   * `GET /profiles/:id` — fetches a profile.
   *
   * @param id The profile id.
   * @returns The enriched profile, or `null` if not found.
   */
  @Get(':id')
  async getProfile(@Param('id') id: string): Promise<EnrichedProfile | null> {
    return await this.profilesService.getProfileById(id);
  }

  /**
   * `PUT /profiles/:id` — applies a partial update to a profile.
   *
   * @param id  The profile id.
   * @param dto The fields to change.
   * @returns The updated, enriched profile.
   */
  @Put(':id')
  async updateProfile(
    @Param('id') id: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<EnrichedProfile> {
    return await this.profilesService.update(id, dto);
  }
}
