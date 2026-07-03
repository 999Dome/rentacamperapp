import { Controller, Post, Body } from '@nestjs/common';
import { SupportService } from './support.service';
import { ContactRequestDto } from './dto/contact-request.dto';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('contact')
  async contact(@Body() dto: ContactRequestDto) {
    return await this.supportService.sendContactEmail(dto);
  }
}
