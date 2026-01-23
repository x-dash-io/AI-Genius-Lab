import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/access";
import { getAllCourses } from "@/lib/admin/courses";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { BookOpen, Plus, Edit, Trash2 } from "lucide-react";
import { CourseFilters } from "@/components/admin/CourseFilters";

interface AdminCoursesPageProps {
  searchParams: Promise<{ search?: string; status?: string; category?: string }>;
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default async function AdminCoursesPage({ searchParams }: AdminCoursesPageProps) {
  await requireRole("admin");

  const params = await searchParams;
  const allCourses = await getAllCourses();
  
  let courses = [...allCourses];

  // Apply search filter
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    courses = courses.filter(
      (course) =>
        course.title.toLowerCase().includes(searchLower) ||
        course.description?.toLowerCase().includes(searchLower) ||
        course.slug.toLowerCase().includes(searchLower)
    );
  }

  // Apply status filter
  if (params.status) {
    if (params.status === "published") {
      courses = courses.filter((course) => course.isPublished);
    } else if (params.status === "draft") {
      courses = courses.filter((course) => !course.isPublished);
    }
  }

  // Apply category filter
  if (params.category) {
    courses = courses.filter((course) => course.category === params.category);
  }

  const totalCourses = allCourses.length;
  const filteredCount = courses.length;
  const hasFilters = params.search || params.status || params.category;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Course Management
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
            Courses
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Manage all courses, sections, and lessons.
          </p>
        </div>
        <Link href="/admin/courses/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search & Filter</CardTitle>
          <CardDescription>
            {hasFilters
              ? `Showing ${filteredCount} of ${totalCourses} courses`
              : `${totalCourses} courses total`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-10 animate-pulse bg-muted rounded" />}>
            <CourseFilters />
          </Suspense>
        </CardContent>
      </Card>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              {hasFilters
                ? "No courses match your search criteria."
                : "No courses yet. Create your first course to get started."}
            </p>
            {hasFilters ? (
              <Link href="/admin/courses">
                <Button variant="outline">Clear Filters</Button>
              </Link>
            ) : (
              <Link href="/admin/courses/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Course
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-xl">{course.title}</CardTitle>
                      {course.isPublished ? (
                        <Badge variant="default">Published</Badge>
                      ) : (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                      {course.category && (
                        <Badge variant="outline" className="capitalize">
                          {course.category}
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{course.description || "No description"}</CardDescription>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                      <span>{formatCurrency(course.priceCents)}</span>
                      <span>•</span>
                      <span>{course._count.sections} sections</span>
                      <span>•</span>
                      <span>{course._count.purchases} purchases</span>
                      <span>•</span>
                      <span>{course._count.enrollments} enrollments</span>
                      {course.inventory !== null && (
                        <>
                          <span>•</span>
                          <span>{course.inventory} in stock</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/courses/${course.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
