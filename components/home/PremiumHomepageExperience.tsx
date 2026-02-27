"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  ChartNoAxesCombined,
  Clock3,
  GraduationCap,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";

import { CourseProductCard } from "@/components/courses/CourseProductCard";
import HeroLogosCarousel from "@/components/home/HeroLogosCarousel";
import { ContentRegion, StatusRegion, Toolbar } from "@/components/layout/shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { HeroLogo } from "@/lib/settings";

const HERO_TYPED_PHRASES = [
  "Hands-on AI skills",
  "Real AI execution",
  "Empowering your future with AI",
];

type FeaturedCourse = {
  id: string;
  title: string;
  slug: string;
  priceCents: number;
  categoryName: string;
  imageUrl?: string | null;
  tier?: "STARTER" | "PROFESSIONAL" | "FOUNDER";
  hasAccess?: boolean;
};

type Testimonial = {
  id: string;
  name: string;
  role: string;
  avatar?: string | null;
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
  heroLogos: HeroLogo[];
}

function formatMetricValue(value: number, fallback: string) {
  return value > 0 ? value.toLocaleString() : fallback;
}

function formatRating(averageRating: number, reviewCount: number) {
  if (!reviewCount || averageRating <= 0) {
    return "\u2014";
  }

  return averageRating.toFixed(1);
}

function formatPrice(priceCents: number) {
  return priceCents === 0 ? "Free" : `$${(priceCents / 100).toFixed(2)}`;
}

function getTierPresentation(tier?: "STARTER" | "PROFESSIONAL" | "FOUNDER") {
  switch (tier) {
    case "PROFESSIONAL":
      return { label: "Professional", difficulty: "Applied" };
    case "FOUNDER":
      return { label: "Founder", difficulty: "Expert" };
    case "STARTER":
    default:
      return { label: "Starter", difficulty: "Foundational" };
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getSectionMotion(reduceMotion: boolean) {
  if (reduceMotion) {
    return {};
  }

  return {
    initial: { opacity: 0, y: 14 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.24, ease: "easeOut" as const },
    viewport: { once: true, amount: 0.2 },
  };
}

function HeroTypedPhrase({
  phrases,
  reduceMotion,
}: { phrases: string[]; reduceMotion: boolean }) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const phrase = phrases[phraseIndex] ?? "";
  const [typedValue, setTypedValue] = useState("");
  const maxPhrase = useMemo(() => {
    return phrases.reduce(
      (longest, current) => (current.length > longest.length ? current : longest),
      phrases[0] ?? ""
    );
  }, [phrases]);

  useEffect(() => {
    if (!phrases.length || reduceMotion) {
      return;
    }

    let frame = 0;
    let direction = 1;
    let holdTicks = 0;
    const holdTickCount = Math.ceil(800 / 90);

    const timer = window.setInterval(() => {
      if (holdTicks > 0) {
        holdTicks -= 1;
        return;
      }

      frame += direction;

      if (frame > phrase.length) {
        frame = phrase.length;
        direction = -1;
        holdTicks = holdTickCount;
      } else if (frame <= 0) {
        frame = 0;
        setTypedValue("");
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
        return;
      }

      setTypedValue(phrase.slice(0, Math.max(0, frame)));
    }, 90);

    return () => window.clearInterval(timer);
  }, [phraseIndex, phrase, phrases, reduceMotion]);

  const visiblePhrase = maxPhrase;
  const visibleValue = !phrases.length ? "" : reduceMotion ? visiblePhrase : typedValue;

  return (
    <span className="relative inline-block max-w-full align-baseline text-primary" aria-hidden="true">
      <span className="hidden invisible sm:inline-block">{visiblePhrase}</span>
      <span className="sm:hidden">{visiblePhrase}</span>
      <span className="absolute inset-0 hidden sm:block">
        <span className="whitespace-normal break-words sm:whitespace-nowrap">{visibleValue}</span>
        {!reduceMotion && typedValue.length < phrase.length ? (
          <span className="ml-0.5 inline-block h-[1.05em] w-[1px] bg-primary align-middle" />
        ) : null}
      </span>
    </span>
  );
}

function HeroShowcaseImage() {
  return (
    <div className="ui-surface supports-hover-card relative overflow-hidden rounded-[var(--radius-xl)] border">
      <div className="relative aspect-[16/10] min-h-[320px] w-full">
        <Image
          src="/hero/platform-preview.jpg"
          alt="Platform workspace preview"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/35 via-black/10 to-transparent" />
        <div className="absolute inset-x-4 bottom-4 rounded-[var(--radius-md)] border border-white/25 bg-black/35 px-4 py-3 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/80">Product experience</p>
          <p className="mt-1 text-sm font-medium text-white">Unified learner, checkout, and certificate flow</p>
        </div>
      </div>
    </div>
  );
}

export function PremiumHomepageExperience({
  metrics,
  featuredCourses,
  testimonials,
  heroLogos,
}: PremiumHomepageExperienceProps) {
  const reduceMotion = Boolean(useReducedMotion());
  const sectionMotion = getSectionMotion(reduceMotion);
  const visibleHeroLogos = useMemo(() => heroLogos.filter((logo) => logo.visible), [heroLogos]);

  const heroMotion = reduceMotion
    ? {}
    : {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.26, ease: "easeOut" as const },
    };

  const metricItems = useMemo(
    () => [
      {
        label: "Courses",
        value: formatMetricValue(metrics.totalCourses, "New"),
        detail: metrics.totalCourses > 0 ? "Published and purchase-ready" : "Catalog expanding",
      },
      {
        label: "Learners",
        value: formatMetricValue(metrics.totalStudents, "New"),
        detail: metrics.totalStudents > 0 ? "Individuals and teams" : "First cohorts onboarding",
      },
      {
        label: "Lessons",
        value: formatMetricValue(metrics.totalLessons, "\u2014"),
        detail: metrics.totalLessons > 0 ? "Outcome-focused modules" : "Structured paths in progress",
      },
      {
        label: "Rating",
        value: formatRating(metrics.averageRating, metrics.totalReviews),
        detail: metrics.totalReviews > 0 ? `${metrics.totalReviews} verified reviews` : "Review baseline forming",
      },
    ],
    [metrics.averageRating, metrics.totalCourses, metrics.totalLessons, metrics.totalReviews, metrics.totalStudents]
  );

  return (
    <LazyMotion features={domAnimation}>
      <ContentRegion className="gap-8 lg:gap-10">
        <m.section
          className="ui-surface relative overflow-hidden rounded-[var(--radius-xl)] border p-5 sm:p-8"
          {...heroMotion}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 16% 14%, hsl(var(--primary) / 0.18), transparent 40%), radial-gradient(circle at 84% 10%, hsl(var(--primary) / 0.1), transparent 30%), linear-gradient(to right, hsl(var(--foreground) / 0.04) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground) / 0.03) 1px, transparent 1px)",
              backgroundSize: "auto, auto, 24px 24px, 24px 24px",
            }}
          />

          <div className="relative z-[1] grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] lg:items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="w-fit gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Premium learning workflow
              </Badge>

              <div className="space-y-3">
                <h1
                  className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl"
                  aria-label={`Enterprise AI learning for ${HERO_TYPED_PHRASES[0]}`}
                >
                  Enterprise AI learning for{" "}
                  <HeroTypedPhrase phrases={HERO_TYPED_PHRASES} reduceMotion={reduceMotion} />
                </h1>
                <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                  Unified discovery, checkout, and structured completion paths for operators, teams, and founders who ship outcomes.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link href="/courses">
                  <Button variant="premium" size="lg" className="h-11">
                    Explore courses
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" size="lg" className="h-11">
                    Compare plans
                  </Button>
                </Link>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {metricItems.map((metric) => (
                  <div key={metric.label} className="min-w-0 rounded-[var(--radius-md)] border bg-background/90 px-4 py-3">
                    <p className="break-words text-xs font-semibold uppercase tracking-wide text-muted-foreground">{metric.label}</p>
                    <p className="mt-1 break-words text-[clamp(1.5rem,5vw,2rem)] font-semibold leading-tight">{metric.value}</p>
                    <p className="break-words text-xs text-muted-foreground">{metric.detail}</p>
                  </div>
                ))}
              </div>

            </div>

            <HeroShowcaseImage />
          </div>

          {visibleHeroLogos.length > 0 && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="-mx-5 pt-8 sm:-mx-6 sm:pt-10 lg:-mx-8"
            >
              <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                Trusted by professionals at
              </p>
              <HeroLogosCarousel
                logos={visibleHeroLogos}
                direction="right"
                speed={25}
                minIcons={8}
              />
            </m.div>
          )}
        </m.section>

        <m.section {...sectionMotion}>
          <Toolbar className="justify-between gap-3">
            <p className="text-sm font-medium text-foreground">Trusted by teams building practical AI systems</p>
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
                <Trophy className="h-3.5 w-3.5 text-primary" />
                Verified certificates
              </span>
            </div>
          </Toolbar>
        </m.section>

        <m.section className="grid grid-cols-1 gap-4 lg:grid-cols-4" {...sectionMotion}>
          {[
            {
              title: "Discover",
              detail: "Search by role, compare outcomes, and choose fast.",
              icon: Sparkles,
              image:
                "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
            },
            {
              title: "Purchase",
              detail: "Transparent billing cadence and secure checkout.",
              icon: ReceiptText,
              image:
                "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80",
            },
            {
              title: "Learn",
              detail: "Structured lessons with progress visibility.",
              icon: BookOpen,
              image:
                "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80",
            },
            {
              title: "Certify",
              detail: "Issue and verify completion credentials.",
              icon: BadgeCheck,
              image:
                "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
            },
          ].map((step, index) => (
            <Card key={step.title} className="group ui-surface supports-hover-card relative min-h-72 overflow-hidden border">
              <Image
                src={step.image}
                alt={step.title}
                fill
                sizes="(max-width: 1024px) 100vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
              <CardContent className="relative z-[1] flex h-full flex-col justify-between p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/50 bg-black/40 text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <step.icon className="h-5 w-5 text-white/95" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-xl text-white">{step.title}</CardTitle>
                  <p className="text-sm text-white/85">{step.detail}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </m.section>

        <m.section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]" {...sectionMotion}>
          <Card className="ui-surface supports-hover-card border">
            <CardHeader>
              <Badge variant="secondary" className="w-fit">
                Spotlight
              </Badge>
              <CardTitle className="text-2xl">Revenue-ready learning UX, not generic content pages</CardTitle>
              <CardDescription>
                Purpose-built sections with conversion hierarchy, trust signals, and structured follow-through from discovery to certification.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="rounded-[var(--radius-sm)] border bg-background px-3 py-2">
                <p className="font-semibold text-foreground">Catalog intent matching</p>
                <p>Find the right path quickly with clear metadata and outcome framing.</p>
              </div>
              <div className="rounded-[var(--radius-sm)] border bg-background px-3 py-2">
                <p className="font-semibold text-foreground">Checkout confidence</p>
                <p>Billing cadence, plan tradeoffs, and trust cues are explicit.</p>
              </div>
              <div className="rounded-[var(--radius-sm)] border bg-background px-3 py-2">
                <p className="font-semibold text-foreground">Progress accountability</p>
                <p>Learners see completion state and next actions at every step.</p>
              </div>
              <div className="rounded-[var(--radius-sm)] border bg-background px-3 py-2">
                <p className="font-semibold text-foreground">Credential readiness</p>
                <p>Certificate validation stays tied to tracked outcomes.</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <Card className="ui-surface supports-hover-card border">
              <CardHeader>
                <CardTitle className="text-xl">Bento proof points</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm">
                <div className="rounded-[var(--radius-sm)] border bg-background px-3 py-2">
                  <p className="font-semibold">Fast onboarding</p>
                  <p className="text-muted-foreground">Auth and plan entry paths are streamlined and responsive.</p>
                </div>
                <div className="rounded-[var(--radius-sm)] border bg-background px-3 py-2">
                  <p className="font-semibold">Operational transparency</p>
                  <p className="text-muted-foreground">Learners always see what unlocks next and why.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="ui-surface supports-hover-card border">
              <CardHeader>
                <CardTitle className="text-xl">Time to complete</CardTitle>
                <CardDescription>Designed for consistent momentum.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between rounded-[var(--radius-sm)] border bg-background px-3 py-2">
                  <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-primary" /> Weekly study target</span>
                  <span className="font-semibold text-foreground">3-5h</span>
                </div>
                <div className="flex items-center justify-between rounded-[var(--radius-sm)] border bg-background px-3 py-2">
                  <span className="inline-flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary" /> Guided tracks</span>
                  <span className="font-semibold text-foreground">Multi-course</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </m.section>

        <m.section className="space-y-4" {...sectionMotion}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Featured courses</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Course cards built for conversion</h2>
            </div>
            <Link href="/courses">
              <Button variant="ghost" className="h-11">
                View full catalog
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredCourses.map((course) => {
              const tierPresentation = getTierPresentation(course.tier);

              return (
                <CourseProductCard
                  key={course.id}
                  title={course.title}
                  description="Structured, project-ready lessons with measurable outcomes and practical deliverables."
                  slug={course.slug}
                  categoryLabel={course.categoryName}
                  priceLabel={formatPrice(course.priceCents)}
                  imageUrl={course.imageUrl}
                  tierLabel={tierPresentation.label}
                  metaItems={[
                    { label: "Difficulty", value: tierPresentation.difficulty },
                    { label: "Duration", value: "Self-paced" },
                    { label: "Outcome", value: "Certificate" },
                  ]}
                  primaryAction={{
                    href: course.hasAccess ? `/library/${course.slug}` : `/checkout?course=${course.slug}`,
                    label: course.hasAccess ? "Open course" : "Buy course once",
                  }}
                  secondaryActions={
                    course.hasAccess
                      ? [{ href: `/courses/${course.slug}`, label: "Course detail" }]
                      : [{ href: "/pricing", label: "Buy subscription" }]
                  }
                />
              );
            })}
          </div>
        </m.section>
      </ContentRegion>

      <StatusRegion className="gap-6">
        {testimonials.length ? (
          <m.section className="grid gap-4 lg:grid-cols-3" {...sectionMotion}>
            {testimonials.slice(0, 3).map((testimonial) => (
              <Card key={testimonial.id} className="ui-surface supports-hover-card border">
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage src={testimonial.avatar || undefined} alt={testimonial.name} />
                        <AvatarFallback className="text-xs font-semibold">{getInitials(testimonial.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-warning">
                      {Array.from({ length: Math.max(1, Math.min(5, testimonial.rating || 5)) }).map((_, index) => (
                        <Star key={`${testimonial.id}-star-${index}`} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <CardDescription className="text-sm text-foreground">
                    “{testimonial.text}”
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </m.section>
        ) : null}

        <m.section
          className="ui-surface grid gap-5 rounded-[var(--radius-xl)] border p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto]"
          {...sectionMotion}
        >
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ready to launch?</p>
            <h3 className="text-2xl font-semibold tracking-tight">Move from AI curiosity to shipped business outcomes</h3>
            <p className="text-sm text-muted-foreground">
              Pick the right path, activate checkout, and keep progress visible from first lesson to verified completion.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Link href="/courses">
              <Button variant="premium" size="lg" className="h-11">
                Browse courses
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="h-11">
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
