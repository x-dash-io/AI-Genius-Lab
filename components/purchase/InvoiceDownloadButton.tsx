"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from "date-fns";

interface InvoiceDownloadButtonProps {
  invoiceNumber: string;
  purchaseDate: Date;
  customerName: string;
  customerEmail: string;
  paymentMethod: string;
  transactionId?: string;
  items: Array<{
    title: string;
    amountCents: number;
    currency: string;
  }>;
  totalAmount: number;
  currency: string;
}

function formatCurrency(cents: number, currency: string = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function InvoiceDownloadButton({
  invoiceNumber,
  purchaseDate,
  customerName,
  customerEmail,
  paymentMethod,
  transactionId,
  items,
  totalAmount,
  currency,
}: InvoiceDownloadButtonProps) {
  const handleDownload = () => {
    const invoiceText = `
AI GENIUS LAB - INVOICE
${invoiceNumber}
Date: ${format(purchaseDate, "MMMM dd, yyyy")}

BILL TO:
${customerName}
${customerEmail}

PAYMENT METHOD: ${paymentMethod}
${transactionId ? `TRANSACTION ID: ${transactionId}` : ''}

ITEMS:
${items.map(item => `- ${item.title}: ${formatCurrency(item.amountCents, item.currency)}`).join('\n')}

TOTAL: ${formatCurrency(totalAmount, currency)}

Thank you for your purchase!
AI Genius Lab • Premium Online Learning Platform
support@aigeniuslab.com
    `.trim();
    
    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoiceNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleDownload}
    >
      <Download className="h-4 w-4 mr-2" />
      Download Invoice
    </Button>
  );
}
