"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Menu, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CartIcon } from "@/components/cart/CartIcon";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { adminNavigation, customerPreviewLinks } from "./AdminConfig";
import { AdminUserSection } from "./AdminUserSection";

export function AdminMobileMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const menuRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleScroll = () => setIsOpen(false);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsOpen(false);
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
    }, [isOpen]);

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 h-16">
                <div className="flex items-center justify-between px-4 h-full">
                    <Link href="/admin" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-display text-lg font-bold tracking-tight">ADMIN</span>
                    </Link>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <CartIcon />
                        <ThemeToggle />
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="h-10 w-10">
                            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {isOpen && (
                    <>
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.nav
                            key="menu"
                            ref={menuRef}
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed left-0 top-0 bottom-0 z-50 w-72 max-w-[85vw] bg-background/95 backdrop-blur-md border-r shadow-2xl overflow-y-auto md:hidden flex flex-col"
                        >
                            <div className="border-b p-4 flex items-center justify-between sticky top-0 bg-card/95 backdrop-blur-md z-10 h-16 flex-shrink-0">
                                <Link href="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                                        <Shield className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="font-display text-lg font-bold">ADMIN</span>
                                </Link>
                            </div>

                            <div className="flex-1 px-3 py-4">
                                <div className="space-y-4">
                                    <div>
                                        <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">Admin Panel</p>
                                        <div className="space-y-1">
                                            {adminNavigation.map((item, index) => {
                                                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                                                const Icon = item.icon;
                                                return (
                                                    <motion.div key={item.href} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * (index + 1) }}>
                                                        <Link
                                                            href={item.href}
                                                            onClick={() => setIsOpen(false)}
                                                            className={cn(
                                                                "group relative flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 overflow-hidden active:scale-[0.98]",
                                                                isActive ? "bg-gradient-to-r from-primary/90 to-primary text-primary-foreground shadow-sm" : "text-foreground hover:text-accent-foreground"
                                                            )}
                                                        >
                                                            <Icon className="h-5 w-5 relative z-10" />
                                                            <span className="relative z-10">{item.name}</span>
                                                        </Link>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="flex items-center gap-2 mb-2 px-3">
                                            <Eye className="h-3.5 w-3.5 text-amber-500" />
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Customer Preview</p>
                                        </div>
                                        <div className="space-y-1">
                                            {customerPreviewLinks.map((item, index) => (
                                                <motion.div key={item.href} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * (index + 4) }}>
                                                    <Link
                                                        href={`${item.href}?preview=true`}
                                                        target="_blank"
                                                        onClick={() => setIsOpen(false)}
                                                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground hover:text-amber-700 dark:hover:text-amber-300 transition-all"
                                                    >
                                                        <item.icon className="h-5 w-5" />
                                                        <span>{item.name}</span>
                                                    </Link>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t px-4 py-4 mt-auto bg-card/95 backdrop-blur-md flex-shrink-0">
                                <AdminUserSection isMobile closeMenu={() => setIsOpen(false)} />
                            </div>
                        </motion.nav>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
