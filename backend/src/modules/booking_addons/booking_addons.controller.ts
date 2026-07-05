import { Controller, Get, Param } from '@nestjs/common';
import { BookingAddonsService } from './booking_addons.service';

/**
 * HTTP controller for the join between bookings and add-ons (the add-ons that
 * were selected for a specific booking). Handles routes under the
 * `/booking-addons` prefix and delegates to {@link BookingAddonsService}.
 */
@Controller('booking-addons')
export class BookingAddonsController {
  constructor(private readonly bookingAddonsService: BookingAddonsService) {}

  /**
   * Lists all add-ons attached to a given booking.
   * HTTP: GET /booking-addons/booking/:bookingId
   *
   * @param bookingId - Id of the booking whose add-ons should be returned.
   * @returns A promise resolving to the add-on rows for that booking.
   */
  @Get('booking/:bookingId')
  async getByBooking(@Param('bookingId') bookingId: string) {
    return await this.bookingAddonsService.findByBookingId(bookingId);
  }
}
