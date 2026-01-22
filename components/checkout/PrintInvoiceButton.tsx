"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function PrintInvoiceButton() {
  const handlePrint = () => {
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handlePrint}
      className="flex-1 print:hidden"
      type="button"
    >
      <Download className="h-4 w-4 mr-2" />
      Download Invoice
    </Button>
  );
}
