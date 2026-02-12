"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Eye, Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminNavigation, customerPreviewLinks } from "./AdminConfig";
import { AdminUserSection } from "./AdminUserSection";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SidebarProvider, useSidebar } from "@/components/layout/useSidebar";

function AdminSidebarContent() {
    const pathname = usePathname();
    const { isCollapsed, toggleCollapsed } = useSidebar();

    return (
        <motion.aside
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={cn(
                "flex fixed left-0 top-0 bottom-0 z-20 flex-col overflow-hidden border-r bg-background/90 backdrop-blur-md transition-all duration-300",
                isCollapsed ? "w-16" : "w-64"
            )}
        >
            <div className={cn("flex-shrink-0 border-b", isCollapsed ? "p-3" : "p-6")}>
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(isCollapsed ? "flex flex-col items-center gap-2" : "flex items-center gap-2")}
                >
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-white" />
                    </div>
                    <Link href="/admin" className={cn("font-display text-lg font-bold tracking-tight", isCollapsed && "sr-only")}>
                        ADMIN
                    </Link>
                    <button
                        onClick={toggleCollapsed}
                        className={cn(
                            "rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
                            !isCollapsed && "ml-auto"
                        )}
                        aria-label="Toggle sidebar"
                    >
                        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </button>
                </motion.div>
            </div>

            <div className={cn("flex-1 overflow-y-auto py-6", isCollapsed ? "px-2" : "px-4")}>
                <div className="space-y-6">
                    <div>
                        {!isCollapsed ? (
                            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
                                Admin Panel
                            </p>
                        ) : null}
                        <nav className="space-y-1">
                            {adminNavigation.map((item) => {
                                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                                const Icon = item.icon;
                                return (
                                    <motion.div
                                        key={item.href}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    >
                                        <Link
                                            href={item.href}
                                            title={isCollapsed ? item.name : undefined}
                                            className={cn(
                                                "group relative flex items-center rounded-lg py-2.5 text-sm font-medium transition-all duration-200 overflow-hidden",
                                                isCollapsed ? "justify-center px-2" : "gap-3 px-3",
                                                "hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5",
                                                "hover:shadow-sm hover:shadow-primary/10",
                                                isActive
                                                    ? "bg-gradient-to-r from-primary/90 to-primary text-primary-foreground shadow-sm"
                                                    : "text-muted-foreground hover:text-accent-foreground"
                                            )}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary opacity-90"
                                                    initial={false}
                                                    animate={{
                                                        background: [
                                                            "linear-gradient(90deg, rgb(var(--color-primary) * 0.8) 0%, rgb(var(--color-primary)) 50%, rgb(var(--color-primary) * 0.8) 100%)",
                                                            "linear-gradient(90deg, rgb(var(--color-primary)) 0%, rgb(var(--color-primary) * 0.8) 50%, rgb(var(--color-primary)) 100%)",
                                                            "linear-gradient(90deg, rgb(var(--color-primary) * 0.8) 0%, rgb(var(--color-primary)) 50%, rgb(var(--color-primary) * 0.8) 100%)"
                                                        ]
                                                    }}
                                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                                />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            <Icon className="nav-icon h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3 relative z-10" />
                                            <span className={cn("relative z-10 transition-colors duration-200", isCollapsed && "sr-only")}>{item.name}</span>
                                            {isActive && (
                                                <motion.div
                                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full shadow-sm shadow-primary/50"
                                                    layoutId="activeIndicator"
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                />
                                            )}
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="border-t pt-6">
                        {!isCollapsed ? (
                            <div className="px-3 flex items-center gap-2 mb-3">
                                <Eye className="h-3.5 w-3.5 text-amber-500" />
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                    Customer Preview
                                </p>
                            </div>
                        ) : null}
                        <nav className="space-y-1">
                            {customerPreviewLinks.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <motion.div
                                        key={item.href}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    >
                                        <Link
                                            href={`${item.href}?preview=true`}
                                            target="_blank"
                                            title={isCollapsed ? item.name : undefined}
                                            className={cn(
                                                "group relative flex items-center rounded-lg py-2.5 text-sm font-medium transition-all duration-200 overflow-hidden",
                                                isCollapsed ? "justify-center px-2" : "gap-3 px-3",
                                                "hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-amber-400/5",
                                                "hover:shadow-sm hover:shadow-amber-500/10",
                                                "text-foreground hover:text-amber-700 dark:hover:text-amber-300"
                                            )}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            <Icon className="nav-icon h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3 relative z-10" />
                                            <span className={cn("relative z-10 transition-colors duration-200", isCollapsed && "sr-only")}>{item.name}</span>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            </div>

            <div className={cn("flex-shrink-0 mt-auto border-t border-border/50", isCollapsed ? "p-3" : "p-4")}>
                {isCollapsed ? (
                    <div className="flex flex-col items-center gap-2">
                        <Link
                            href="/admin/profile"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            title="Profile"
                        >
                            <User className="h-4 w-4" />
                        </Link>
                        <ThemeToggle />
                    </div>
                ) : (
                    <AdminUserSection />
                )}
            </div>
        </motion.aside>
    );
}

export function AdminSidebar() {
    return (
        <SidebarProvider>
            <AdminSidebarContent />
        </SidebarProvider>
    );
}
