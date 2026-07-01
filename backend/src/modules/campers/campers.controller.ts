import {
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  Body,
} from '@nestjs/common';
import { CampersService } from './camper.service';
import type {
  CamperInsertInput,
  CamperUpdateInput,
} from '../../infrastructure/repositories/camper.repository';

@Controller('campers')
export class CampersController {
  constructor(private readonly campersService: CampersService) {}

  @Get('all')
  async getAll(): Promise<unknown> {
    return await this.campersService.findAllCampers();
  }

  @Get('highlights')
  async getHighlights(): Promise<unknown> {
    return await this.campersService.findHighlights();
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<unknown> {
    return await this.campersService.findById(id);
  }

  @Post('calculate-price')
  async calculatePrice(
    @Body('camperId') camperId: string,
    @Body('startDate') startDate: string,
    @Body('endDate') endDate: string,
    @Body('selectedAddonIds') selectedAddonIds: string[],
  ): Promise<unknown> {
    return await this.campersService.calculatePrice({
      camperId,
      startDateStr: startDate,
      endDateStr: endDate,
      selectedAddonIds,
    });
  }

  @Post('create')
  async create(@Body() dto: CamperInsertInput): Promise<unknown> {
    return await this.campersService.create(dto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: CamperUpdateInput,
  ): Promise<unknown> {
    return await this.campersService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<unknown> {
    return await this.campersService.delete(id);
  }
}
