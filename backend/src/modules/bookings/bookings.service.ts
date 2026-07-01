import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import type { IBookingRepository } from '../../infrastructure/repositories/booking-repository.interface';
import { BOOKING_REPOSITORY_TOKEN } from '../../infrastructure/repositories/booking-repository.interface';
import {
  BookingWithRelations,
  CreateBookingCommand,
} from '../../domain/interfaces/booking.interface';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CampersRepository } from '../../infrastructure/repositories/camper.repository';
import type { IProfileRepository } from '../../infrastructure/repositories/profile.repository';
import { PROFILE_REPOSITORY_TOKEN } from '../../infrastructure/repositories/profile.repository';
import { DriversLicenseService } from '../drivers_license/drivers_license.service';

@Injectable()
export class BookingsService {
  constructor(
    @Inject(BOOKING_REPOSITORY_TOKEN)
    private readonly bookingRepository: IBookingRepository,
    private readonly campersRepository: CampersRepository,
    @Inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: IProfileRepository,
    private readonly driversLicenseService: DriversLicenseService,
  ) {}

  async createBooking(createBookingDto: CreateBookingDto) {
    // 1. Validate drivers license class
    const camper = await this.campersRepository.findById(
      createBookingDto.camper_id,
    );
    const profile = await this.profileRepository.findById(
      createBookingDto.user_id,
    );

    const isLicensed = await this.driversLicenseService.hasSufficientLicense(
      profile.drivers_license_class,
      camper.required_license,
    );

    if (!isLicensed) {
      throw new BadRequestException(
        'Buchung abgelehnt: Ihre Führerscheinklasse reicht für diesen Camper nicht aus.',
      );
    }

    const command: CreateBookingCommand = {
      camperId: createBookingDto.camper_id,
      userId: createBookingDto.user_id,
      startDate: createBookingDto.start_date,
      endDate: createBookingDto.end_date,
      totalPrice: createBookingDto.total_price,
      addonIds: createBookingDto.addons,
    };

    try {
      return await this.bookingRepository.create(command);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to create booking',
      );
    }
  }

  async getBookingsByRenter(userId: string): Promise<BookingWithRelations[]> {
    try {
      return await this.bookingRepository.findByRenterId(userId);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to fetch bookings',
      );
    }
  }

  async getBookingsByProvider(): Promise<BookingWithRelations[]> {
    try {
      return await this.bookingRepository.findByProviderId();
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to fetch bookings',
      );
    }
  }

  async updateBookingStatus(
    bookingId: string,
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  ) {
    try {
      return await this.bookingRepository.updateStatus(bookingId, status);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Failed to update booking status',
      );
    }
  }
}
