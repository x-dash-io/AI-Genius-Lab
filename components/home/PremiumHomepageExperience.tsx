"use client";

import Link from "next/link";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  ChartNoAxesCombined,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ContentRegion,
  PageHeader,
  StatusRegion,
  Toolbar,
} from "@/components/layout/shell";

type FeaturedCourse = {
  id: string;
  title: string;
  slug: string;
  priceCents: number;
  categoryName: string;
  tier?: string;
};

type Testimonial = {
  id: string;
  name: string;
  role: string;
  rating: number;
  text: string;
};

type HomepageMetrics = {
  totalCourses: number;
  totalStudents: number;
  totalLessons: number;
  averageRating: number;
  totalReviews: number;
};

interface PremiumHomepageExperienceProps {
  metrics: HomepageMetrics;
  featuredCourses: FeaturedCourse[];
  testimonials: Testimonial[];
}

function formatMetric(value: number) {
  return value > 0 ? value.toLocaleString() : "New";
}

function formatRating(averageRating: number, reviewCount: number) {
  if (!reviewCount) {
    return "New";
  }

  return averageRating.toFixed(1);
}

function formatPrice(priceCents: number) {
  return priceCents === 0 ? "Free" : `$${(priceCents / 100).toFixed(2)}`;
}

function getMotionProps(reduceMotion: boolean) {
  if (reduceMotion) {
    return {};
  }

  return {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.28, ease: "easeOut" as const },
    viewport: { once: true, amount: 0.2 },
  };
}

function ProductPreviewCard() {
  return (
    <Card className="ui-surface relative overflow-hidden border">
      <CardHeader className="border-b bg-muted/30 pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
          </div>
          <Badge variant="secondary">Product Preview</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[var(--radius-sm)] border bg-background p-3">
            <p className="text-xs text-muted-foreground">Team progress</p>
            <p className="mt-1 text-lg font-semibold">78% completion</p>
            <Progress value={78} className="mt-3 h-2.5" />
          </div>
          <div className="rounded-[var(--radius-sm)] border bg-background p-3">
            <p className="text-xs text-muted-foreground">Active pathways</p>
            <p className="mt-1 text-lg font-semibold">12 in motion</p>
            <div className="mt-3 grid grid-cols-4 gap-1.5">
              <span className="h-2 rounded-full bg-primary/35" />
              <span className="h-2 rounded-full bg-primary/55" />
              <span className="h-2 rounded-full bg-primary/75" />
              <span className="h-2 rounded-full bg-primary" />
            </div>
          </div>
        </div>

        <div className="rounded-[var(--radius-sm)] border bg-background p-4">
          <p className="text-xs text-muted-foreground">Weekly activity</p>
          <div className="mt-3 grid grid-cols-7 items-end gap-1.5">
            {[44, 58, 37, 71, 63, 86, 75].map((value, index) => (
              <span
                key={`activity-${index}`}
                className="rounded-full bg-primary/60"
                style={{ height: `${value}%` }}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between rounded-[var(--radius-sm)] border bg-background px-3 py-2">
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-primary" />
              AI Operations Foundations
            </div>
            <Badge variant="outline">In progress</Badge>
          </div>
          <div className="flex items-center justify-between rounded-[var(--radius-sm)] border bg-background px-3 py-2">
            <div className="flex items-center gap-2 text-sm">
              <BadgeCheck className="h-4 w-4 text-primary" />
              Completion certificates
            </div>
            <span className="text-xs text-muted-foreground">Live sync</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PremiumHomepageExperience({
  metrics,
  featuredCourses,
  testimonials,
}: PremiumHomepageExperienceProps) {
  const reduceMotion = Boolean(useReducedMotion());
  const sectionMotion = getMotionProps(reduceMotion);

  const heroMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.32, ease: "easeOut" as const },
      };

  const metricItems = [
    {
      label: "Courses",
      value: formatMetric(metrics.totalCourses),
      detail: "Structured and production-focused",
    },
    {
      label: "Learners",
      value: formatMetric(metrics.totalStudents),
      detail: "Individuals and teams",
    },
    {
      label: "Lessons",
      value: formatMetric(metrics.totalLessons),
      detail: "Practical implementation paths",
    },
    {
      label: "Rating",
      value: formatRating(metrics.averageRating, metrics.totalReviews),
      detail: metrics.totalReviews ? `${metrics.totalReviews} reviews` : "Fresh and expanding",
    },
  ];

  return (
    <LazyMotion features={domAnimation}>
      <ContentRegion className="gap-8 lg:gap-10">
        <m.section
          className="ui-surface relative overflow-hidden rounded-[var(--radius-xl)] border p-5 sm:p-8"
          {...heroMotion}
        >
          <m.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 18% 20%, hsl(var(--primary) / 0.16), transparent 46%), radial-gradient(circle at 88% 8%, hsl(var(--primary) / 0.1), transparent 34%), linear-gradient(to right, hsl(var(--foreground) / 0.05) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground) / 0.04) 1px, transparent 1px)",
              backgroundSize: "auto, auto, 22px 22px, 22px 22px",
            }}
            {...heroMotion}
          />

          <div className="relative z-[1] grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] lg:items-center">
            <div className="space-y-6">
              <PageHeader
                title="Enterprise AI Learning That Converts Into Real Execution"
                description="Unify discovery, checkout, and learning in one premium workflow. Built for serious operators, founders, and high-performance teams."
                actions={
                  <>
                    <Link href="/courses">
                      <Button
                        variant="premium"
                        size="lg"
                        className="motion-safe:hover:-translate-y-0.5"
                      >
                        Explore Courses
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/pricing">
                      <Button
                        variant="outline"
                        size="lg"
                        className="motion-safe:hover:-translate-y-0.5"
                      >
                        View Pricing
                      </Button>
                    </Link>
                  </>
                }
              />

              <div className="grid gap-3 sm:grid-cols-2">
                {metricItems.map((item) => (
                  <div key={item.label} className="rounded-[var(--radius-md)] border bg-background/90 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</p>
                    <p className="mt-1 text-2xl font-semibold">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <ProductPreviewCard />
          </div>
        </m.section>

        <Toolbar className="justify-between gap-3">
          <p className="text-sm font-medium text-foreground">Trusted by teams building practical AI workflows</p>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full border bg-background px-2.5 py-1 text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Secure payments
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border bg-background px-2.5 py-1 text-muted-foreground">
              <ChartNoAxesCombined className="h-3.5 w-3.5 text-primary" />
              Progress tracking
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border bg-background px-2.5 py-1 text-muted-foreground">
              <GraduationCap className="h-3.5 w-3.5 text-primary" />
              Completion certificates
            </span>
          </div>
        </Toolbar>

        <m.section className="grid gap-4 lg:grid-cols-4" {...sectionMotion}>
          {[
            {
              title: "Discover",
              detail: "Filter by goals, compare outcomes, and choose the right path quickly.",
              icon: Sparkles,
            },
            {
              title: "Purchase",
              detail: "Checkout with reliable billing flow and transparent pricing cadence.",
              icon: ShieldCheck,
            },
            {
              title: "Learn",
              detail: "Follow structured lessons with momentum-focused progress visibility.",
              icon: BookOpen,
            },
            {
              title: "Certify",
              detail: "Generate completion proof and verify achievements publicly.",
              icon: BadgeCheck,
            },
          ].map((step, index) => (
            <Card key={step.title} className="ui-surface border">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border bg-background text-xs font-semibold">
                    {index + 1}
                  </span>
                  <step.icon className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{step.detail}</CardContent>
            </Card>
          ))}
        </m.section>

        <m.section
          className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]"
          {...sectionMotion}
        >
          <Card className="ui-surface border">
            <CardHeader>
              <Badge variant="secondary" className="w-fit">
                Spotlight
              </Badge>
              <CardTitle className="text-2xl">Built for conversion and completion, not vanity UX</CardTitle>
              <CardDescription>
                Learners move from discovery to paid enrollment with clear hierarchy, predictable forms, and low-friction actions.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="rounded-[var(--radius-sm)] border bg-background px-3 py-2">
                <p className="font-semibold text-foreground">Catalog clarity</p>
                <p>Filter, compare, and act without visual clutter.</p>
              </div>
              <div className="rounded-[var(--radius-sm)] border bg-background px-3 py-2">
                <p className="font-semibold text-foreground">Checkout confidence</p>
                <p>Explicit pricing and trust cues on every conversion step.</p>
              </div>
              <div className="rounded-[var(--radius-sm)] border bg-background px-3 py-2">
                <p className="font-semibold text-foreground">Learning momentum</p>
                <p>Progress views keep learners oriented and accountable.</p>
              </div>
              <div className="rounded-[var(--radius-sm)] border bg-background px-3 py-2">
                <p className="font-semibold text-foreground">Proof of completion</p>
                <p>Certificate-ready pipeline tied to real progress data.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="ui-surface border">
            <CardHeader>
              <CardTitle className="text-xl">What teams value most</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {[
                "Consistent page structure across public, learner, and admin surfaces",
                "Predictable focus states and keyboard-first controls",
                "Token-driven spacing and visual hierarchy",
                "Optional glass surfaces without compromising contrast",
              ].map((item) => (
                <p key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{item}</span>
                </p>
              ))}
            </CardContent>
          </Card>
        </m.section>

        <m.section className="space-y-4" {...sectionMotion}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Featured courses</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Launch your next capability fast</h2>
            </div>
            <Link href="/courses">
              <Button variant="ghost">
                View full catalog
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredCourses.map((course) => {
              const level = course.tier === "PREMIUM" ? "Advanced" : "Core";
              return (
                <Card key={course.id} className="ui-surface group relative overflow-hidden border">
                  <CardHeader className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline">{course.categoryName}</Badge>
                      <span className="text-sm font-semibold">{formatPrice(course.priceCents)}</span>
                    </div>
                    <CardTitle className="text-xl">{course.title}</CardTitle>
                    <CardDescription>
                      Focused, project-ready lessons with guided momentum and clear completion outcomes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                      <span className="rounded-[var(--radius-sm)] border bg-background px-2 py-1">
                        <span className="font-semibold text-foreground">Level:</span> {level}
                      </span>
                      <span className="rounded-[var(--radius-sm)] border bg-background px-2 py-1">
                        <span className="font-semibold text-foreground">Duration:</span> Self-paced
                      </span>
                      <span className="rounded-[var(--radius-sm)] border bg-background px-2 py-1">
                        <span className="font-semibold text-foreground">Outcome:</span> Certificate
                      </span>
                    </div>
                    <div className="pointer-events-none absolute inset-x-4 bottom-4 translate-y-2 opacity-0 transition duration-[var(--duration-slow)] ease-[var(--ease-standard)] group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <Link href={`/courses/${course.slug}`} className="pointer-events-auto flex-1">
                          <Button className="w-full" size="sm" variant="premium">
                            View course
                          </Button>
                        </Link>
                        <Link href={`/checkout?course=${course.slug}`} className="pointer-events-auto">
                          <Button size="sm" variant="outline">
                            Checkout
                          </Button>
                        </Link>
                      </div>
                    </div>
                    <div className="h-8" aria-hidden="true" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </m.section>
      </ContentRegion>

      <StatusRegion className="gap-6">
        {testimonials.length ? (
          <m.section className="grid gap-4 lg:grid-cols-3" {...sectionMotion}>
            {testimonials.slice(0, 3).map((testimonial) => (
              <Card key={testimonial.id} className="ui-surface border">
                <CardHeader className="space-y-2">
                  <div className="flex items-center gap-1 text-warning">
                    {Array.from({ length: Math.max(1, Math.min(5, testimonial.rating)) }).map((_, index) => (
                      <Star key={`${testimonial.id}-${index}`} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <CardDescription className="text-sm text-foreground">“{testimonial.text}”</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </CardContent>
              </Card>
            ))}
          </m.section>
        ) : null}

        <m.section
          className="ui-surface grid gap-5 rounded-[var(--radius-xl)] border p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto]"
          {...sectionMotion}
        >
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ready to start?</p>
            <h3 className="text-2xl font-semibold tracking-tight">Turn your next AI initiative into shipped outcomes</h3>
            <p className="text-sm text-muted-foreground">
              Browse catalog, choose a plan, and keep progress measurable from first lesson to certification.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Link href="/courses">
              <Button variant="premium" size="lg" className="motion-safe:hover:-translate-y-0.5">
                Browse courses
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="motion-safe:hover:-translate-y-0.5">
                Compare plans
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </m.section>
      </StatusRegion>
    </LazyMotion>
  );
}
