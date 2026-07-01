import { Controller, Get, Param } from '@nestjs/common';
import { BookingAddonsService } from './booking_addons.service';

@Controller('booking-addons')
export class BookingAddonsController {
  constructor(private readonly bookingAddonsService: BookingAddonsService) {}

  @Get('booking/:bookingId')
  async getByBooking(@Param('bookingId') bookingId: string) {
    return await this.bookingAddonsService.findByBookingId(bookingId);
  }
}
