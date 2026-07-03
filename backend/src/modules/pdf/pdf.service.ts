import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

export interface BookingInvoiceData {
  invoiceNumber: string;
  invoiceDate: Date;
  customerName: string;
  customerEmail: string;
  camperName: string;
  startDate: string;
  endDate: string;
  pickupLocation?: string;
  returnLocation?: string;
  netPrice: number;
  taxAmount: number;
  grossPrice: number;
  paymentMethod: string;
}

@Injectable()
export class PdfService {
  async generateInvoice(data: BookingInvoiceData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => buffers.push(chunk));
        doc.on('end', () => {
          resolve(Buffer.concat(buffers));
        });

        // Header
        doc
          .fillColor('#333333')
          .fontSize(20)
          .text('Rent-A-Camper GmbH', { align: 'right' })
          .fontSize(10)
          .text('Musterstraße 123', { align: 'right' })
          .text('12345 Musterstadt', { align: 'right' })
          .text('USt-IdNr.: DE123456789', { align: 'right' })
          .moveDown(4);

        // Customer Info
        doc
          .fontSize(10)
          .text(`Rechnung an:`)
          .fontSize(12)
          .text(data.customerName)
          .fontSize(10)
          .text(data.customerEmail)
          .moveDown(2);

        // Invoice Info
        doc
          .fontSize(14)
          .text(`Rechnung Nr. ${data.invoiceNumber}`, { underline: true })
          .fontSize(10)
          .text(`Datum: ${data.invoiceDate.toLocaleDateString('de-DE')}`)
          .moveDown(2);

        // Booking Details
        doc
          .fontSize(12)
          .text('Buchungsdetails:', { underline: true })
          .fontSize(10)
          .text(`Camper: ${data.camperName}`)
          .text(`Mietzeitraum: ${data.startDate} bis ${data.endDate}`);

        if (data.pickupLocation) {
          doc.text(`Abholung: ${data.pickupLocation}`);
        }
        if (data.returnLocation) {
          doc.text(`Rückgabe: ${data.returnLocation}`);
        }
        doc.moveDown(2);

        // Cost Breakdown Table (Simple format)
        const tableTop = doc.y;

        doc.font('Helvetica-Bold');
        doc.text('Position', 50, tableTop);
        doc.text('Betrag (€)', 400, tableTop, { align: 'right' });
        doc.font('Helvetica');

        doc
          .moveTo(50, tableTop + 15)
          .lineTo(500, tableTop + 15)
          .stroke();

        doc.text('Mietpreis (Netto)', 50, tableTop + 25);
        doc.text(data.netPrice.toFixed(2) + ' €', 400, tableTop + 25, {
          align: 'right',
        });

        doc.text('zzgl. 19% MwSt.', 50, tableTop + 45);
        doc.text(data.taxAmount.toFixed(2) + ' €', 400, tableTop + 45, {
          align: 'right',
        });

        doc
          .moveTo(50, tableTop + 65)
          .lineTo(500, tableTop + 65)
          .stroke();

        doc.font('Helvetica-Bold');
        doc.text('Gesamtbetrag (Brutto)', 50, tableTop + 75);
        doc.text(data.grossPrice.toFixed(2) + ' €', 400, tableTop + 75, {
          align: 'right',
        });
        doc.font('Helvetica');

        doc.moveDown(4);

        // Payment Details
        doc
          .fontSize(10)
          .text(`Zahlungsart: ${data.paymentMethod}`)
          .text(
            'Der Betrag wurde bereits beglichen. Vielen Dank für Ihre Buchung!',
          );

        // Footer
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
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }
}
