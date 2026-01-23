/**
 * Invoice PDF generation using pdf-lib
 * Generates professional-looking invoices for course purchases
 */

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { uploadToCloudinary } from "./cloudinary";

interface InvoiceData {
  invoiceNumber: string;
  purchaseDate: Date;
  customerName: string;
  customerEmail: string;
  paymentMethod: string;
  transactionId?: string;
  items: Array<{
    id: string;
    title: string;
    description?: string | null;
    amountCents: number;
    currency: string;
  }>;
  totalAmount: number;
  currency: string;
}

/**
 * Generate an invoice PDF and upload to Cloudinary
 * Returns the URL of the uploaded PDF
 */
export async function generateInvoicePDF(data: InvoiceData): Promise<string> {
  // Create a new PDF document (A4 portrait)
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 portrait

  // Load fonts
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const { width, height } = page.getSize();

  // Colors
  const primaryColor = rgb(0.15, 0.38, 0.92); // Blue
  const goldColor = rgb(0.83, 0.68, 0.21); // Gold
  const darkGray = rgb(0.2, 0.2, 0.2);
  const lightGray = rgb(0.6, 0.6, 0.6);
  const white = rgb(1, 1, 1);

  // Draw border around the entire invoice
  const borderMargin = 20;
  const borderWidth = 2;

  page.drawRectangle({
    x: borderMargin,
    y: borderMargin,
    width: width - 2 * borderMargin,
    height: height - 2 * borderMargin,
    borderColor: primaryColor,
    borderWidth: borderWidth,
  });

  // Header gradient background
  const headerHeight = 120;
  page.drawRectangle({
    x: borderMargin + borderWidth,
    y: height - borderMargin - borderWidth - headerHeight,
    width: width - 2 * (borderMargin + borderWidth),
    height: headerHeight,
    color: primaryColor,
  });

  // Company branding
  const logoY = height - borderMargin - borderWidth - headerHeight + 20;
  page.drawText("AI Genius Lab", {
    x: borderMargin + 30,
    y: logoY + 50,
    size: 24,
    font: timesRomanBoldFont,
    color: white,
  });

  page.drawText("Premium Learning Platform", {
    x: borderMargin + 30,
    y: logoY + 30,
    size: 12,
    font: helveticaFont,
    color: rgb(0.8, 0.8, 0.8),
  });

  // Invoice badge and number
  page.drawText("INVOICE", {
    x: width - borderMargin - 120,
    y: logoY + 60,
    size: 14,
    font: timesRomanBoldFont,
    color: white,
  });

  page.drawText(data.invoiceNumber, {
    x: width - borderMargin - 120,
    y: logoY + 35,
    size: 18,
    font: timesRomanBoldFont,
    color: white,
  });

  page.drawText(`Date: ${data.purchaseDate.toLocaleDateString()}`, {
    x: width - borderMargin - 120,
    y: logoY + 15,
    size: 10,
    font: helveticaFont,
    color: rgb(0.8, 0.8, 0.8),
  });

  // Bill To section
  const billToY = height - borderMargin - borderWidth - headerHeight - 80;
  page.drawText("Bill To:", {
    x: borderMargin + 30,
    y: billToY + 40,
    size: 12,
    font: timesRomanBoldFont,
    color: darkGray,
  });

  page.drawText(data.customerName, {
    x: borderMargin + 30,
    y: billToY + 20,
    size: 14,
    font: timesRomanBoldFont,
    color: darkGray,
  });

  page.drawText(data.customerEmail, {
    x: borderMargin + 30,
    y: billToY,
    size: 10,
    font: helveticaFont,
    color: lightGray,
  });

  // Payment Info section
  page.drawText("Payment Info:", {
    x: width - borderMargin - 120,
    y: billToY + 40,
    size: 12,
    font: timesRomanBoldFont,
    color: darkGray,
  });

  page.drawText(`Method: ${data.paymentMethod}`, {
    x: width - borderMargin - 120,
    y: billToY + 20,
    size: 10,
    font: helveticaFont,
    color: darkGray,
  });

  if (data.transactionId) {
    page.drawText(`Transaction: ${data.transactionId}`, {
      x: width - borderMargin - 120,
      y: billToY,
      size: 8,
      font: helveticaFont,
      color: lightGray,
    });
  }

  // Items table header
  const tableY = billToY - 60;
  const rowHeight = 25;

  page.drawRectangle({
    x: borderMargin + 30,
    y: tableY - 5,
    width: width - 2 * (borderMargin + 30),
    height: rowHeight + 10,
    color: rgb(0.95, 0.95, 0.95),
  });

  page.drawText("Description", {
    x: borderMargin + 40,
    y: tableY + 10,
    size: 10,
    font: timesRomanBoldFont,
    color: darkGray,
  });

  page.drawText("Amount", {
    x: width - borderMargin - 80,
    y: tableY + 10,
    size: 10,
    font: timesRomanBoldFont,
    color: darkGray,
  });

  // Items
  let currentY = tableY - rowHeight;
  data.items.forEach((item, index) => {
    const amount = (item.amountCents / 100).toFixed(2);
    const currencySymbol = item.currency.toUpperCase() === "USD" ? "$" : item.currency;

    page.drawText(item.title, {
      x: borderMargin + 40,
      y: currentY + 10,
      size: 10,
      font: timesRomanFont,
      color: darkGray,
    });

    page.drawText(`${currencySymbol}${amount}`, {
      x: width - borderMargin - 80,
      y: currentY + 10,
      size: 10,
      font: timesRomanFont,
      color: darkGray,
    });

    currentY -= rowHeight;
  });

  // Total section
  const totalY = currentY - 20;
  page.drawRectangle({
    x: width - borderMargin - 150,
    y: totalY - 5,
    width: 130,
    height: 30,
    color: rgb(0.95, 0.95, 0.95),
  });

  const totalAmount = (data.totalAmount / 100).toFixed(2);
  const currencySymbol = data.currency.toUpperCase() === "USD" ? "$" : data.currency;

  page.drawText("Total Paid:", {
    x: width - borderMargin - 140,
    y: totalY + 10,
    size: 12,
    font: timesRomanBoldFont,
    color: darkGray,
  });

  page.drawText(`${currencySymbol}${totalAmount}`, {
    x: width - borderMargin - 80,
    y: totalY + 10,
    size: 12,
    font: timesRomanBoldFont,
    color: primaryColor,
  });

  // Terms section
  const termsY = totalY - 60;
  page.drawText("Terms & Conditions:", {
    x: borderMargin + 30,
    y: termsY + 20,
    size: 10,
    font: timesRomanBoldFont,
    color: darkGray,
  });

  const termsText = "This invoice confirms your purchase of the listed digital course(s). All sales are final and non-refundable. You have been granted immediate and lifetime access to the purchased content.";
  const termsLines = termsText.match(/.{1,80}/g) || [];

  termsLines.forEach((line, index) => {
    page.drawText(line, {
      x: borderMargin + 30,
      y: termsY - index * 12,
      size: 8,
      font: timesRomanFont,
      color: lightGray,
    });
  });

  // Footer
  const footerY = borderMargin + 40;
  page.drawText("AI Genius Lab • Premium Online Learning Platform • support@aigeniuslab.com", {
    x: width / 2 - 200,
    y: footerY,
    size: 8,
    font: helveticaFont,
    color: lightGray,
  });

  page.drawText("Thank you for your purchase!", {
    x: width / 2 - 80,
    y: footerY - 15,
    size: 10,
    font: timesRomanBoldFont,
    color: primaryColor,
  });

  // Serialize the PDF to bytes
  const pdfBytes = await pdfDoc.save();

  // Upload to Cloudinary
  const { secureUrl } = await uploadToCloudinary(Buffer.from(pdfBytes), {
    folder: "invoices",
    resourceType: "raw",
    publicId: `invoice-${data.invoiceNumber}`,
  });

  return secureUrl;
}
