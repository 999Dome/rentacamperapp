import { Controller, Get } from '@nestjs/common';
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
}
