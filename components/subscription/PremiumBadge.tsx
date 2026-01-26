"use client";

import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PremiumBadgeProps {
  variant?: "default" | "small";
  showTooltip?: boolean;
}

export function PremiumBadge({ variant = "default", showTooltip = true }: PremiumBadgeProps) {
  const badge = (
    <Badge
      variant="secondary"
      className={`${variant === "small" ? "text-xs px-2 py-0.5" : ""} bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0`}
    >
      <Crown className={`h-3 w-3 ${variant === "small" ? "mr-1" : "mr-2"}`} />
      Premium
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">Available with Premium Subscription</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
