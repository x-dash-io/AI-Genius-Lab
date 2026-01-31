/**
 * Certificate PDF generation using pdf-lib
 * Generates professional-looking certificates for course and learning path completion
 */

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { uploadToCloudinary } from "./cloudinary";

interface CertificateData {
  certificateId: string;
  recipientName: string;
  courseName?: string;
  pathName?: string;
  issuedAt: Date;
  type: "course" | "learning_path";
}

/**
 * Generate a certificate PDF and upload to Cloudinary
 * Returns the URL of the uploaded PDF
 */
export async function generateCertificatePDF(
  data: CertificateData
): Promise<string> {
  // Create a new PDF document (landscape A4)
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // A4 landscape

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

  // Draw decorative border
  const borderMargin = 30;
  const borderWidth = 3;
  
  // Outer border
  page.drawRectangle({
    x: borderMargin,
    y: borderMargin,
    width: width - 2 * borderMargin,
    height: height - 2 * borderMargin,
    borderColor: goldColor,
    borderWidth: borderWidth,
  });

  // Inner border
  page.drawRectangle({
    x: borderMargin + 10,
    y: borderMargin + 10,
    width: width - 2 * (borderMargin + 10),
    height: height - 2 * (borderMargin + 10),
    borderColor: primaryColor,
    borderWidth: 1,
  });

  // Draw corner decorations
  const cornerSize = 20;
  const corners = [
    { x: borderMargin + 5, y: height - borderMargin - 5 },
    { x: width - borderMargin - 5, y: height - borderMargin - 5 },
    { x: borderMargin + 5, y: borderMargin + 5 },
    { x: width - borderMargin - 5, y: borderMargin + 5 },
  ];

  corners.forEach((corner) => {
    page.drawCircle({
      x: corner.x,
      y: corner.y,
      size: 8,
      color: goldColor,
    });
  });

  // Header: "CERTIFICATE OF COMPLETION"
  const headerText = "CERTIFICATE OF COMPLETION";
  const headerFontSize = 28;
  const headerWidth = timesRomanBoldFont.widthOfTextAtSize(headerText, headerFontSize);
  
  page.drawText(headerText, {
    x: (width - headerWidth) / 2,
    y: height - 100,
    size: headerFontSize,
    font: timesRomanBoldFont,
    color: primaryColor,
  });

  // Decorative line under header
  page.drawLine({
    start: { x: width / 2 - 150, y: height - 115 },
    end: { x: width / 2 + 150, y: height - 115 },
    thickness: 2,
    color: goldColor,
  });

  // "This is to certify that"
  const certifyText = "This is to certify that";
  const certifyFontSize = 14;
  const certifyWidth = timesRomanFont.widthOfTextAtSize(certifyText, certifyFontSize);
  
  page.drawText(certifyText, {
    x: (width - certifyWidth) / 2,
    y: height - 170,
    size: certifyFontSize,
    font: timesRomanFont,
    color: darkGray,
  });

  // Recipient name
  const nameFontSize = 36;
  const nameWidth = timesRomanBoldFont.widthOfTextAtSize(data.recipientName, nameFontSize);
  
  page.drawText(data.recipientName, {
    x: (width - nameWidth) / 2,
    y: height - 220,
    size: nameFontSize,
    font: timesRomanBoldFont,
    color: darkGray,
  });

  // Decorative line under name
  page.drawLine({
    start: { x: width / 2 - 200, y: height - 235 },
    end: { x: width / 2 + 200, y: height - 235 },
    thickness: 1,
    color: lightGray,
  });

  // "has successfully completed"
  const completedText = "has successfully completed the";
  const completedFontSize = 14;
  const completedWidth = timesRomanFont.widthOfTextAtSize(completedText, completedFontSize);
  
  page.drawText(completedText, {
    x: (width - completedWidth) / 2,
    y: height - 280,
    size: completedFontSize,
    font: timesRomanFont,
    color: darkGray,
  });

  // Course/Path type
  const typeText = data.type === "course" ? "Course" : "Learning Path";
  const typeFontSize = 16;
  const typeWidth = timesRomanBoldFont.widthOfTextAtSize(typeText, typeFontSize);
  
  page.drawText(typeText, {
    x: (width - typeWidth) / 2,
    y: height - 310,
    size: typeFontSize,
    font: timesRomanBoldFont,
    color: primaryColor,
  });

  // Course/Path name
  const itemName = data.courseName || data.pathName || "Unknown";
  const itemFontSize = 24;
  const itemWidth = timesRomanBoldFont.widthOfTextAtSize(itemName, itemFontSize);
  
  // Handle long names by reducing font size
  let adjustedItemFontSize = itemFontSize;
  let adjustedItemWidth = itemWidth;
  while (adjustedItemWidth > width - 120 && adjustedItemFontSize > 14) {
    adjustedItemFontSize -= 2;
    adjustedItemWidth = timesRomanBoldFont.widthOfTextAtSize(itemName, adjustedItemFontSize);
  }
  
  page.drawText(itemName, {
    x: (width - adjustedItemWidth) / 2,
    y: height - 350,
    size: adjustedItemFontSize,
    font: timesRomanBoldFont,
    color: darkGray,
  });

  // Decorative divider
  page.drawLine({
    start: { x: width / 2 - 100, y: height - 380 },
    end: { x: width / 2 + 100, y: height - 380 },
    thickness: 1,
    color: goldColor,
  });

  // "Issued on" date
  const dateStr = data.issuedAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const issuedText = `Issued on ${dateStr}`;
  const issuedFontSize = 12;
  const issuedWidth = helveticaFont.widthOfTextAtSize(issuedText, issuedFontSize);
  
  page.drawText(issuedText, {
    x: (width - issuedWidth) / 2,
    y: height - 420,
    size: issuedFontSize,
    font: helveticaFont,
    color: lightGray,
  });

  // Organization name
  const orgText = "AI Genius Lab";
  const orgFontSize = 20;
  const orgWidth = timesRomanBoldFont.widthOfTextAtSize(orgText, orgFontSize);
  
  page.drawText(orgText, {
    x: (width - orgWidth) / 2,
    y: height - 470,
    size: orgFontSize,
    font: timesRomanBoldFont,
    color: primaryColor,
  });

  // Signature line
  page.drawLine({
    start: { x: width / 2 - 80, y: height - 490 },
    end: { x: width / 2 + 80, y: height - 490 },
    thickness: 1,
    color: darkGray,
  });

  // "Authorized Signature"
  const sigText = "Authorized Signature";
  const sigFontSize = 10;
  const sigWidth = helveticaFont.widthOfTextAtSize(sigText, sigFontSize);
  
  page.drawText(sigText, {
    x: (width - sigWidth) / 2,
    y: height - 505,
    size: sigFontSize,
    font: helveticaFont,
    color: lightGray,
  });

  // Certificate ID at bottom
  const certIdText = `Certificate ID: ${data.certificateId}`;
  const certIdFontSize = 9;
  const certIdWidth = helveticaFont.widthOfTextAtSize(certIdText, certIdFontSize);
  
  page.drawText(certIdText, {
    x: (width - certIdWidth) / 2,
    y: borderMargin + 20,
    size: certIdFontSize,
    font: helveticaFont,
    color: lightGray,
  });

  // Verification URL - commented out due to border overlap
  // const verifyUrl = `Verify at: ${process.env.NEXTAUTH_URL || "https://aigeniuslab.com"}/certificates/verify/${data.certificateId}`;
  // const verifyFontSize = 8;
  // const verifyWidth = helveticaFont.widthOfTextAtSize(verifyUrl, verifyFontSize);
  
  // page.drawText(verifyUrl, {
  //   x: (width - verifyWidth) / 2,
  //   y: borderMargin + 8,
  //   size: verifyFontSize,
  //   font: helveticaFont,
  //   color: lightGray,
  // });

  // Serialize the PDF to bytes
  const pdfBytes = await pdfDoc.save();

  // Upload to Cloudinary
  const { secureUrl } = await uploadToCloudinary(Buffer.from(pdfBytes), {
    folder: "certificates",
    resourceType: "raw",
    publicId: `certificate-${data.certificateId}.pdf`,
  });

  return secureUrl;
}

/**
 * Generate a certificate PDF and return the bytes directly
 * Used for direct download without uploading to Cloudinary
 */
export async function generateCertificatePDFBytes(
  data: CertificateData
): Promise<Buffer> {
  // Create a new PDF document (landscape A4)
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // A4 landscape

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

  // Draw decorative border
  const borderMargin = 30;
  const borderWidth = 3;
  
  // Outer border
  page.drawRectangle({
    x: borderMargin,
    y: borderMargin,
    width: width - 2 * borderMargin,
    height: height - 2 * borderMargin,
    borderColor: goldColor,
    borderWidth: borderWidth,
  });

  // Inner border
  page.drawRectangle({
    x: borderMargin + 10,
    y: borderMargin + 10,
    width: width - 2 * (borderMargin + 10),
    height: height - 2 * (borderMargin + 10),
    borderColor: primaryColor,
    borderWidth: 1,
  });

  // Draw corner decorations
  const cornerSize = 20;
  const corners = [
    { x: borderMargin + 5, y: height - borderMargin - 5 },
    { x: width - borderMargin - 5, y: height - borderMargin - 5 },
    { x: borderMargin + 5, y: borderMargin + 5 },
    { x: width - borderMargin - 5, y: borderMargin + 5 },
  ];

  corners.forEach((corner) => {
    page.drawCircle({
      x: corner.x,
      y: corner.y,
      size: 8,
      color: goldColor,
    });
  });

  // Header: "CERTIFICATE OF COMPLETION"
  const headerText = "CERTIFICATE OF COMPLETION";
  const headerFontSize = 28;
  const headerWidth = timesRomanBoldFont.widthOfTextAtSize(headerText, headerFontSize);
  
  page.drawText(headerText, {
    x: (width - headerWidth) / 2,
    y: height - 100,
    size: headerFontSize,
    font: timesRomanBoldFont,
    color: primaryColor,
  });

  // Decorative line under header
  page.drawLine({
    start: { x: width / 2 - 150, y: height - 115 },
    end: { x: width / 2 + 150, y: height - 115 },
    thickness: 2,
    color: goldColor,
  });

  // "This is to certify that"
  const certifyText = "This is to certify that";
  const certifyFontSize = 14;
  const certifyWidth = timesRomanFont.widthOfTextAtSize(certifyText, certifyFontSize);
  
  page.drawText(certifyText, {
    x: (width - certifyWidth) / 2,
    y: height - 170,
    size: certifyFontSize,
    font: timesRomanFont,
    color: darkGray,
  });

  // Recipient name
  const nameFontSize = 36;
  const nameWidth = timesRomanBoldFont.widthOfTextAtSize(data.recipientName, nameFontSize);
  
  page.drawText(data.recipientName, {
    x: (width - nameWidth) / 2,
    y: height - 220,
    size: nameFontSize,
    font: timesRomanBoldFont,
    color: darkGray,
  });

  // Decorative line under name
  page.drawLine({
    start: { x: width / 2 - 200, y: height - 235 },
    end: { x: width / 2 + 200, y: height - 235 },
    thickness: 1,
    color: lightGray,
  });

  // "has successfully completed"
  const completedText = "has successfully completed the";
  const completedFontSize = 14;
  const completedWidth = timesRomanFont.widthOfTextAtSize(completedText, completedFontSize);
  
  page.drawText(completedText, {
    x: (width - completedWidth) / 2,
    y: height - 280,
    size: completedFontSize,
    font: timesRomanFont,
    color: darkGray,
  });

  // Course/Path type
  const typeText = data.type === "course" ? "Course" : "Learning Path";
  const typeFontSize = 16;
  const typeWidth = timesRomanBoldFont.widthOfTextAtSize(typeText, typeFontSize);
  
  page.drawText(typeText, {
    x: (width - typeWidth) / 2,
    y: height - 310,
    size: typeFontSize,
    font: timesRomanBoldFont,
    color: primaryColor,
  });

  // Course/Path name
  const itemName = data.courseName || data.pathName || "Unknown";
  const itemFontSize = 24;
  const itemWidth = timesRomanBoldFont.widthOfTextAtSize(itemName, itemFontSize);
  
  // Handle long names by reducing font size
  let adjustedItemFontSize = itemFontSize;
  let adjustedItemWidth = itemWidth;
  while (adjustedItemWidth > width - 120 && adjustedItemFontSize > 14) {
    adjustedItemFontSize -= 2;
    adjustedItemWidth = timesRomanBoldFont.widthOfTextAtSize(itemName, adjustedItemFontSize);
  }
  
  page.drawText(itemName, {
    x: (width - adjustedItemWidth) / 2,
    y: height - 350,
    size: adjustedItemFontSize,
    font: timesRomanBoldFont,
    color: darkGray,
  });

  // Decorative divider
  page.drawLine({
    start: { x: width / 2 - 100, y: height - 380 },
    end: { x: width / 2 + 100, y: height - 380 },
    thickness: 1,
    color: goldColor,
  });

  // "Issued on" date
  const dateStr = data.issuedAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const issuedText = `Issued on ${dateStr}`;
  const issuedFontSize = 12;
  const issuedWidth = helveticaFont.widthOfTextAtSize(issuedText, issuedFontSize);
  
  page.drawText(issuedText, {
    x: (width - issuedWidth) / 2,
    y: height - 420,
    size: issuedFontSize,
    font: helveticaFont,
    color: lightGray,
  });

  // Organization name
  const orgText = "AI Genius Lab";
  const orgFontSize = 20;
  const orgWidth = timesRomanBoldFont.widthOfTextAtSize(orgText, orgFontSize);
  
  page.drawText(orgText, {
    x: (width - orgWidth) / 2,
    y: height - 470,
    size: orgFontSize,
    font: timesRomanBoldFont,
    color: primaryColor,
  });

  // Signature line
  page.drawLine({
    start: { x: width / 2 - 80, y: height - 490 },
    end: { x: width / 2 + 80, y: height - 490 },
    thickness: 1,
    color: darkGray,
  });

  // "Authorized Signature"
  const sigText = "Authorized Signature";
  const sigFontSize = 10;
  const sigWidth = helveticaFont.widthOfTextAtSize(sigText, sigFontSize);
  
  page.drawText(sigText, {
    x: (width - sigWidth) / 2,
    y: height - 505,
    size: sigFontSize,
    font: helveticaFont,
    color: lightGray,
  });

  // Certificate ID at bottom
  const certIdText = `Certificate ID: ${data.certificateId}`;
  const certIdFontSize = 9;
  const certIdWidth = helveticaFont.widthOfTextAtSize(certIdText, certIdFontSize);
  
  page.drawText(certIdText, {
    x: (width - certIdWidth) / 2,
    y: borderMargin + 20,
    size: certIdFontSize,
    font: helveticaFont,
    color: lightGray,
  });

  // Verification URL - commented out due to border overlap
  // const verifyUrl = `Verify at: ${process.env.NEXTAUTH_URL || "https://aigeniuslab.com"}/certificates/verify/${data.certificateId}`;
  // const verifyFontSize = 8;
  // const verifyWidth = helveticaFont.widthOfTextAtSize(verifyUrl, verifyFontSize);
  
  // page.drawText(verifyUrl, {
  //   x: (width - verifyWidth) / 2,
  //   y: borderMargin + 8,
  //   size: verifyFontSize,
  //   font: helveticaFont,
  //   color: lightGray,
  // });

  // Serialize the PDF to bytes and return as Buffer
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
