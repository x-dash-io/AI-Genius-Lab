"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Printer } from "lucide-react";

interface PrintInvoiceButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function PrintInvoiceButton({ 
  variant = "outline", 
  size = "lg",
  className = "flex-1"
}: PrintInvoiceButtonProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = useCallback(() => {
    setIsPrinting(true);

    // Store current theme state
    const htmlElement = document.documentElement;
    const currentTheme = htmlElement.classList.contains("dark") ? "dark" : "light";
    const currentColorScheme = htmlElement.style.colorScheme;
    
    // Add print-mode class for additional styling control
    htmlElement.classList.add("printing");
    
    // Use requestAnimationFrame to ensure styles are applied before print
    requestAnimationFrame(() => {
      window.print();
      
      // Clean up after print dialog closes
      // Use both afterprint event and timeout as fallback
      const cleanup = () => {
        htmlElement.classList.remove("printing");
        
        // Restore theme state (fixes theme flickering bug)
        if (currentTheme === "dark") {
          htmlElement.classList.add("dark");
          htmlElement.style.colorScheme = "dark";
        } else {
          htmlElement.classList.remove("dark");
          htmlElement.style.colorScheme = "light";
        }
        
        // Also restore any stored color scheme
        if (currentColorScheme) {
          htmlElement.style.colorScheme = currentColorScheme;
        }
        
        setIsPrinting(false);
      };
      
      // Listen for afterprint event
      const handleAfterPrint = () => {
        cleanup();
        window.removeEventListener("afterprint", handleAfterPrint);
      };
      
      window.addEventListener("afterprint", handleAfterPrint);
      
      // Fallback timeout in case afterprint doesn't fire (some browsers)
      setTimeout(() => {
        window.removeEventListener("afterprint", handleAfterPrint);
        cleanup();
      }, 1000);
    });
  }, []);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handlePrint}
      disabled={isPrinting}
      className={`print:hidden ${className}`}
      type="button"
    >
      {isPrinting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Preparing...
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
