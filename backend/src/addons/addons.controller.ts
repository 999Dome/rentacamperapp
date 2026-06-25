import { Controller, Get } from '@nestjs/common';
import { AddonsService } from './addons.service';

@Controller('addons')
export class AddonsController {
  constructor(private readonly addonsService: AddonsService) {}

  @Get('all')
  async getAll() {
    return await this.addonsService.findAll();
  }
}
