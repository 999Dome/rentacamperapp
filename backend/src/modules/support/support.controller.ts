import { Controller, Post, Body } from '@nestjs/common';
import { SupportService } from './support.service';
import type { ContactRequestDto } from './dto/contact-request.dto';

/**
 * HTTP entry point for customer support requests.
 * All routes are prefixed with "/support" (the argument to @Controller).
 * Delegates the actual work to {@link SupportService}.
 */
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  /**
   * Handles POST /support/contact: forwards a submitted contact form to the
   * support inbox as an email.
   *
   * @param dto Parsed JSON request body ({@link ContactRequestDto}).
   * @returns A `{ success: true }` object once the email has been dispatched.
   * @throws BadRequestException If required fields are missing or the email is malformed.
   */
  @Post('contact')
  async contact(@Body() dto: ContactRequestDto) {
    return await this.supportService.sendContactEmail(dto);
  }
}
