"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Check } from "lucide-react";

const securityFeatures = [
  "Pay-gated content (non-buyers blocked)",
  "Server-side access enforcement",
  "Signed video URLs",
  "No downloads unless allowed",
];

export function SecuritySection() {
  return (
    <section className="grid gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Lock className="h-6 w-6 text-primary" />
              <CardTitle>Secure Access, Always</CardTitle>
            </div>
            <CardDescription>
              Your learning content is protected with industry-standard security measures.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3">
              {securityFeatures.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
