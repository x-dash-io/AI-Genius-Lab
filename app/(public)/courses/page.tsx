import { Suspense } from "react";
import { Metadata } from "next";
import { getPublishedCourses } from "@/lib/courses";
import { CourseList } from "@/components/courses/CourseList";
import { CourseFilters } from "@/components/courses/CourseFilters";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = generateSEOMetadata({
  title: "Course Catalog",
  description:
    "Browse curated AI courses with previews and structured learning paths. Learn AI for business, content, apps, and productivity.",
  keywords: ["AI courses", "course catalog", "online courses", "AI training"],
});

interface CoursesPageProps {
  searchParams: Promise<{ search?: string; category?: string; price?: string; sort?: string }>;
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
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
    <section className="grid gap-6">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Course Catalog
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {hasFilters
            ? `Showing ${filteredCount} of ${totalCourses} courses`
            : `Browse ${totalCourses} curated AI courses with previews and structured learning paths.`}
        </p>
      </div>
      
      {/* Filters */}
      <Suspense fallback={<div className="h-12 animate-pulse bg-muted rounded" />}>
        <CourseFilters />
      </Suspense>

      {/* Course List */}
      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {hasFilters
                ? "No courses match your search criteria. Try adjusting your filters."
                : "No courses available at the moment. Check back soon for new courses!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <CourseList courses={courses} />
      )}
    </section>
  );
}
