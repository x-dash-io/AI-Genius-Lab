"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

import { testimonials, TestimonialCategory } from "@/lib/testimonials";
import { GraduationCap, Route, BookOpen, Star, Quote } from "lucide-react"; // Re-importing specific icons needed

// ... existing imports ...

const categories = [
  { id: "all" as TestimonialCategory, label: "All", icon: GraduationCap },
  { id: "courses" as TestimonialCategory, label: "Courses", icon: BookOpen },
  { id: "learning-paths" as TestimonialCategory, label: "Learning Paths", icon: Route },
  { id: "platform" as TestimonialCategory, label: "Platform", icon: Star },
];

export default function TestimonialsPage() {
  const [activeCategory, setActiveCategory] = useState<TestimonialCategory>("all");

  const filteredTestimonials = activeCategory === "all"
    ? testimonials
    : testimonials.filter(t => t.category === activeCategory);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 md:p-12 mb-12"
      >
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
          >
            <Quote className="h-4 w-4" />
            Student Success Stories
          </motion.div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Hear From Our Students
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Join thousands of learners who have transformed their careers with AI Genius Lab
          </p>
        </div>

        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </motion.section>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap gap-3 mb-10 justify-center"
      >
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;

          return (
            <Button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              variant={isActive ? "default" : "outline"}
              className={`gap-2 transition-all ${isActive ? 'scale-105' : 'hover:scale-105'}`}
            >
              <Icon className="h-4 w-4" />
              {category.label}
            </Button>
          );
        })}
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-3 gap-4 md:gap-6 mb-12 max-w-3xl mx-auto"
      >
        <div className="text-center p-4 rounded-xl bg-card border">
          <div className="text-3xl md:text-4xl font-bold text-primary mb-1">5,000+</div>
          <div className="text-sm text-muted-foreground">Students</div>
        </div>
        <div className="text-center p-4 rounded-xl bg-card border">
          <div className="text-3xl md:text-4xl font-bold text-primary mb-1">4.9</div>
          <div className="text-sm text-muted-foreground">Avg Rating</div>
        </div>
        <div className="text-center p-4 rounded-xl bg-card border">
          <div className="text-3xl md:text-4xl font-bold text-primary mb-1">98%</div>
          <div className="text-sm text-muted-foreground">Satisfaction</div>
        </div>
      </motion.div>

      {/* Testimonials Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {filteredTestimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative overflow-hidden rounded-xl bg-card border p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute top-4 right-4 text-primary/10 group-hover:text-primary/20 transition-colors">
                <Quote className="h-12 w-12" fill="currentColor" />
              </div>

              <div className="relative z-10">
                <div className="flex items-start gap-3 mb-4">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{testimonial.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < testimonial.rating
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-muted-foreground/30'
                        }`}
                    />
                  ))}
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  &quot;{testimonial.text}&quot;
                </p>

                {testimonial.courseOrPath && (
                  <Badge variant="secondary" className="text-xs">
                    {testimonial.courseOrPath}
                  </Badge>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center py-12 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border px-6"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Write Your Success Story?
        </h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
          Join our community and start your AI learning journey today
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/courses">
            <Button size="lg" className="gap-2">
              <GraduationCap className="h-5 w-5" />
              Explore Courses
            </Button>
          </Link>
          <Link href="/learning-paths">
            <Button size="lg" variant="outline" className="gap-2">
              <Route className="h-5 w-5" />
              View Learning Paths
            </Button>
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
