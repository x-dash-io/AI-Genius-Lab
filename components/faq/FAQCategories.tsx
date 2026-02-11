"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { BookOpen, CreditCard, Lock, Settings } from "lucide-react";

const categories = [
  {
    icon: BookOpen,
    title: "Courses & Learning",
    count: 8,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: CreditCard,
    title: "Payments & Billing",
    count: 6,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Lock,
    title: "Account & Access",
    count: 5,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Settings,
    title: "Technical Support",
    count: 4,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
];

export function FAQCategories() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category, index) => {
        const Icon = category.icon;
        return (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${category.bgColor}`}>
                  <Icon className={`h-5 w-5 ${category.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{category.title}</h3>
                  <p className="text-xs text-muted-foreground">{category.count} articles</p>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
