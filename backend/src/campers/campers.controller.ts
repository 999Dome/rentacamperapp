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

@Controller('campers')
export class CampersController {
  constructor(private readonly campersService: CampersService) {}

  @Get('all')
  async getAll() {
    return await this.campersService.findAllCampers();
  }

  @Get('highlights')
  async getHighlights() {
    return await this.campersService.findHighlights();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.campersService.findById(id);
  }

  @Post('calculate-price')
  async calculatePrice(
    @Body('camperId') camperId: string,
    @Body('startDate') startDate: string,
    @Body('endDate') endDate: string,
    @Body('selectedAddonIds') selectedAddonIds: string[],
  ) {
    return await this.campersService.calculatePrice(
      camperId,
      startDate,
      endDate,
      selectedAddonIds,
    );
  }

  @Post('create')
  async create(@Body() dto: any) {
    return await this.campersService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return await this.campersService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.campersService.delete(id);
  }
}
