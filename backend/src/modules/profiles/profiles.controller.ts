import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { ProfilesService, UpdateProfileDto } from './profiles.service';
import type { EnrichedProfile } from './profiles.service';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get(':id')
  async getProfile(@Param('id') id: string): Promise<EnrichedProfile | null> {
    return await this.profilesService.getProfileById(id);
  }

  @Put(':id')
  async updateProfile(
    @Param('id') id: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<EnrichedProfile> {
    return await this.profilesService.update(id, dto);
  }
}
