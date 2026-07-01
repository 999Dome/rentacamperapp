import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { ProfilesService, UpdateProfileDto } from './profiles.service';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get(':id')
  async getProfile(@Param('id') id: string) {
    return await this.profilesService.findOne(id);
  }

  @Put(':id')
  async updateProfile(@Param('id') id: string, @Body() dto: UpdateProfileDto) {
    return await this.profilesService.update(id, dto);
  }
}
