import { Controller, Get } from '@nestjs/common';
import { AddonsService } from './addons.service';

/**
 * HTTP controller for the catalog of bookable add-ons (e.g. extra insurance,
 * bike rack). Handles all routes under the `/addons` prefix and delegates the
 * actual work to {@link AddonsService}.
 */
@Controller('addons')
export class AddonsController {
  constructor(private readonly addonsService: AddonsService) {}

  /**
   * Returns the full list of available add-ons.
   * HTTP: GET /addons/all
   *
   * @returns A promise resolving to every add-on record in the catalog.
   */
  @Get('all')
  async getAll() {
    return await this.addonsService.findAll();
  }
}
