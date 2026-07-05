import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

/**
 * All data needed to render a booking invoice PDF via {@link PdfService.generateInvoice}.
 */
export interface BookingInvoiceData {
  // Unique invoice number printed on the document.
  invoiceNumber: string;
  // Issue date of the invoice (formatted to de-DE locale when rendered).
  invoiceDate: Date;
  // Customer's full name (billing recipient).
  customerName: string;
  // Customer's email address.
  customerEmail: string;
  // Name/label of the rented camper.
  camperName: string;
  // Rental start date, already formatted as a display string.
  startDate: string;
  // Rental end date, already formatted as a display string.
  endDate: string;
  // Optional pickup location line.
  pickupLocation?: string;
  // Optional return location line.
  returnLocation?: string;
  // Net rental price (excluding VAT).
  netPrice: number;
  // VAT amount (19% MwSt.).
  taxAmount: number;
  // Gross total (net + tax).
  grossPrice: number;
  // Human-readable payment method label.
  paymentMethod: string;
}

/**
 * All data needed to render a cancellation receipt PDF via
 * {@link PdfService.generateCancellationPdf}. Consumed by {@link MailService} too.
 */
export interface CancellationPdfData {
  // Unique cancellation number printed on the receipt.
  cancellationNumber: string;
  // Date the cancellation was issued (formatted to de-DE when rendered).
  cancellationDate: Date;
  // Number of the original invoice this cancellation refers to.
  originalInvoiceNumber: string;
  // Customer's full name.
  customerName: string;
  // Customer's email address.
  customerEmail: string;
  // Name/label of the cancelled camper booking.
  camperName: string;
  // Original rental start date, formatted as a display string.
  startDate: string;
  // Original rental end date, formatted as a display string.
  endDate: string;
  // Net refund amount (excluding VAT).
  netRefundAmount: number;
  // VAT portion of the refund (19% MwSt.).
  taxRefundAmount: number;
  // Gross refund total (net + tax) credited to the customer.
  grossRefundAmount: number;
}

/**
 * Generates PDF documents (invoices and cancellation receipts) using PDFKit.
 *
 * PDFKit streams the document as a series of Buffer chunks; each method therefore
 * wraps the drawing calls in a Promise that resolves with the concatenated buffer
 * once the "end" event fires.
 */
@Injectable()
export class PdfService {
  /**
   * Renders a booking invoice as a PDF.
   *
   * @param data Invoice content ({@link BookingInvoiceData}).
   * @returns A Promise resolving to the finished PDF as a single {@link Buffer}.
   * @throws Error If PDFKit fails while building the document.
   */
  async generateInvoice(data: BookingInvoiceData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        // 50pt page margin on all sides.
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        // Collect streamed chunks, then join them into one Buffer when done.
        doc.on('data', (chunk: Buffer) => buffers.push(chunk));
        doc.on('end', () => {
          resolve(Buffer.concat(buffers));
        });

        // --- Header: right-aligned company address block (sender). ---
        doc
          .fillColor('#333333')
          .fontSize(20)
          .text('Rent-A-Camper GmbH', { align: 'right' })
          .fontSize(10)
          .text('Einsteinring 35', { align: 'right' })
          .text('85609 Aschheim', { align: 'right' })
          .text('USt-IdNr.: DE123456789', { align: 'right' })
          .moveDown(4);

        // --- Customer Info: billing recipient (name emphasised at 12pt). ---
        doc
          .fontSize(10)
          .text(`Rechnung an:`)
          .fontSize(12)
          .text(data.customerName)
          .fontSize(10)
          .text(data.customerEmail)
          .moveDown(2);

        // --- Invoice Info: number and issue date (localised to German). ---
        doc
          .fontSize(14)
          .text(`Rechnung Nr. ${data.invoiceNumber}`, { underline: true })
          .fontSize(10)
          .text(`Datum: ${data.invoiceDate.toLocaleDateString('de-DE')}`)
          .moveDown(2);

        // --- Booking Details: camper, period, optional pickup/return lines. ---
        doc
          .fontSize(12)
          .text('Buchungsdetails:', { underline: true })
          .fontSize(10)
          .text(`Camper: ${data.camperName}`)
          .text(`Mietzeitraum: ${data.startDate} bis ${data.endDate}`);

        // Locations are optional, so only print the lines when provided.
        if (data.pickupLocation) {
          doc.text(`Abholung: ${data.pickupLocation}`);
        }
        if (data.returnLocation) {
          doc.text(`Rückgabe: ${data.returnLocation}`);
        }
        doc.moveDown(2);

        // --- Cost Breakdown Table ---
        // A manual two-column layout. `tableTop` captures the current vertical
        // cursor; every subsequent row is placed at a fixed offset from it so the
        // rows line up. Column X positions: labels at x=50, amounts right-aligned
        // ending at x=400. Horizontal rules span x=50..500.
        const tableTop = doc.y;

        doc.font('Helvetica-Bold');
        doc.text('Position', 50, tableTop);
        doc.text('Betrag (€)', 400, tableTop, { align: 'right' });
        doc.font('Helvetica');

        // Rule under the header row (+15pt below the header baseline).
        doc
          .moveTo(50, tableTop + 15)
          .lineTo(500, tableTop + 15)
          .stroke();

        // Row 1: net price (+25pt).
        doc.text('Mietpreis (Netto)', 50, tableTop + 25);
        doc.text(data.netPrice.toFixed(2) + ' €', 400, tableTop + 25, {
          align: 'right',
        });

        // Row 2: 19% VAT (+45pt); the net/tax split is shown separately so the
        // customer can see the tax component of the gross total.
        doc.text('zzgl. 19% MwSt.', 50, tableTop + 45);
        doc.text(data.taxAmount.toFixed(2) + ' €', 400, tableTop + 45, {
          align: 'right',
        });

        // Rule separating the line items from the total (+65pt).
        doc
          .moveTo(50, tableTop + 65)
          .lineTo(500, tableTop + 65)
          .stroke();

        // Total row (+75pt), emphasised in bold.
        doc.font('Helvetica-Bold');
        doc.text('Gesamtbetrag (Brutto)', 50, tableTop + 75);
        doc.text(data.grossPrice.toFixed(2) + ' €', 400, tableTop + 75, {
          align: 'right',
        });
        doc.font('Helvetica');

        doc.moveDown(4);

        // --- Payment Details ---
        doc
          .fontSize(10)
          .text(`Zahlungsart: ${data.paymentMethod}`)
          .text(
            'Der Betrag wurde bereits beglichen. Vielen Dank für Ihre Buchung!',
          );

        // --- Footer: pinned near the page bottom (y=700), centred across the
        // 500pt content width; grey and small to read as a legal disclaimer. ---
        doc
          .fontSize(8)
          .fillColor('gray')
          .text(
            'Dies ist eine maschinell erstellte Rechnung und ohne Unterschrift gültig.',
            50,
            700,
            { align: 'center', width: 500 },
          );

        doc.end();
      } catch (error) {
        // Normalise any thrown value into an Error before rejecting.
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  /**
   * Renders a cancellation receipt (Stornierungsbeleg) as a PDF.
   *
   * @param data Cancellation content ({@link CancellationPdfData}).
   * @returns A Promise resolving to the finished PDF as a single {@link Buffer}.
   * @throws Error If PDFKit fails while building the document.
   */
  async generateCancellationPdf(data: CancellationPdfData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        // 50pt page margin on all sides.
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        // Collect streamed chunks, then join them into one Buffer when done.
        doc.on('data', (chunk: Buffer) => buffers.push(chunk));
        doc.on('end', () => {
          resolve(Buffer.concat(buffers));
        });

        // --- Header: right-aligned company address block (sender). ---
        doc
          .fillColor('#333333')
          .fontSize(20)
          .text('Rent-A-Camper GmbH', { align: 'right' })
          .fontSize(10)
          .text('Musterstraße 123', { align: 'right' })
          .text('12345 Musterstadt', { align: 'right' })
          .text('USt-IdNr.: DE123456789', { align: 'right' })
          .moveDown(4);

        // --- Customer Info: refund recipient (name emphasised at 12pt). ---
        doc
          .fontSize(10)
          .text(`Stornierung an:`)
          .fontSize(12)
          .text(data.customerName)
          .fontSize(10)
          .text(data.customerEmail)
          .moveDown(2);

        // --- Cancellation Info: title, numbers and dates. The title uses a red
        // fill (#d9534f) to visually flag this as a cancellation, then the colour
        // is reset to the default dark grey (#333333) for the following lines. ---
        doc
          .fillColor('#d9534f')
          .fontSize(16)
          .text(`STORNIERUNGSBELEG`, { underline: true })
          .fillColor('#333333')
          .fontSize(12)
          .text(`Stornierungsnr.: ${data.cancellationNumber}`)
          .fontSize(10)
          .text(
            `Datum der Stornierung: ${data.cancellationDate.toLocaleDateString('de-DE')}`,
          )
          .text(`Bezug auf Rechnung: ${data.originalInvoiceNumber}`)
          .moveDown(2);

        // --- Content: salutation and confirmation of the cancelled booking. ---
        doc
          .fontSize(12)
          .text('Sehr geehrte(r) Kunde/Kundin,')
          .moveDown(1)
          .fontSize(10)
          .text(
            `hiermit bestätigen wir Ihnen die Stornierung Ihrer Buchung für das Wohnmobil "${data.camperName}".`,
          )
          .text(
            `Ursprünglicher Mietzeitraum: ${data.startDate} bis ${data.endDate}`,
          )
          .moveDown(2);

        // --- Cost Breakdown Table (refund) ---
        // Same manual two-column layout as the invoice: labels at x=50, amounts
        // right-aligned ending at x=400, rules spanning x=50..500. `tableTop`
        // anchors the vertical cursor; rows sit at fixed +offsets from it.
        const tableTop = doc.y;

        doc.font('Helvetica-Bold');
        doc.text('Position', 50, tableTop);
        doc.text('Betrag (€)', 400, tableTop, { align: 'right' });
        doc.font('Helvetica');

        // Rule under the header row (+15pt).
        doc
          .moveTo(50, tableTop + 15)
          .lineTo(500, tableTop + 15)
          .stroke();

        // Row 1: net refund (+25pt).
        doc.text('Erstattungsbetrag (Netto)', 50, tableTop + 25);
        doc.text(data.netRefundAmount.toFixed(2) + ' €', 400, tableTop + 25, {
          align: 'right',
        });

        // Row 2: 19% VAT portion of the refund (+45pt), shown separately.
        doc.text('zzgl. 19% MwSt.', 50, tableTop + 45);
        doc.text(data.taxRefundAmount.toFixed(2) + ' €', 400, tableTop + 45, {
          align: 'right',
        });

        // Rule separating line items from the total (+65pt).
        doc
          .moveTo(50, tableTop + 65)
          .lineTo(500, tableTop + 65)
          .stroke();

        // Total refund row (+75pt), emphasised in bold.
        doc.font('Helvetica-Bold');
        doc.text('Gesamterstattungsbetrag (Brutto)', 50, tableTop + 75);
        doc.text(data.grossRefundAmount.toFixed(2) + ' €', 400, tableTop + 75, {
          align: 'right',
        });
        doc.font('Helvetica');

        doc.moveDown(4);

        // --- Refund Details: which payment channel the money is returned via. ---
        doc
          .fontSize(10)
          .text(
            'Der Betrag wird über das ursprünglich gewählte Zahlungsmittel (Stripe/PayPal) erstattet.',
          )
          .moveDown(2);

        // --- Footer: pinned near the page bottom (y=700), centred across the
        // 500pt content width; grey and small to read as a legal disclaimer. ---
        doc
          .fontSize(8)
          .fillColor('gray')
          .text(
            'Dies ist ein maschinell erstellter Beleg und ohne Unterschrift gültig.',
            50,
            700,
            { align: 'center', width: 500 },
          );

        doc.end();
      } catch (error) {
        // Normalise any thrown value into an Error before rejecting.
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }
}
