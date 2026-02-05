"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Sparkles, Zap, ShieldCheck } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/20 blur-[120px] rounded-full opacity-50 z-0" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
          <Card glass className="relative shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] border-white/10 rounded-[3rem] overflow-hidden">
            {/* Inner Decorative Gradients */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-3xl -mr-20 -mt-20 rounded-full" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 blur-3xl -ml-20 -mb-20 rounded-full" />

            <div className="relative z-10 px-8 py-20 md:py-24 text-center max-w-4xl mx-auto space-y-10">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border border-primary/20">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Limited Enrollment</span>
                </div>
                <h2 className="font-display text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">
                  Start Learning AI <br />
                  <span className="text-primary">the Right Way</span>
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                <Link href="/courses" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="premium"
                    className="w-full sm:px-12 h-16 rounded-2xl text-lg group"
                  >
                    Browse Courses
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-2" />
                  </Button>
                </Link>
                <Link href="/sign-up" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:px-12 h-16 rounded-2xl border-2 font-bold hover:bg-white/5 transition-all text-lg"
                  >
                    Create Free Account
                  </Button>
                </Link>
              </div>

              <div className="pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: Zap, label: "One-Time Payment", sub: "Pay once per course" },
                  { icon: ShieldCheck, label: "Lifetime Access", sub: "Never lose your seats" },
                  { icon: Sparkles, label: "No Subscriptions", sub: "Zero recurring fees" }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/10">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{item.label}</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
