"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type SyncPlansResult = {
  success?: boolean;
  count?: number;
  errors?: string[];
};

export function SyncPlansButton({
  syncAction,
  className,
}: {
  syncAction: () => Promise<SyncPlansResult>;
  className?: string;
}) {
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();

  async function handleSync() {
    setIsSyncing(true);
    try {
      const result = await syncAction();
      if (result?.success) {
        toast({
          title: "Success",
          description: `Successfully synced ${result.count} plans to PayPal.`,
          variant: "success",
        });
      } else {
        toast({
          title: "Partial Success",
          description: `Synced ${result?.count || 0} plans. Some errors occurred: ${result?.errors?.join(", ")}`,
          variant: "warning",
        });
      }
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred during sync.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <Button
      onClick={handleSync}
      disabled={isSyncing}
      variant="premium"
      className={cn("gap-2 shadow-lg shadow-primary/20 !px-6", className)}
    >
      {isSyncing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      {isSyncing ? "Syncing..." : "Sync to PayPal"}
    </Button>
  );
}
