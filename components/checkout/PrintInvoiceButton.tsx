"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function PrintInvoiceButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handlePrint}
      className="flex-1"
    >
      <Download className="h-4 w-4 mr-2" />
      Download Invoice
    </Button>
  );
}
