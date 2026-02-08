import { Suspense } from "react";
import * as motion from "framer-motion/m";
import { GraduationCap, Route, Quote, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAllTestimonials } from "@/lib/testimonials";
import { TestimonialsClient } from "@/components/testimonials/TestimonialsClient";

export const dynamic = "force-dynamic";

export default async function TestimonialsPage() {
  const testimonials = await getAllTestimonials();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 md:p-12 mb-12">
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Quote className="h-4 w-4" />
            Student Success Stories
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Hear From Our Students
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Join thousands of learners who have transformed their careers with AI Genius Lab
          </p>
        </div>

        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </section>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 md:gap-6 mb-12 max-w-3xl mx-auto">
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
      </div>

      {/* Main Content with Suspense */}
      <Suspense fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }>
        <TestimonialsClient initialTestimonials={testimonials} />
      </Suspense>

      {/* CTA Section */}
      <section className="text-center py-12 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border px-6 mt-12">
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
      </section>
    </div>
  );
}
