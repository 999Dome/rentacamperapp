import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { CamperBlockingsService } from './camper_blockings.service';
import {
  CamperBlocking,
  CreateCamperBlockingDto,
} from '../../domain/interfaces/camper_blocking.interface';

@Controller('camper-blockings')
export class CamperBlockingsController {
  constructor(
    private readonly camperBlockingsService: CamperBlockingsService,
  ) {}

  @Post()
  async createBlocking(
    @Query('userId') userId: string,
    @Body() dto: CreateCamperBlockingDto,
  ): Promise<CamperBlocking> {
    return this.camperBlockingsService.createBlocking(userId, dto);
  }

  @Get('camper/:camperId')
  async getBlockings(
    @Query('userId') userId: string,
    @Param('camperId') camperId: string,
  ): Promise<CamperBlocking[]> {
    return this.camperBlockingsService.getBlockings(userId, camperId);
  }

  @Delete(':id')
  async deleteBlocking(
    @Query('userId') userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.camperBlockingsService.deleteBlocking(userId, id);
  }
}
