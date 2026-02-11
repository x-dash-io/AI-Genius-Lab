import Link from "next/link";
import { Suspense } from "react";
import { Metadata } from "next";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { getPublishedCourses } from "@/lib/courses";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
        <form action="/courses" method="get" className="flex w-full flex-wrap items-center gap-2 lg:w-auto">
          <div className="relative min-w-72 flex-1 lg:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input name="search" defaultValue={params.search} placeholder="Search courses" className="pl-9" />
          </div>
          {params.category ? <input type="hidden" name="category" value={params.category} /> : null}
          {params.price ? <input type="hidden" name="price" value={params.price} /> : null}
          {params.sort ? <input type="hidden" name="sort" value={params.sort} /> : null}
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
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
        <div className="ml-auto flex items-center gap-2">
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
            {courses.map((course) => (
              <Card key={course.id} className="ui-surface flex h-full flex-col">
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={course.tier === "PREMIUM" ? "default" : "secondary"}>{course.tier}</Badge>
                    <span className="text-sm font-semibold">{formatPrice(course.priceCents)}</span>
                  </div>
                  <CardTitle className="text-xl">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {course.description || "Structured AI training with practical outcomes and guided progression."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto flex items-center justify-between gap-2">
                  <div className="text-xs text-muted-foreground">
                    {course.Category?.name || "General"}
                  </div>
                  <Link href={`/courses/${course.slug}`}>
                    <Button variant="outline" size="sm">
                      View Course
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
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

