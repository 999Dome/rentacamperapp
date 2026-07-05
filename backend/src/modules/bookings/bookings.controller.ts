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

/**
 * HTTP endpoints for bookings, mounted under the `/bookings` route prefix.
 *
 * This is a thin transport layer: each handler simply validates the shape of
 * the request and delegates to {@link BookingsService}, where all business
 * rules live.
 */
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  /**
   * `POST /bookings/create` — creates a new booking.
   *
   * @param dto The booking request body.
   * @returns The newly created booking.
   */
  @Post('create')
  async create(@Body() dto: CreateBookingDto): Promise<unknown> {
    return await this.bookingsService.createBooking(dto);
  }

  /**
   * `GET /bookings/renter/:userId` — lists the bookings made by a renter.
   *
   * @param userId The renter's user id.
   * @returns The renter's bookings with related camper/addon/location data.
   */
  @Get('renter/:userId')
  async getByRenter(@Param('userId') userId: string): Promise<unknown> {
    return await this.bookingsService.getBookingsByRenter(userId);
  }

  /**
   * `GET /bookings/provider/:providerId` — lists bookings for the provider view.
   *
   * @param _providerId Path param kept for the route shape; the service
   *                    currently returns all bookings and ignores it.
   * @returns The provider-facing bookings.
   */
  @Get('provider/:providerId')
  async getByProvider(
    @Param('providerId') _providerId: string,
  ): Promise<unknown> {
    return await this.bookingsService.getBookingsByProvider();
  }

  /**
   * `PUT /bookings/:id/status` — changes a booking's status. Setting it to
   * `confirmed` also triggers invoice generation + email (see the service).
   *
   * @param id  Id of the booking to update.
   * @param dto Body carrying the new status.
   * @returns The updated booking.
   */
  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
  ): Promise<unknown> {
    return await this.bookingsService.updateBookingStatus(id, dto.status);
  }

  /**
   * `POST /bookings/:id/cancel` — cancels a booking on behalf of its owner.
   *
   * @param id  Id of the booking to cancel.
   * @param dto Body carrying the requesting user's id (used for the ownership
   *            check inside the service).
   * @returns The cancelled booking.
   * @throws ForbiddenException If no user id is supplied.
   */
  @Post(':id/cancel')
  async cancelBooking(
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
  ): Promise<unknown> {
    // Guard here so we never reach the service without a caller identity to
    // check ownership against.
    if (!dto.user_id) {
      throw new ForbiddenException('User ID is required');
    }
    return await this.bookingsService.cancelBooking(id, dto.user_id);
  }

  /**
   * `GET /bookings/campers/:camperId/blocked-dates` — returns the date ranges
   * a camper is unavailable (bookings + manual blockings), for the calendar UI.
   *
   * @param camperId The camper to query.
   * @returns An object with a `blockedRanges` array of `{ from, to }` dates.
   */
  @Get('campers/:camperId/blocked-dates')
  async getBlockedDates(@Param('camperId') camperId: string): Promise<unknown> {
    return await this.bookingsService.getBlockedDates(camperId);
  }
}
