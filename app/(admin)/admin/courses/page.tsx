import { Suspense } from "react";
import { requireRole } from "@/lib/access";
import { getAllCourses } from "@/lib/admin/courses";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { BookOpen, Plus, Edit, Loader2 } from "lucide-react";
import { CourseFilters } from "@/components/admin/CourseFilters";
import { BulkImport } from "@/components/admin/BulkImport";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteCourseAction } from "@/app/actions/delete-actions";

export const dynamic = "force-dynamic";

interface AdminCoursesPageProps {
  searchParams: Promise<{ search?: string; status?: string; category?: string }>;
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

async function CourseList({ searchParams }: AdminCoursesPageProps) {
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
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border-white/10 shadow-xl overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">Search & Filter</CardTitle>
          </div>
          <CardDescription className="text-xs font-semibold">
            {hasFilters
              ? `Displaying ${filteredCount} results from ${totalCourses} total courses`
              : `${totalCourses} courses available`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-10 animate-pulse bg-muted rounded-xl" />}>
            <CourseFilters />
          </Suspense>
        </CardContent>
      </Card>

      {courses.length === 0 ? (
        <Card className="py-20 border-white/5 shadow-2xl">
          <CardContent className="text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-accent/30 flex items-center justify-center mb-6">
              <BookOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-xl font-bold text-foreground/80 mb-6 max-w-sm mx-auto">
              {hasFilters
                ? "No courses match your current search criteria."
                : "Your academy is empty. High time to create your first masterpiece."}
            </p>
            {hasFilters && (
              <Link href="/admin/courses">
                <Button variant="premium" className="rounded-xl px-10">Clear All Filters</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <Card key={course.id} className="group hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 rounded-2xl overflow-hidden">
              <CardHeader className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <CardTitle className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors">{course.title}</CardTitle>
                      <div className="flex gap-2">
                        {course.isPublished ? (
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/20 px-3 py-1 font-bold">Published</Badge>
                        ) : (
                          <Badge variant="secondary" className="px-3 py-1 font-bold">Draft</Badge>
                        )}
                        {course.category && (
                          <Badge variant="outline" className="capitalize px-3 py-1 border-primary/20 text-primary font-bold">
                            {course.category}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <CardDescription className="text-sm font-medium line-clamp-2 max-w-3xl leading-relaxed">
                      {course.description || "No professional overview provided for this course."}
                    </CardDescription>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-2">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Price</p>
                        <p className="text-lg font-bold">{formatCurrency(course.priceCents)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Curriculum</p>
                        <p className="text-lg font-bold">{course._count.sections} Sections</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Performance</p>
                        <p className="text-lg font-bold">{course._count.purchases} Sales</p>
                      </div>
                      <div className="space-y-1 border-l border-border/50 pl-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Inventory</p>
                        <p className="text-lg font-bold">{course.inventory ?? "Infinite"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end lg:self-center">
                    <Link href={`/admin/courses/${course.id}/edit`}>
                      <Button variant="outline" className="rounded-xl px-5 h-11 border-2 font-bold hover:bg-accent/50 group/edit">
                        <Edit className="mr-2 h-4 w-4 transition-transform group-hover/edit:-rotate-12" />
                        Management
                      </Button>
                    </Link>
                    <DeleteButton
                      id={course.id}
                      title={course.title}
                      onDelete={deleteCourseAction}
                    />
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

export default async function AdminCoursesPage({ searchParams }: AdminCoursesPageProps) {
  await requireRole("admin");

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            Master Control
          </p>
          <h1 className="font-display text-5xl font-black tracking-tight">
            Course <span className="text-muted-foreground/30 font-light italic">Catalog</span>
          </h1>
          <p className="text-muted-foreground font-medium max-w-lg">
            Architect, monitor, and refine your professional learning experiences from a central mission control.
          </p>
        </div>
        <Link href="/admin/courses/new">
          <Button variant="premium" size="lg" className="rounded-xl shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-5 w-5 font-bold" />
            New Course
          </Button>
        </Link>
      </div>

      {/* Bulk Import */}
      <BulkImport />

      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }>
        <CourseList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
