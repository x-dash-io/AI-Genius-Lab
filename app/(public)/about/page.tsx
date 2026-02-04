"use client";

import { motion } from "framer-motion";
import { GraduationCap, Target, Eye, Heart, Users, Zap, Brain } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const values = [
  {
    icon: Brain,
    title: "Innovation",
    description: "We embrace cutting-edge AI technologies and teaching methods to deliver the best learning experience.",
  },
  {
    icon: Heart,
    title: "Accessibility",
    description: "AI education should be available to everyone, regardless of their background or experience level.",
  },
  {
    icon: Users,
    title: "Community",
    description: "We foster a supportive  community where learners can grow together and share knowledge.",
  },
  {
    icon: Zap,
    title: "Excellence",
    description: "We're committed to delivering high-quality content that drives real-world results.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 md:p-12 lg:p-16 mb-12"
      >
        <div className="relative z-10 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
          >
            <GraduationCap className="h-4 w-4" />
            About AI Genius Lab
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Empowering the Next Generation of AI Innovators
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            We're on a mission to make AI education accessible, practical, and transformative for everyone—from beginners to professionals looking to master the future of technology.
          </p>
        </div>
        
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </motion.section>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="group relative overflow-hidden rounded-2xl bg-card border p-8 hover:shadow-lg transition-all duration-300"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
              <Target className="h-6 w-6" />
            </div>
            
            <h2 className="text-2xl font-bold mb-3">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              To democratize AI education by providing structured, high-quality courses that transform complex AI concepts into practical skills anyone can master and apply in real-world scenarios.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="group relative overflow-hidden rounded-2xl bg-card border p-8 hover:shadow-lg transition-all duration-300"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
              <Eye className="h-6 w-6" />
            </div>
            
            <h2 className="text-2xl font-bold mb-3">Our Vision</h2>
            <p className="text-muted-foreground leading-relaxed">
              A world where AI literacy is universal, enabling individuals and organizations to harness artificial intelligence for innovation, productivity, and positive global impact.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Core Values */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-12"
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Core Values</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            These principles guide everything we do at AI Genius Lab
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="group relative overflow-hidden rounded-xl bg-card border p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all">
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Why Choose Us */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border p-8 md:p-12 mb-12"
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose AI Genius Lab?</h2>
          <div className="space-y-4 text-left">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                ✓
              </div>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Structured Learning Paths:</strong> Progress from fundamentals to advanced concepts with our carefully designed curriculum
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                ✓
              </div>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Practical Applications:</strong> Learn by doing with real-world projects and hands-on exercises
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                ✓
              </div>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Expert Instructors:</strong> Learn from industry professionals with years of AI experience
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                ✓
              </div>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Lifetime Access:</strong> Purchase once and access your courses forever, including all future updates
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="text-center py-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Start Your AI Journey?
        </h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
          Join thousands of learners who are already transforming their careers with AI
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/courses">
            <Button size="lg" className="gap-2">
              <GraduationCap className="h-5 w-5" />
              Browse Courses
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="outline">
              Contact Us
            </Button>
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
