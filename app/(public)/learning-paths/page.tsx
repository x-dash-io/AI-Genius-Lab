import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { getAllPublishedLearningPaths } from "@/lib/learning-paths";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Route, BookOpen } from "lucide-react";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { LearningPathFilters } from "@/components/learning-paths/LearningPathFilters";

export const metadata: Metadata = generateSEOMetadata({
  title: "Learning Paths",
  description:
    "Follow curated learning paths designed to take you from beginner to expert. Structured courses organized by outcomes.",
  keywords: ["learning paths", "structured learning", "AI curriculum", "course paths"],
});

interface LearningPathsPageProps {
  searchParams: Promise<{ search?: string; sort?: string }>;
}

async function LearningPathsContent({ searchParams }: LearningPathsPageProps) {
  const params = await searchParams;
  const allPathsData = await getAllPublishedLearningPaths();
  
  // Transform the data to match expected format
  const allPaths = allPathsData.map(pathData => ({
    ...pathData,
    courses: pathData.LearningPathCourse.map(lpc => ({
      ...lpc,
      course: lpc.Course,
    })),
    _count: {
      courses: pathData._count.LearningPathCourse,
    },
  }));
  
  let paths = [...allPaths];

  // Apply search filter
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    paths = paths.filter(
      (path) =>
        path.title.toLowerCase().includes(searchLower) ||
        path.description?.toLowerCase().includes(searchLower)
    );
  }

  // Apply sorting
  if (params.sort) {
    switch (params.sort) {
      case "oldest":
        paths = paths.reverse();
        break;
      case "courses":
        paths = paths.sort((a, b) => b._count.courses - a._count.courses);
        break;
      case "title":
        paths = paths.sort((a, b) => a.title.localeCompare(b.title));
        break;
      // "newest" is the default
    }
  }

  const totalPaths = allPaths.length;
  const filteredCount = paths.length;
  const hasFilters = params.search || params.sort;

  return (
    <>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Learning Paths
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
          Structured Learning Journeys
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          {hasFilters
            ? `Showing ${filteredCount} of ${totalPaths} learning paths`
            : "Follow curated learning paths designed to take you from beginner to expert."}
        </p>
      </div>

      {/* Filters */}
      <Suspense fallback={<div className="h-12 animate-pulse bg-muted rounded" />}>
        <LearningPathFilters />
      </Suspense>

      {paths.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Route className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {hasFilters
                ? "No learning paths match your search criteria."
                : "No learning paths available yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {paths.map((path) => (
            <Card key={path.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{path.title}</CardTitle>
                    {path.description && (
                      <CardDescription className="mt-2">
                        {path.description}
                      </CardDescription>
                    )}
                  </div>
                  <Route className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{path._count.courses} courses</span>
                  </div>
                  {path.courses.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Courses in this path:</p>
                      <div className="flex flex-wrap gap-2">
                        {path.courses.slice(0, 3).map((pathCourse) => (
                          <Badge key={pathCourse.id} variant="secondary">
                            {pathCourse.course.title}
                          </Badge>
                        ))}
                        {path.courses.length > 3 && (
                          <Badge variant="outline">
                            +{path.courses.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  <Link href={`/learning-paths/${path.id}`}>
                    <Button className="w-full">View Learning Path</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

export default async function LearningPathsPage({ searchParams }: LearningPathsPageProps) {
  return (
    <section className="grid gap-8">
      <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded" />}>
        <LearningPathsContent searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
