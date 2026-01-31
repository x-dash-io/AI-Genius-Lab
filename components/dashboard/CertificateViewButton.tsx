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
        variant="default" 
        size="sm" 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 shadow-md hover:shadow-lg transition-all duration-200" 
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
