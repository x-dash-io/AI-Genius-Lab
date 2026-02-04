"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, GraduationCap, Route, BookOpen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type TestimonialCategory = "all" | "courses" | "learning-paths" | "platform";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  rating: number;
  text: string;
  category: TestimonialCategory;
  courseOrPath?: string;
  date: string;
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    role: "Marketing Manager",
    rating: 5,
    text: "AI Genius Lab transformed how I approach content creation. The courses are practical, well-structured, and immediately applicable. I've automated 60% of my content workflow!",
    category: "courses",
    courseOrPath: "AI for Content Creation",
    date: "2024-01-15",
  },
  {
    id: "2",
    name: "Michael Chen",
    role: "Software Developer",
    rating: 5,
    text: "The learning paths are incredible! Going from beginner to building production AI apps in just 3 months. The structured approach made all the difference.",
    category: "learning-paths",
    courseOrPath: "Full-Stack AI Developer Path",
    date: "2024-01-10",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    role: "Business Analyst",
    rating: 5,
    text: "I had zero AI experience before this. Now I'm implementing AI solutions at my company and getting recognized for it. The courses break down complex concepts beautifully.",
    category: "courses",
    courseOrPath: "AI for Business Professionals",
    date: "2024-01-08",
  },
  {
    id: "4",
    name: "David Thompson",
    role: "Entrepreneur",
    rating: 5,
    text: "The platform is intuitive and the progress tracking keeps me motivated. Lifetime access means I can learn at my own pace without pressure. Best investment I've made!",
    category: "platform",
    date: "2024-01-05",
  },
  {
    id: "5",
    name: "Lisa Park",
    role: "Data Scientist",
    rating: 5,
    text: "Even as someone with a technical background, I learned so much. The advanced courses go deep into real-world applications. Highly recommend for all skill levels.",
    category: "courses",
    courseOrPath: "Advanced Machine Learning",
    date: "2023-12-28",
  },
  {
    id: "6",
    name: "James Wilson",
    role: "Product Manager",
    rating: 5,
    text: "The AI Product Management path gave me the confidence to lead AI initiatives at my company. Practical case studies and hands-on projects were game-changers.",
    category: "learning-paths",
    courseOrPath: "AI Product Management Path",
    date: "2023-12-20",
  },
  {
    id: "7",
    name: "Anna Kowalski",
    role: "Freelance Writer",
    rating: 5,
    text: "I was skeptical about AI replacing writers, but this course showed me how to use AI as a powerful assistant. My productivity tripled and quality improved!",
    category: "courses",
    courseOrPath: "AI-Powered Writing",
    date: "2023-12-15",
  },
  {
    id: "8",
    name: "Robert Martinez",
    role: "Startup Founder",
    rating: 5,
    text: "Building an AI startup without understanding AI would've been impossible. This platform gave me the knowledge I needed to make informed decisions and lead my team.",
    category: "platform",
    date: "2023-12-10",
  },
  {
    id: "9",
    name: "Jessica Lee",
    role: "UX Designer",
    rating: 5,
    text: "The AI for Design course opened my eyes to new possibilities. I'm now creating personalized user experiences with AI that our users love. Absolutely transformative!",
    category: "courses",
    courseOrPath: "AI for UX Design",
    date: "2023-12-05",
  },
];

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
                      className={`h-4 w-4 ${
                        i < testimonial.rating 
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
