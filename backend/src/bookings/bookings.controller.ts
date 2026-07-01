import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { BookingsService, CreateBookingDto } from './bookings.service';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post('create')
  async create(@Body() dto: CreateBookingDto) {
    return await this.bookingsService.create(dto);
  }

  @Get('renter/:userId')
  async getByRenter(@Param('userId') userId: string) {
    return await this.bookingsService.findAllByRenter(userId);
  }

  @Get('provider/:providerId')
  async getByProvider(@Param('providerId') providerId: string) {
    return await this.bookingsService.findAllByProvider(providerId);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  ) {
    return await this.bookingsService.updateStatus(id, status);
  }
}
