import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { ArrowRight, Route, Search, SlidersHorizontal } from "lucide-react";
import { getAllPublishedLearningPaths } from "@/lib/learning-paths";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  title: "Learning Paths",
  description:
    "Follow curated learning paths designed to take you from beginner to expert. Structured courses organized by outcomes.",
  keywords: ["learning paths", "structured learning", "AI curriculum", "course paths"],
});

interface LearningPathsPageProps {
  searchParams: Promise<{ search?: string; sort?: string }>;
}

type LearningPathListItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  courses: Array<{
    id: string;
    course: {
      id: string;
      title: string;
    };
  }>;
  _count: {
    courses: number;
  };
};

function applySort(paths: LearningPathListItem[], sort: string | undefined) {
  switch (sort) {
    case "oldest":
      return [...paths].reverse();
    case "courses":
      return [...paths].sort((a, b) => b._count.courses - a._count.courses);
    case "title":
      return [...paths].sort((a, b) => a.title.localeCompare(b.title));
    default:
      return paths;
  }
}

function resolvePathImage(imageUrl: string | null) {
  if (!imageUrl) {
    return null;
  }

  if (imageUrl.startsWith("/") || imageUrl.includes("res.cloudinary.com")) {
    return imageUrl;
  }

  return null;
}

export default async function LearningPathsPage({ searchParams }: LearningPathsPageProps) {
  const params = await searchParams;
  const allPathsData = await getAllPublishedLearningPaths();

  type RawLearningPath = (typeof allPathsData)[number];
  type RawPathCourse = RawLearningPath["courses"][number] & {
    Course: {
      id: string;
      title: string;
    };
  };

  const allPaths: LearningPathListItem[] = allPathsData.map((pathData: RawLearningPath) => ({
    ...pathData,
    courses: pathData.courses.map((pathCourse: RawPathCourse) => ({
      ...pathCourse,
      course: pathCourse.Course,
    })),
    _count: {
      courses: pathData._count.courses,
    },
  }));

  let paths = [...allPaths];

  if (params.search) {
    const searchTerm = params.search.toLowerCase();
    paths = paths.filter(
      (path) =>
        path.title.toLowerCase().includes(searchTerm) ||
        path.description?.toLowerCase().includes(searchTerm)
    );
  }

  paths = applySort(paths, params.sort);

  const hasFilters = Boolean(params.search || params.sort);
  const totalPaths = allPaths.length;

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Learning Paths"
        description={
          hasFilters
            ? `Showing ${paths.length} of ${totalPaths} curated learning paths.`
            : "Choose an end-to-end track to move from discovery to measurable outcomes."
        }
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Learning Paths" },
        ]}
      />

      <Toolbar className="justify-between">
        <form action="/learning-paths" method="get" className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
          <div className="relative w-full lg:w-96">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="search"
              defaultValue={params.search}
              placeholder="Search learning paths"
              className="pl-9"
            />
          </div>
          <label className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border bg-background px-3 py-2 text-sm text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4" />
            Sort
            <select
              name="sort"
              defaultValue={params.sort || "newest"}
              className="bg-transparent text-sm text-foreground outline-none"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="courses">Most Courses</option>
              <option value="title">Title A-Z</option>
            </select>
          </label>
          <Button type="submit" variant="outline" className="h-11 sm:w-auto">
            Apply
          </Button>
          {hasFilters ? (
            <Link href="/learning-paths">
              <Button type="button" variant="ghost">
                Clear
              </Button>
            </Link>
          ) : null}
        </form>

        <Link href="/courses">
          <Button variant="ghost" size="sm">
            Browse Courses
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </Toolbar>

      <ContentRegion>
        {paths.length ? (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paths.map((path) => {
              const pathImage = resolvePathImage(path.imageUrl);

              return (
                <Card key={path.id} className="ui-surface group flex h-full flex-col border">
                  <div className="relative aspect-video overflow-hidden border-b bg-muted/25">
                    {pathImage ? (
                      <Image
                        src={pathImage}
                        alt={path.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[linear-gradient(145deg,hsl(var(--primary)_/_0.16),hsl(var(--accent)_/_0.6))]" />
                    )}
                  </div>
                  <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary">{path._count.courses} courses</Badge>
                    <Badge variant="outline">Structured</Badge>
                  </div>
                  <CardTitle className="text-xl">{path.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {path.description || "A guided path across multiple courses with tracked progression."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto space-y-3">
                  <div className="flex flex-wrap gap-2 text-xs">
                    {path.courses.slice(0, 3).map((pathCourse) => (
                      <span
                        key={pathCourse.id}
                        className="rounded-full border bg-background px-2.5 py-1 text-muted-foreground"
                      >
                        {pathCourse.course.title}
                      </span>
                    ))}
                    {path.courses.length > 3 ? (
                      <span className="rounded-full border bg-background px-2.5 py-1 text-muted-foreground">
                        +{path.courses.length - 3} more
                      </span>
                    ) : null}
                  </div>
                  <Link href={`/learning-paths/${path.slug}`}>
                    <Button variant="outline" className="w-full group-hover:border-primary">
                      View Path
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              );
            })}
          </section>
        ) : null}
      </ContentRegion>

      <StatusRegion>
        {paths.length === 0 ? (
          <EmptyState
            icon={<Route className="h-6 w-6" />}
            title="No learning paths found"
            description={
              hasFilters
                ? "No paths match your filters yet. Clear filters and try again."
                : "Learning paths will appear here once they are published."
            }
            action={
              <Link href="/learning-paths">
                <Button variant="outline">Reset filters</Button>
              </Link>
            }
          />
        ) : (
          <Card className="ui-surface border">
            <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
              <p className="text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{paths.length}</span> of{" "}
                <span className="font-semibold text-foreground">{totalPaths}</span> learning paths
              </p>
              <Link href="/pricing">
                <Button variant="ghost" size="sm">
                  View subscription tiers
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </StatusRegion>
    </PageContainer>
  );
}
