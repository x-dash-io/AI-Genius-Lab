"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageCircle, Clock, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const contactMethods = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Get help via email",
    detail: "support@aigeniuslab.com",
    action: "mailto:support@aigeniuslab.com",
  },
  {
    icon: Clock,
    title: "Response Time",
    description: "We typically respond within",
    detail: "24-48 hours",
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Coming soon",
    detail: "Real-time support",
  },
];

const quickLinks = [
  {
    title: "Frequently Asked Questions",
    description: "Find answers to common questions",
    href: "/faq",
    icon: HelpCircle,
  },
];

export function ContactInfo() {
  return (
    <div className="grid gap-6">
      {/* Contact Methods */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Other ways to reach us
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{method.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {method.description}
                    </p>
                    {method.action ? (
                      <a
                        href={method.action}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {method.detail}
                      </a>
                    ) : (
                      <p className="text-sm font-medium">{method.detail}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>
              Find answers faster
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Link key={index} href={link.href}>
                  <div className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{link.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {link.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Business Hours */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Support Hours</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monday - Friday</span>
              <span className="font-medium">9:00 AM - 6:00 PM EST</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Saturday - Sunday</span>
              <span className="font-medium">Closed</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              You can email us anytime. We respond during business hours.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
