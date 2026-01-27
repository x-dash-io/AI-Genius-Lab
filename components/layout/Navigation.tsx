"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: number | string;
}

interface NavigationProps {
  items: NavItem[];
  getHref?: (baseHref: string) => string;
  className?: string;
}

export function Navigation({ items, getHref, className }: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("space-y-1", className)}>
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        const href = getHref ? getHref(item.href) : item.href;
        const badgeValue = typeof item.badge === "number" ? item.badge : undefined;

        return (
          <motion.div
            key={item.href}
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Link
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all min-h-[44px] touch-manipulation",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground active:scale-[0.98]"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="flex-1 truncate">{item.name}</span>
              {badgeValue !== undefined && badgeValue > 0 && (
                <Badge
                  variant="destructive"
                  className="h-5 min-w-[20px] flex items-center justify-center rounded-full px-1.5 text-[10px] font-bold"
                >
                  {badgeValue > 9 ? "9+" : badgeValue}
                </Badge>
              )}
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
}
