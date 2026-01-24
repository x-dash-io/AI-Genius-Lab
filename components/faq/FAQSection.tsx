"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Courses & Learning
  {
    category: "Courses & Learning",
    question: "How do I access my purchased courses?",
    answer: "After purchasing a course, you can access it immediately from your Library. Navigate to the 'My Courses' section in your dashboard, and all your purchased courses will be listed there. Click on any course to start learning.",
  },
  {
    category: "Courses & Learning",
    question: "Can I download course videos?",
    answer: "Video downloads are only available for courses where the instructor has explicitly enabled this feature. You can check if downloads are available on the course details page. All courses can be streamed online anytime.",
  },
  {
    category: "Courses & Learning",
    question: "How long do I have access to a course?",
    answer: "Once you purchase a course, you have lifetime access. You can learn at your own pace and revisit the content anytime. There are no time limits or expiration dates.",
  },
  {
    category: "Courses & Learning",
    question: "Is my progress saved automatically?",
    answer: "Yes! Your progress is automatically tracked as you complete lessons. You can see your completion percentage on each course, and the platform will remember where you left off so you can easily resume learning.",
  },
  {
    category: "Courses & Learning",
    question: "What are Learning Paths?",
    answer: "Learning Paths are curated collections of courses designed to take you from beginner to advanced in a specific area. They provide a structured learning journey with courses organized in the optimal order for skill development.",
  },
  {
    category: "Courses & Learning",
    question: "Can I get a certificate after completing a course?",
    answer: "Yes! Upon completing all lessons in a course, you'll receive a certificate of completion. You can download it as a PDF and share it on LinkedIn or include it in your portfolio.",
  },
  {
    category: "Courses & Learning",
    question: "Are courses updated regularly?",
    answer: "Yes, instructors regularly update course content to reflect the latest AI tools, techniques, and best practices. You'll automatically have access to all updates for courses you've purchased.",
  },
  {
    category: "Courses & Learning",
    question: "Can I preview a course before buying?",
    answer: "Yes! Most courses offer preview lessons that you can watch for free. Look for the 'Preview' badge on lesson titles in the course curriculum section.",
  },

  // Payments & Billing
  {
    category: "Payments & Billing",
    question: "What payment methods do you accept?",
    answer: "We accept payments through PayPal, which supports credit cards, debit cards, and PayPal balance. This ensures secure and convenient checkout for customers worldwide.",
  },
  {
    category: "Payments & Billing",
    question: "Is my payment information secure?",
    answer: "Absolutely. We use PayPal for payment processing, which means your financial information is handled by one of the world's most trusted payment platforms. We never store your credit card details on our servers.",
  },
  {
    category: "Payments & Billing",
    question: "Can I get a refund?",
    answer: "We offer a 30-day money-back guarantee on all courses. If you're not satisfied with a course, contact our support team within 30 days of purchase for a full refund. No questions asked.",
  },
  {
    category: "Payments & Billing",
    question: "Do you offer discounts or promotions?",
    answer: "Yes! We regularly run promotions and offer discounts on courses and learning paths. Sign up for our newsletter to be notified of special offers. We also offer bundle discounts when purchasing multiple courses together.",
  },
  {
    category: "Payments & Billing",
    question: "Can I purchase courses as a gift?",
    answer: "Gift purchases are not currently available. Each course purchase is tied to the purchasing account and cannot be transferred to another user.",
  },
  {
    category: "Payments & Billing",
    question: "Will I receive an invoice for my purchase?",
    answer: "Yes, you'll receive an email with your invoice immediately after purchase. You can also download invoices from your purchase history in your account settings.",
  },

  // Account & Access
  {
    category: "Account & Access",
    question: "How do I create an account?",
    answer: "Click the 'Sign Up' button in the top navigation. You'll need to provide your email address and create a password. We'll send you a verification code to confirm your email address.",
  },
  {
    category: "Account & Access",
    question: "I forgot my password. How do I reset it?",
    answer: "Click 'Forgot Password' on the sign-in page. Enter your email address, and we'll send you a password reset link. Follow the instructions in the email to create a new password.",
  },
  {
    category: "Account & Access",
    question: "Can I change my email address?",
    answer: "Yes, you can update your email address in your profile settings. Go to Profile > Settings, update your email, and verify the new address through the confirmation email we'll send.",
  },
  {
    category: "Account & Access",
    question: "Can I use my account on multiple devices?",
    answer: "Yes! You can access your account from any device - computer, tablet, or smartphone. Your progress syncs automatically across all devices, so you can learn anywhere.",
  },
  {
    category: "Account & Access",
    question: "How do I delete my account?",
    answer: "If you wish to delete your account, please contact our support team. Note that deleting your account will remove access to all purchased courses and cannot be undone.",
  },

  // Technical Support
  {
    category: "Technical Support",
    question: "Videos won't play. What should I do?",
    answer: "First, check your internet connection. If the issue persists, try clearing your browser cache or using a different browser. Make sure you're using an up-to-date browser version. If problems continue, contact our support team.",
  },
  {
    category: "Technical Support",
    question: "What browsers are supported?",
    answer: "AI Genius Lab works best on the latest versions of Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for the best experience.",
  },
  {
    category: "Technical Support",
    question: "Can I use the platform on mobile devices?",
    answer: "Yes! Our platform is fully responsive and works great on smartphones and tablets. You can learn on the go using any mobile browser.",
  },
  {
    category: "Technical Support",
    question: "I'm experiencing slow loading times. How can I fix this?",
    answer: "Slow loading can be caused by internet connection issues. Try refreshing the page, checking your internet speed, or switching to a different network. If you're on mobile, consider switching from cellular to Wi-Fi for better streaming quality.",
  },
];

const categories = Array.from(new Set(faqData.map((item) => item.category)));

export function FAQSection() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  // Filter FAQ items based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return faqData;
    }

    const query = searchQuery.toLowerCase();
    return faqData.filter(
      (item) =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Get categories from filtered data
  const filteredCategories = useMemo(() => {
    return Array.from(new Set(filteredData.map((item) => item.category)));
  }, [filteredData]);

  return (
    <div className="grid gap-8">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search for answers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Show message if no results */}
      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No results found for "{searchQuery}". Try different keywords or{" "}
            <button
              onClick={() => setSearchQuery("")}
              className="text-primary hover:underline"
            >
              clear search
            </button>
            .
          </p>
        </div>
      )}

      {/* FAQ Categories and Items */}
      {filteredCategories.map((category) => {
        const categoryItems = filteredData.filter((item) => item.category === category);
        
        return (
          <div key={category} className="grid gap-4">
            <h2 className="text-2xl font-bold">{category}</h2>
            <div className="grid gap-3">
              {categoryItems.map((item, index) => {
                const globalIndex = faqData.indexOf(item);
                const isOpen = openItems.has(globalIndex);
                
                return (
                  <motion.div
                    key={globalIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleItem(globalIndex)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-accent transition-colors"
                    >
                      <span className="font-semibold pr-4">{item.question}</span>
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 shrink-0 transition-transform duration-200",
                          isOpen && "transform rotate-180"
                        )}
                      />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-0 text-muted-foreground">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
