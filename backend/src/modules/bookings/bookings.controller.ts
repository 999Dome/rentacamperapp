import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import {
  CreateBookingDto,
  UpdateBookingStatusDto,
} from './dto/create-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post('create')
  async create(@Body() dto: CreateBookingDto): Promise<unknown> {
    return await this.bookingsService.createBooking(dto);
  }

  @Get('renter/:userId')
  async getByRenter(@Param('userId') userId: string): Promise<unknown> {
    return await this.bookingsService.getBookingsByRenter(userId);
  }

  @Get('provider/:providerId')
  async getByProvider(
    @Param('providerId') _providerId: string,
  ): Promise<unknown> {
    return await this.bookingsService.getBookingsByProvider();
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
  ): Promise<unknown> {
    return await this.bookingsService.updateBookingStatus(id, dto.status);
  }
}
