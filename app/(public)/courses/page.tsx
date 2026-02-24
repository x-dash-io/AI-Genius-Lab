import Link from "next/link";
import { Suspense } from "react";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { Search, SlidersHorizontal } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { subscriptionTierHasCourseAccess } from "@/lib/access";
import { getPublishedCourses } from "@/lib/courses";
import { prisma } from "@/lib/prisma";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { getUserSubscription, isSubscriptionActiveNow } from "@/lib/subscriptions";
import { CourseProductCard } from "@/components/courses/CourseProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  ContentRegion,
  PageContainer,
  PageHeader,
  StatusRegion,
  Toolbar,
} from "@/components/layout/shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = generateSEOMetadata({
  title: "Course Catalog",
  description:
    "Browse curated AI courses with previews and structured learning paths. Learn AI for business, content, apps, and productivity.",
  keywords: ["AI courses", "course catalog", "online courses", "AI training"],
});

interface CoursesPageProps {
  searchParams: Promise<{ search?: string; category?: string; price?: string; sort?: string }>;
}

function formatPrice(priceCents: number) {
  return priceCents === 0 ? "Free" : `$${(priceCents / 100).toFixed(2)}`;
}

function applyFilters(
  allCourses: Awaited<ReturnType<typeof getPublishedCourses>>,
  search: string | undefined,
  category: string | undefined,
  price: string | undefined,
  sort: string | undefined
) {
  let courses = [...allCourses];

  if (search) {
    const term = search.toLowerCase();
    courses = courses.filter(
      (course) =>
        course.title.toLowerCase().includes(term) ||
        course.description?.toLowerCase().includes(term)
    );
  }

  if (category) {
    courses = courses.filter(
      (course) =>
        course.Category?.slug === category ||
        course.categoryId === category ||
        course.category === category
    );
  }

  if (price) {
    switch (price) {
      case "free":
        courses = courses.filter((course) => course.priceCents === 0);
        break;
      case "paid":
        courses = courses.filter((course) => course.priceCents > 0);
        break;
      case "under-50":
        courses = courses.filter((course) => course.priceCents < 5000);
        break;
      case "over-50":
        courses = courses.filter((course) => course.priceCents >= 5000);
        break;
    }
  }

  switch (sort) {
    case "oldest":
      courses = courses.reverse();
      break;
    case "price-low":
      courses = courses.sort((a, b) => a.priceCents - b.priceCents);
      break;
    case "price-high":
      courses = courses.sort((a, b) => b.priceCents - a.priceCents);
      break;
    case "title":
      courses = courses.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      break;
  }

  return courses;
}

async function CoursesContent({ searchParams }: CoursesPageProps) {
  const params = await searchParams;
  const allCourses = await getPublishedCourses();
  const courses = applyFilters(allCourses, params.search, params.category, params.price, params.sort);
  const session = await getServerSession(authOptions);

  let purchasedCourseIds = new Set<string>();
  let activeSubscriptionTier: "starter" | "professional" | "founder" | null = null;

  if (session?.user && session.user.role !== "admin") {
    const [purchases, subscription] = await Promise.all([
      prisma.purchase.findMany({
        where: {
          userId: session.user.id,
          status: "paid",
          courseId: { in: allCourses.map((course) => course.id) },
        },
        select: { courseId: true },
      }),
      getUserSubscription(session.user.id),
    ]);

    purchasedCourseIds = new Set(purchases.map((purchase) => purchase.courseId));
    if (subscription && isSubscriptionActiveNow(subscription)) {
      activeSubscriptionTier = subscription.plan.tier;
    }
  }

  const totalCourses = allCourses.length;
  const hasFilters = Boolean(params.search || params.category || params.price || params.sort);

  const categories = Array.from(
    new Map(
      allCourses
        .filter((course) => course.Category?.slug)
        .map((course) => [
          course.Category?.slug as string,
          {
            slug: course.Category?.slug as string,
            name: course.Category?.name || "Category",
          },
        ] as const)
    ).values()
  );

  const buildHref = (overrides: Partial<{ search: string; category: string; price: string; sort: string }>) => {
    const next = {
      search: params.search || "",
      category: params.category || "",
      price: params.price || "",
      sort: params.sort || "",
      ...overrides,
    };

    const query = new URLSearchParams();
    if (next.search) query.set("search", next.search);
    if (next.category) query.set("category", next.category);
    if (next.price) query.set("price", next.price);
    if (next.sort) query.set("sort", next.sort);

    const asText = query.toString();
    return asText ? `/courses?${asText}` : "/courses";
  };

  return (
    <>
      <Toolbar className="justify-between gap-3">
        <form action="/courses" method="get" className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
          <div className="relative w-full lg:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input name="search" defaultValue={params.search} placeholder="Search courses" className="pl-9" />
          </div>
          {params.category ? <input type="hidden" name="category" value={params.category} /> : null}
          {params.price ? <input type="hidden" name="price" value={params.price} /> : null}
          {params.sort ? <input type="hidden" name="sort" value={params.sort} /> : null}
          <Button type="submit" variant="outline" className="h-11 sm:w-auto">
            Search
          </Button>
        </form>

        <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 lg:w-auto lg:overflow-visible lg:pb-0">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <Link href={buildHref({ sort: "newest" })}>
            <Button variant={params.sort === "newest" || !params.sort ? "secondary" : "ghost"} size="sm">
              Newest
            </Button>
          </Link>
          <Link href={buildHref({ sort: "price-low" })}>
            <Button variant={params.sort === "price-low" ? "secondary" : "ghost"} size="sm">
              Price Low
            </Button>
          </Link>
          <Link href={buildHref({ sort: "price-high" })}>
            <Button variant={params.sort === "price-high" ? "secondary" : "ghost"} size="sm">
              Price High
            </Button>
          </Link>
        </div>
      </Toolbar>

      <Toolbar className="gap-2">
        <Link href={buildHref({ category: "" })}>
          <Button variant={!params.category ? "secondary" : "ghost"} size="sm">
            All Categories
          </Button>
        </Link>
        {categories.map((category) => (
          <Link key={category.slug} href={buildHref({ category: category.slug })}>
            <Button variant={params.category === category.slug ? "secondary" : "ghost"} size="sm">
              {category.name}
            </Button>
          </Link>
        ))}
        <div className="flex items-center gap-2 sm:ml-auto">
          <Link href={buildHref({ price: "" })}>
            <Button variant={!params.price ? "secondary" : "ghost"} size="sm">
              All Prices
            </Button>
          </Link>
          <Link href={buildHref({ price: "free" })}>
            <Button variant={params.price === "free" ? "secondary" : "ghost"} size="sm">
              Free
            </Button>
          </Link>
          <Link href={buildHref({ price: "paid" })}>
            <Button variant={params.price === "paid" ? "secondary" : "ghost"} size="sm">
              Paid
            </Button>
          </Link>
        </div>
      </Toolbar>

      <ContentRegion>
        {courses.length ? (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => {
              const isFreeCourse = course.priceCents === 0;
              const hasSubscriptionAccess =
                !isFreeCourse &&
                activeSubscriptionTier !== null &&
                subscriptionTierHasCourseAccess(activeSubscriptionTier, course.tier);
              const hasCourseAccess =
                isFreeCourse ||
                session?.user?.role === "admin" ||
                purchasedCourseIds.has(course.id) ||
                hasSubscriptionAccess;

              return (
                <CourseProductCard
                  key={course.id}
                  title={course.title}
                  description={
                    course.description ||
                    "Structured AI training with practical outcomes and guided progression."
                  }
                  slug={course.slug}
                  categoryLabel={course.Category?.name || "General"}
                  priceLabel={formatPrice(course.priceCents)}
                  imageUrl={course.imageUrl}
                  tierLabel={course.tier === "PREMIUM" ? "Advanced" : "Core"}
                  metaItems={[
                    {
                      label: "Difficulty",
                      value: course.tier === "PREMIUM" ? "Advanced" : "Foundational",
                    },
                    {
                      label: "Duration",
                      value: "Self-paced",
                    },
                    {
                      label: "Outcome",
                      value: "Certificate",
                    },
                  ]}
                  planIncluded={!isFreeCourse && hasSubscriptionAccess}
                  primaryAction={{
                    href: hasCourseAccess ? `/library/${course.slug}` : `/checkout?course=${course.slug}`,
                    label: hasCourseAccess
                      ? isFreeCourse
                        ? "Open free course"
                        : "Open course"
                      : "Buy course once",
                  }}
                  secondaryActions={
                    hasCourseAccess
                      ? [{ href: `/courses/${course.slug}`, label: "Course detail" }]
                      : [{ href: "/pricing", label: "Buy subscription" }]
                  }
                />
              );
            })}
          </section>
        ) : null}
      </ContentRegion>

      <StatusRegion>
        {courses.length === 0 ? (
          <EmptyState
            icon={<Search className="h-6 w-6" />}
            title="No courses found"
            description={
              hasFilters
                ? "No courses match your current filters. Clear filters and try again."
                : "No published courses are available yet."
            }
            action={
              <Link href="/courses">
                <Button variant="outline">Clear Filters</Button>
              </Link>
            }
          />
        ) : (
          <Card className="ui-surface">
            <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
              <p className="text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{courses.length}</span> of{" "}
                <span className="font-semibold text-foreground">{totalCourses}</span> courses
              </p>
              <Link href="/learning-paths">
                <Button size="sm" variant="ghost">
                  Explore Learning Paths
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </StatusRegion>
    </>
  );
}

export default function CoursesPage({ searchParams }: CoursesPageProps) {
  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Course Catalog"
        description="Browse, filter, and compare available AI courses with a consistent enterprise layout."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Courses" },
        ]}
      />
      <Suspense fallback={<Card className="ui-surface h-24 animate-pulse" />}>
        <CoursesContent searchParams={searchParams} />
      </Suspense>
    </PageContainer>
  );
}
