import { Controller, Get } from '@nestjs/common';
import { CamperService } from './camper.service';

@Controller('camper')
export class CamperController {
  constructor(private readonly camperService: CamperService) {}

  @Get()
  getAll() {
    return this.camperService.findAll();
  }
}
