"use client";

import { motion } from "framer-motion";
import { ConfirmDialogProvider } from "@/components/ui/confirm-dialog";
import { Footer } from "@/components/layout/Footer";
import { HeroBackgroundBlobs } from "@/components/ui/hero-background-blobs";
import { AdminSidebar } from "./admin/AdminSidebar";
import { AdminMobileMenu } from "./admin/AdminMobileMenu";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <ConfirmDialogProvider>
      <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
        <HeroBackgroundBlobs />

        {/* Desktop Layout */}
        <div className="hidden md:flex min-h-screen">
          <AdminSidebar />
          <div className="flex-1 flex flex-col ml-64">
            <main className="flex-1">
              <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-4 sm:py-6 pb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {children}
                </motion.div>
              </div>
            </main>
            <Footer />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex md:hidden flex-col min-h-screen">
          <AdminMobileMenu />
          <main className="flex-1 px-4 sm:px-6 py-4 pt-20 pb-12 relative z-10">
            <div className="mx-auto w-full max-w-none sm:max-w-7xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </ConfirmDialogProvider>
  );
}
