import {
  Booking,
  BookingStatus,
  BookingWithRelations,
  CreateBookingCommand,
} from '../../domain/interfaces/booking.interface';

/**
 * Abstraction over booking persistence.
 *
 * The `BookingsService` depends on this interface via
 * {@link BOOKING_REPOSITORY_TOKEN} rather than the concrete Supabase class,
 * which keeps the business logic testable and storage-agnostic.
 */
export interface IBookingRepository {
  /** Persists a new booking (and its add-ons); returns the created row. */
  create(command: CreateBookingCommand): Promise<Booking>;
  /** Looks up a booking by id, or `null` if it does not exist. */
  findById(bookingId: string): Promise<Booking | null>;
  /** Lists a renter's bookings, enriched with camper/addon/location data. */
  findByRenterId(userId: string): Promise<BookingWithRelations[]>;
  /** Lists bookings for the provider view (currently all bookings). */
  findByProviderId(providerId?: string): Promise<BookingWithRelations[]>;
  /** Bookings that still occupy a camper (confirmed/completed/unexpired). */
  findValidBookingsByCamperId(camperId: string): Promise<Booking[]>;
  /** Transitions a booking to a new {@link BookingStatus}. */
  updateStatus(bookingId: string, status: BookingStatus): Promise<Booking>;
  /** Finds active bookings that clash with a requested date range. */
  findOverlappingBookings(
    camperId: string,
    startDate: string,
    endDate: string,
  ): Promise<Booking[]>;
}

/** DI token used to inject {@link IBookingRepository} implementations. */
export const BOOKING_REPOSITORY_TOKEN = 'IBookingRepository';
