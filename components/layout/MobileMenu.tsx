"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Navigation, type NavItem } from "./Navigation";
import { UserProfile } from "./UserProfile";
import { LogIn, UserPlus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigationItems: NavItem[];
  profileHref: string;
  logoHref: string;
  logoComponent: React.ReactNode;
  showCart?: boolean;
  showThemeToggle?: boolean;
  getHref?: (baseHref: string) => string;
}

export function MobileMenu({
  isOpen,
  onClose,
  navigationItems,
  profileHref,
  logoHref,
  logoComponent,
  showCart = false,
  showThemeToggle = true,
  getHref,
}: MobileMenuProps) {
  const menuRef = useRef<HTMLElement>(null);
  const { data: session, status } = useSession();

  // Close menu on scroll
  useEffect(() => {
    if (!isOpen) return;
    const handleScroll = () => onClose();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOpen, onClose]);

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.nav
            key="menu"
            ref={menuRef}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
            }}
            className="fixed left-0 top-0 bottom-0 z-50 w-72 max-w-[85vw] bg-card/95 backdrop-blur-md border-r shadow-2xl flex flex-col lg:hidden"
          >
            {/* Menu Header */}
            <div className="border-b p-4 flex items-center justify-between bg-card/95 backdrop-blur-md z-10 h-16 flex-shrink-0">
              {logoComponent}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Navigation Items */}
            <div className="px-3 py-4 flex-1 overflow-y-auto">
              <Navigation items={navigationItems} getHref={getHref} />
            </div>

            {/* User Profile Section */}
            {status === "loading" ? (
              <div className="border-t px-4 py-4 space-y-3 sticky bottom-0 bg-card/95 backdrop-blur-md">
                <div className="flex items-center gap-3 p-3 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-48 bg-muted rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-9 w-full bg-muted rounded animate-pulse" />
              </div>
            ) : session?.user ? (
              <UserProfile
                profileHref={profileHref}
                showCart={showCart}
                showThemeToggle={showThemeToggle}
                variant="mobile"
              />
            ) : (
              <div className="border-t px-4 py-5 sticky bottom-0 bg-background/95 backdrop-blur-md">
                <div className="flex flex-col gap-3">
                  <Link href="/sign-in" onClick={onClose}>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sign-up" onClick={onClose}>
                    <Button className="w-full justify-start gap-2">
                      <UserPlus className="h-4 w-4" />
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
