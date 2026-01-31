import { Suspense } from "react";
import { Metadata } from "next";
import { getPublishedCourses } from "@/lib/courses";
import { CourseList } from "@/components/courses/CourseList";
import { CourseFilters } from "@/components/courses/CourseFilters";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

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

async function CourseCatalogContent({ searchParams }: CoursesPageProps) {
  const params = await searchParams;
  const allCourses = await getPublishedCourses();
  
  let courses = [...allCourses];

  // Apply search filter
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    courses = courses.filter(
      (course) =>
        course.title.toLowerCase().includes(searchLower) ||
        course.description?.toLowerCase().includes(searchLower)
    );
  }

  // Apply category filter
  if (params.category) {
    courses = courses.filter((course) => course.category === params.category);
  }

  // Apply price filter
  if (params.price) {
    switch (params.price) {
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

  // Apply sorting
  if (params.sort) {
    switch (params.sort) {
      case "oldest":
        // Already sorted by createdAt desc from the query, reverse it
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
      // "newest" is the default from the query
    }
  }

  const totalCourses = allCourses.length;
  const filteredCount = courses.length;
  const hasFilters = params.search || params.category || params.price || params.sort;

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-muted-foreground">
            {hasFilters
              ? `Showing ${filteredCount} of ${totalCourses} courses`
              : `Browse ${totalCourses} curated AI courses`}
          </p>
        </div>
      </div>
      
      {/* Filters */}
      <Suspense fallback={<div className="h-12 animate-pulse bg-muted rounded" />}>
        <CourseFilters />
      </Suspense>

      {/* Course List */}
      {courses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <BookOpen className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium mb-2">No courses found</p>
            <p className="text-muted-foreground">
              {hasFilters
                ? "Try adjusting your filters to find what you're looking for."
                : "Check back soon for new courses!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <CourseList courses={courses} />
      )}
    </>
  );
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <section className="container mx-auto py-12 px-4 grid gap-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { name: "Home", url: "/" },
            { name: "Courses" },
          ]}
        />
        
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary gap-2">
            <BookOpen className="h-4 w-4" />
            Course Library
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
            Discover AI Courses
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Learn from our curated collection of AI courses. Filter by category, price, and more to find the perfect course for you.
          </p>
        </div>

        <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded" />}>
          <CourseCatalogContent searchParams={searchParams} />
        </Suspense>
      </section>
    </div>
  );
}
