import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
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
import { CamperBlockingRepository } from '../../infrastructure/repositories/camper_blocking.repository';
import { PdfService } from '../pdf/pdf.service';
import { MailService } from '../mail/mail.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { Logger } from '@nestjs/common';

/**
 * Orchestrates the booking lifecycle: creation, listing, status changes and
 * cancellation.
 *
 * This service owns the business rules that span multiple collaborators —
 * license eligibility, date validation, availability (bookings + blockings),
 * and the side effects of a status change (invoice PDF + confirmation email).
 * It depends on repository *interfaces* (injected by token) so it stays
 * decoupled from the concrete Supabase implementations.
 */
@Injectable()
export class BookingsService {
  constructor(
    @Inject(BOOKING_REPOSITORY_TOKEN)
    private readonly bookingRepository: IBookingRepository,
    private readonly campersRepository: CampersRepository,
    @Inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: IProfileRepository,
    private readonly driversLicenseService: DriversLicenseService,
    private readonly camperBlockingRepository: CamperBlockingRepository,
    private readonly pdfService: PdfService,
    private readonly mailService: MailService,
    private readonly supabaseService: SupabaseService,
  ) {}

  private readonly logger = new Logger(BookingsService.name);

  /**
   * Creates a booking after enforcing every booking rule in order.
   *
   * The checks run as a gauntlet — the first failure throws and nothing is
   * persisted:
   *   1. The renter's license class must cover the camper's requirement.
   *   2. Start date must be today or later and strictly before the end date.
   *   3. A ±3-day logistics buffer around the requested range must be free of
   *      other active bookings (cleaning/transfer time between rentals).
   *   4. The exact range must not hit a provider blocking.
   * Only then is the booking (with add-ons) persisted.
   *
   * @param createBookingDto The incoming booking request.
   * @returns The newly created booking.
   * @throws BadRequestException If any rule fails or persistence errors.
   */
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

    // 2. Validate dates
    const startDate = new Date(createBookingDto.start_date);
    const endDate = new Date(createBookingDto.end_date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (startDate < now) {
      throw new BadRequestException('Startdatum muss in der Zukunft liegen.');
    }
    if (startDate >= endDate) {
      throw new BadRequestException('Startdatum muss vor dem Enddatum liegen.');
    }

    // 3. Buffer calculation: widen the requested range by 3 days on each side.
    // This reserves logistics time (cleaning, inspection, transfer) between two
    // rentals, so two bookings can never be back-to-back on the same camper.
    const bufferedStartDate = new Date(startDate);
    bufferedStartDate.setDate(startDate.getDate() - 3);

    const bufferedEndDate = new Date(endDate);
    bufferedEndDate.setDate(endDate.getDate() + 3);

    // Compare on date-only strings (YYYY-MM-DD) to match how the DB stores dates.
    const bufferedStartStr = bufferedStartDate.toISOString().split('T')[0];
    const bufferedEndStr = bufferedEndDate.toISOString().split('T')[0];

    // 4. Overlap check against other active bookings, using the buffered range
    // so the logistics gap above is enforced.
    const overlappingBookings =
      await this.bookingRepository.findOverlappingBookings(
        createBookingDto.camper_id,
        bufferedStartStr,
        bufferedEndStr,
      );

    if (overlappingBookings && overlappingBookings.length > 0) {
      throw new BadRequestException(
        'Wohnmobil inklusive logistischer Pufferzeit im gewählten Zeitraum nicht verfügbar',
      );
    }

    // Blockings use the exact requested range (no buffer): a provider block is
    // an explicit unavailability, not a logistics gap.
    const overlappingBlockings =
      await this.camperBlockingRepository.findOverlappingBlockings(
        createBookingDto.camper_id,
        createBookingDto.start_date,
        createBookingDto.end_date,
      );

    if (overlappingBlockings && overlappingBlockings.length > 0) {
      throw new BadRequestException(
        'Wohnmobil ist in diesem Zeitraum durch den Vermieter blockiert.',
      );
    }

    const command: CreateBookingCommand = {
      camperId: createBookingDto.camper_id,
      userId: createBookingDto.user_id,
      startDate: createBookingDto.start_date,
      endDate: createBookingDto.end_date,
      totalPrice: createBookingDto.total_price,
      addonIds: createBookingDto.addons,
      pickupLocationId: createBookingDto.pickup_location_id,
      returnLocationId: createBookingDto.return_location_id,
    };

    try {
      const newBooking = await this.bookingRepository.create(command);
      return newBooking;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to create booking',
      );
    }
  }

  /**
   * Lists all bookings made by a given renter.
   *
   * @param userId The renter's user id.
   * @returns The renter's bookings with related data.
   * @throws BadRequestException If the lookup fails.
   */
  async getBookingsByRenter(userId: string): Promise<BookingWithRelations[]> {
    try {
      return await this.bookingRepository.findByRenterId(userId);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to fetch bookings',
      );
    }
  }

  /**
   * Lists bookings for the provider dashboard (currently all bookings).
   *
   * @returns The provider-facing bookings with related data.
   * @throws BadRequestException If the lookup fails.
   */
  async getBookingsByProvider(): Promise<BookingWithRelations[]> {
    try {
      return await this.bookingRepository.findByProviderId();
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to fetch bookings',
      );
    }
  }

  /**
   * Updates a booking's status and, on confirmation, sends the invoice.
   *
   * When the new status is `confirmed`, the method additionally builds an
   * invoice PDF and emails it to the customer. That side effect is wrapped in
   * its own try/catch so a mail/PDF failure is logged but never rolls back or
   * fails the status update itself — the booking is confirmed regardless.
   *
   * @param bookingId The booking to update.
   * @param status    The new status.
   * @returns The updated booking.
   * @throws BadRequestException If the status update fails.
   */
  async updateBookingStatus(
    bookingId: string,
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  ) {
    try {
      const updatedBooking = await this.bookingRepository.updateStatus(
        bookingId,
        status,
      );

      if (status === 'confirmed') {
        try {
          const booking = await this.bookingRepository.findById(bookingId);
          if (booking) {
            const camper = await this.campersRepository.findById(
              booking.camper_id,
            );
            const profile = await this.profileRepository.findById(
              booking.user_id,
            );

            const { data: userData } =
              await this.supabaseService.client.auth.admin.getUserById(
                booking.user_id,
              );
            const customerEmail = userData?.user?.email || 'kunde@example.com';

            // total_price is gross (incl. 19% German VAT). Divide by 1.19 to
            // recover the net amount; the difference is the tax portion.
            const invoiceData = {
              // TODO: random invoice number is a placeholder; a real system
              // would use a persisted, sequential invoice counter.
              invoiceNumber: `RE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              invoiceDate: new Date(),
              customerName: `${profile.first_name} ${profile.last_name}`,
              customerEmail: customerEmail,
              camperName: camper.name || 'Wohnmobil',
              startDate: booking.start_date,
              endDate: booking.end_date,
              pickupLocation:
                (booking.pickup_location_id as string) || undefined,
              returnLocation:
                (booking.return_location_id as string) || undefined,
              netPrice: booking.total_price / 1.19,
              taxAmount: booking.total_price - booking.total_price / 1.19,
              grossPrice: booking.total_price,
              paymentMethod: 'Vorkasse / Stripe / PayPal',
            };

            const pdfBuffer =
              await this.pdfService.generateInvoice(invoiceData);

            await this.mailService.sendEmail({
              to: customerEmail,
              subject: 'Ihre Buchungsbestätigung & Rechnung - Rent-A-Camper',
              html: `<h1>Vielen Dank für Ihre Buchung!</h1>
                     <p>Hallo ${profile.first_name},</p>
                     <p>Ihre Buchung für das Wohnmobil "${camper.name || 'Wohnmobil'}" war erfolgreich.</p>
                     <p>Im Anhang finden Sie Ihre Rechnung als PDF-Dokument.</p>
                     <p>Gute Reise!</p>`,
              attachments: [
                {
                  filename: `Rechnung_${invoiceData.invoiceNumber}.pdf`,
                  content: pdfBuffer,
                },
              ],
            });

            this.logger.log(
              `Invoice sent successfully for confirmed booking ${bookingId}`,
            );
          }
        } catch (emailError) {
          this.logger.error(
            'Error generating PDF or sending email for confirmed booking',
            emailError,
          );
        }
      }

      return updatedBooking;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Failed to update booking status',
      );
    }
  }

  /**
   * Cancels a booking on behalf of its owner and emails a cancellation notice.
   *
   * Enforces three guards before cancelling: the booking must exist, the
   * requester must own it, and its current status must be cancellable
   * (`confirmed` or `pending` — not already cancelled/completed). As with
   * confirmation, the cancellation PDF + email is a best-effort side effect and
   * is not allowed to fail the cancellation.
   *
   * @param bookingId The booking to cancel.
   * @param userId    Id of the user requesting cancellation (ownership check).
   * @returns The cancelled booking.
   * @throws BadRequestException If the booking is missing, already cancelled,
   *         or in a non-cancellable state.
   * @throws ForbiddenException If the requester does not own the booking.
   */
  async cancelBooking(bookingId: string, userId: string) {
    try {
      const booking = await this.bookingRepository.findById(bookingId);
      if (!booking) {
        throw new BadRequestException('Buchung nicht gefunden');
      }

      // Ownership check: a renter may only cancel their own bookings.
      if (booking.user_id !== userId) {
        throw new ForbiddenException(
          'Keine Berechtigung, diese Buchung zu stornieren',
        );
      }

      if (booking.status === 'cancelled') {
        throw new BadRequestException('Buchung ist bereits storniert');
      }

      // Completed bookings are historical and cannot be undone.
      if (booking.status !== 'confirmed' && booking.status !== 'pending') {
        throw new BadRequestException(
          'Nur bestätigte oder ausstehende Buchungen können storniert werden',
        );
      }

      const updatedBooking = await this.bookingRepository.updateStatus(
        bookingId,
        'cancelled',
      );

      // Generate PDF & Send Email
      try {
        const camper = await this.campersRepository.findById(booking.camper_id);
        const profile = await this.profileRepository.findById(booking.user_id);
        const { data: userData } =
          await this.supabaseService.client.auth.admin.getUserById(
            booking.user_id,
          );

        const customerEmail = userData?.user?.email || 'kunde@example.com';

        // Refund figures mirror the invoice: total_price is gross (incl. 19%
        // VAT); the net is total / 1.19 and the rest is the refunded tax.
        const cancellationData = {
          cancellationNumber: `ST-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          cancellationDate: new Date(),
          originalInvoiceNumber: `RE-XXXX`, // In a real app we'd fetch the actual invoice number from DB
          customerName: `${profile.first_name} ${profile.last_name}`,
          customerEmail: customerEmail,
          camperName: camper.name || 'Wohnmobil',
          startDate: booking.start_date,
          endDate: booking.end_date,
          netRefundAmount: booking.total_price / 1.19,
          taxRefundAmount: booking.total_price - booking.total_price / 1.19,
          grossRefundAmount: booking.total_price,
        };

        const pdfBuffer =
          await this.pdfService.generateCancellationPdf(cancellationData);
        await this.mailService.sendCancellationEmail(
          customerEmail,
          pdfBuffer,
          cancellationData,
        );

        this.logger.log(
          `Cancellation email sent successfully for booking ${bookingId}`,
        );
      } catch (err) {
        this.logger.error(
          'Error generating cancellation PDF or sending email',
          err,
        );
      }

      return updatedBooking;
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Fehler beim Stornieren der Buchung',
      );
    }
  }

  /**
   * Builds the list of date ranges a camper is unavailable, for the booking
   * calendar. Combines two sources:
   *   - active bookings, each widened by the ±3-day logistics buffer (so the
   *     calendar visually reflects the same gap enforced at booking time), and
   *   - manual provider blockings, shown as their exact range.
   *
   * @param camperId The camper to compute availability for.
   * @returns `{ blockedRanges }` where each range is `{ from, to }` (ISO dates).
   */
  async getBlockedDates(
    camperId: string,
  ): Promise<{ blockedRanges: { from: string; to: string }[] }> {
    const validBookings =
      await this.bookingRepository.findValidBookingsByCamperId(camperId);
    const manualBlockings =
      await this.camperBlockingRepository.findByCamperId(camperId);

    const blockedRanges: { from: string; to: string }[] = [];

    // Bookings: apply the same 3-day buffer used during creation so the shown
    // unavailability matches what the overlap check will actually reject.
    for (const booking of validBookings) {
      const fromDate = new Date(booking.start_date);
      fromDate.setDate(fromDate.getDate() - 3);

      const toDate = new Date(booking.end_date);
      toDate.setDate(toDate.getDate() + 3);

      blockedRanges.push({
        from: fromDate.toISOString().split('T')[0],
        to: toDate.toISOString().split('T')[0],
      });
    }

    // Manual blockings are shown as-is (no buffer): they are explicit
    // unavailability set by the provider, not rentals needing turnaround time.
    for (const blocking of manualBlockings) {
      blockedRanges.push({
        from: new Date(blocking.start_date).toISOString().split('T')[0],
        to: new Date(blocking.end_date).toISOString().split('T')[0],
      });
    }

    return { blockedRanges };
  }
}
