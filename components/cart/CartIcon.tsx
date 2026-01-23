"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "./CartProvider";
import { motion } from "framer-motion";

export function CartIcon() {
  const { cart, isLoading } = useCart();

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" className="relative" disabled>
        <ShoppingCart className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Link href="/cart">
      <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10">
        <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
        {cart.itemCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1"
          >
            <Badge
              variant="destructive"
              className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full p-0 text-[10px] sm:text-xs font-bold"
            >
              {cart.itemCount > 9 ? "9+" : cart.itemCount}
            </Badge>
          </motion.div>
        )}
      </Button>
    </Link>
  );
}
