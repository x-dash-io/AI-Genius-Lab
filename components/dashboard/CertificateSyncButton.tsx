"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Award } from "lucide-react";
import { toast } from "@/lib/toast";

export function CertificateSyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch("/api/certificates/sync", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Certificate Sync Complete!",
          description: data.message,
          variant: "success",
        });
        
        // Refresh the page to show updated certificates
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast({
          title: "Sync Failed",
          description: data.error || "Failed to sync certificates",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sync certificates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={isSyncing}
      variant="outline"
      size="sm"
      className="w-full"
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
      {isSyncing ? "Syncing..." : "Sync Missing Certificates"}
    </Button>
  );
}
