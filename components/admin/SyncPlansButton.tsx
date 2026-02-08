"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";

export function SyncPlansButton({ syncAction }: { syncAction: () => Promise<any> }) {
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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred during sync.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <Button onClick={handleSync} disabled={isSyncing} variant="premium" className="gap-2 shadow-lg shadow-primary/20 !px-6">
      {isSyncing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      {isSyncing ? "Syncing..." : "Sync to PayPal"}
    </Button>
  );
}
