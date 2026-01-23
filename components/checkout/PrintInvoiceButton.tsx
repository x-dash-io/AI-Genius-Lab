"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";

interface PrintInvoiceButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  invoiceData: {
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
  };
}

export function PrintInvoiceButton({
  variant = "outline",
  size = "lg",
  className = "flex-1",
  invoiceData,
}: PrintInvoiceButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = useCallback(async () => {
    setIsGenerating(true);

    try {
      // Call the API to generate PDF
      const response = await fetch("/api/invoice-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const data = await response.json();
      const pdfUrl = data.pdfUrl;

      // Create a temporary link to download the PDF
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `invoice-${invoiceData.invoiceNumber}.pdf`;
      link.target = '_blank';

      // Trigger the download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Invoice downloaded",
        description: "Your invoice PDF has been downloaded successfully.",
        variant: "success",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Download failed",
        description: "Failed to generate invoice PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [invoiceData]);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownloadPDF}
      disabled={isGenerating}
      className={className}
      type="button"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Download Invoice
        </>
      )}
    </Button>
  );
}
