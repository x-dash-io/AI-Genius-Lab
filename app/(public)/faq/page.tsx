import { Metadata } from "next";
import { FAQSection } from "@/components/faq/FAQSection";
import { FAQSearch } from "@/components/faq/FAQSearch";
import { FAQCategories } from "@/components/faq/FAQCategories";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export const metadata: Metadata = generateSEOMetadata({
  title: "Frequently Asked Questions - AI Genius Lab",
  description:
    "Find answers to common questions about AI Genius Lab courses, purchases, payments, access, and more.",
  keywords: ["FAQ", "help", "questions", "support", "AI courses", "learning"],
});

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Find answers to common questions about our platform
          </p>
        </div>

        {/* Search */}
        <FAQSearch />

        {/* Categories */}
        <FAQCategories />

        {/* FAQ Sections */}
        <FAQSection />

        {/* Contact CTA */}
        <div className="text-center border-t pt-12">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">
            Can't find what you're looking for? We're here to help.
          </p>
          <Link href="/contact">
            <Button size="lg">
              <MessageCircle className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
