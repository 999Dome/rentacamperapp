import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { CamperOwnerService } from './camper_owner.service';
import type {
  CamperOwnerInsert,
  CamperOwnerRow,
} from '../../infrastructure/repositories/camper_owner.repository';

@Controller('camper-owner')
export class CamperOwnerController {
  constructor(private readonly camperOwnerService: CamperOwnerService) {}

  @Get('user/:userId')
  async getByUserId(
    @Param('userId') userId: string,
  ): Promise<CamperOwnerRow[]> {
    return await this.camperOwnerService.findByUserId(userId);
  }

  @Get('camper/:camperId')
  async getByCamperId(
    @Param('camperId') camperId: string,
  ): Promise<CamperOwnerRow | null> {
    return await this.camperOwnerService.findByCamperId(camperId);
  }

  @Post()
  async assignOwner(@Body() dto: CamperOwnerInsert): Promise<CamperOwnerRow> {
    return await this.camperOwnerService.assignOwner(dto);
  }

  @Delete('camper/:camperId')
  async removeOwner(@Param('camperId') camperId: string): Promise<void> {
    return await this.camperOwnerService.removeOwner(camperId);
  }
}
