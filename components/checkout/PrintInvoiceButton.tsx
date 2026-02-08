"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Printer } from "lucide-react";
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

  const handlePrint = useCallback(() => {
    // Use browser's native print functionality
    window.print();
  }, []);

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
        const errorText = await response.text();
        console.error("PDF generation API failed:", response.status, errorText);
        throw new Error(`Failed to generate PDF: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const pdfUrl = data.pdfUrl;

      if (!pdfUrl) {
        console.error("No PDF URL in response:", data);
        throw new Error("No PDF URL returned from server");
      }

      // Try to fetch the PDF as a blob to enable download
      try {
        const pdfResponse = await fetch(pdfUrl);
        if (!pdfResponse.ok) {
          throw new Error("Failed to fetch PDF");
        }

        const blob = await pdfResponse.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        // Create a temporary link to download the PDF
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `invoice-${invoiceData.invoiceNumber}.pdf`;
        link.style.display = 'none';

        // Trigger the download
        document.body.appendChild(link);
        link.click();

        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        }, 100);
      } catch (fetchError) {
        // If blob download fails (CORS issue), open in new tab as fallback
        console.warn("Blob download failed, opening in new tab:", fetchError);
        window.open(pdfUrl, '_blank');

        toast({
          title: "Invoice opened",
          description: "The invoice has been opened in a new tab. You can download it from there.",
          variant: "success",
        });
        return;
      }

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
    <div className={`flex gap-2 ${className}`}>
      <Button
        variant={variant}
        size={size}
        onClick={handlePrint}
        className="flex-1"
        type="button"
      >
        <Printer className="h-4 w-4 mr-2" />
        Print Invoice
      </Button>
      <Button
        variant={variant}
        size={size}
        onClick={handleDownloadPDF}
        disabled={isGenerating}
        className="flex-1"
        type="button"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Downloading...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </>
        )}
      </Button>
    </div>
  );
}
