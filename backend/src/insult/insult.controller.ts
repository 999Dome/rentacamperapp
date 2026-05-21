import { Controller, Get } from '@nestjs/common';
import { InsultService } from './insult.service';

@Controller('insult')
export class InsultController {
  constructor(private readonly insultService: InsultService) {}

  @Get()
  async fetchInsult() {
    return await this.insultService.getInsult();
  }
}
