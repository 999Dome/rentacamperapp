import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';

/**
 * Wires up PDF generation. Provides {@link PdfService} and exports it so other
 * modules can render invoice and cancellation documents.
 */
@Module({
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}
