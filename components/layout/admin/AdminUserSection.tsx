"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { CartIcon } from "@/components/cart/CartIcon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminUserSection({ isMobile = false, closeMenu }: { isMobile?: boolean, closeMenu?: () => void }) {
    const { data: session } = useSession();
    const avatarUrl = session?.user?.image;

    if (!session?.user) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <motion.div
                        className="p-2 rounded-xl hover:bg-accent transition-colors duration-200 cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <CartIcon />
                    </motion.div>
                    <motion.div
                        className="p-2 rounded-xl hover:bg-accent transition-colors duration-200 cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ThemeToggle />
                    </motion.div>
                </div>
                <div className={cn("grid gap-2", isMobile ? "grid-cols-2" : "grid-cols-1")}>
                    <Link href="/sign-in" className="w-full">
                        <Button variant="outline" className="w-full justify-center">Sign In</Button>
                    </Link>
                    <Link href="/sign-up" className="w-full">
                        <Button className="w-full justify-center">Join</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Link href="/admin/profile" onClick={closeMenu}>
                <motion.div
                    whileHover={{ y: -2, boxShadow: "0 12px 40px rgba(0,0,0,0.15)" }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                        "group relative flex items-center gap-3 p-4 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 transition-all cursor-pointer shadow-lg hover:shadow-xl"
                    )}
                    style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                        backdropFilter: "blur(10px)"
                    }}
                >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative flex-shrink-0">
                        <Avatar className="h-10 w-10 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                            <AvatarImage src={avatarUrl || undefined} alt={session.user.name || session.user.email || "Admin"} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-bold">
                                {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || "A"}
                            </AvatarFallback>
                        </Avatar>
                        <motion.div
                            className="absolute -inset-1 rounded-full border-2 border-primary/30"
                            animate={{
                                background: [
                                    "linear-gradient(45deg, transparent 30%, rgba(var(--color-primary), 0.1) 50%, transparent 70%)",
                                    "linear-gradient(45deg, transparent 30%, rgba(var(--color-primary), 0.05) 50%, transparent 70%)"
                                ]
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                    </div>

                    <div className="flex-1 overflow-hidden min-w-0 flex flex-col justify-center">
                        <p className="truncate text-sm font-bold text-foreground group-hover:text-primary transition-colors duration-200">
                            {session.user.name || "User"}
                        </p>
                        <p className="truncate text-[10px] uppercase font-bold tracking-wider text-muted-foreground group-hover:text-foreground/80 transition-colors duration-200">
                            Admin
                        </p>
                    </div>
                </motion.div>
            </Link>

            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-center gap-2">
                    <motion.div
                        className="p-2 rounded-xl hover:bg-accent transition-colors duration-200 cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <CartIcon />
                    </motion.div>
                    <motion.div
                        className="p-2 rounded-xl hover:bg-accent transition-colors duration-200 cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ThemeToggle />
                    </motion.div>
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
                    <SignOutButton className="w-full h-10 text-[10px] font-bold uppercase tracking-widest shadow-lg hover:shadow-xl hover:shadow-destructive/25 border-none rounded-xl transition-all duration-300" />
                </motion.div>
            </div>
        </div>
    );
}
