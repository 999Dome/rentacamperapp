import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  ForbiddenException,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import {
  CreateBookingDto,
  UpdateBookingStatusDto,
  CancelBookingDto,
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

  @Post(':id/cancel')
  async cancelBooking(
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
  ): Promise<unknown> {
    if (!dto.user_id) {
      throw new ForbiddenException('User ID is required');
    }
    return await this.bookingsService.cancelBooking(id, dto.user_id);
  }

  @Get('campers/:camperId/blocked-dates')
  async getBlockedDates(@Param('camperId') camperId: string): Promise<unknown> {
    return await this.bookingsService.getBlockedDates(camperId);
  }
}
