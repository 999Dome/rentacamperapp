import {
  Booking,
  BookingStatus,
  BookingWithRelations,
  CreateBookingCommand,
} from '../../domain/interfaces/booking.interface';

export interface IBookingRepository {
  create(command: CreateBookingCommand): Promise<Booking>;
  findById(bookingId: string): Promise<Booking | null>;
  findByRenterId(userId: string): Promise<BookingWithRelations[]>;
  findByProviderId(providerId?: string): Promise<BookingWithRelations[]>;
  updateStatus(bookingId: string, status: BookingStatus): Promise<Booking>;
}

export const BOOKING_REPOSITORY_TOKEN = 'IBookingRepository';
