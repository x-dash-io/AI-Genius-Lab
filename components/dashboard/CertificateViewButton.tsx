"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CertificateViewButtonProps {
  certificateId: string;
}

export function CertificateViewButton({ certificateId }: CertificateViewButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
  };

  return (
    <Link href={`/certificates/${certificateId}`} onClick={handleClick}>
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full border-green-200 hover:bg-green-50 hover:border-green-300 dark:border-green-800 dark:hover:bg-green-950/20" 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </>
        ) : (
          "View Certificate"
        )}
      </Button>
    </Link>
  );
}
