import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BookOpen, Clock3, Layers3, Star } from "lucide-react";
import { getCoursePreviewBySlug } from "@/lib/courses";
import { getCourseReviewStats } from "@/lib/reviews";
import { CourseActions } from "@/components/courses/CourseActions";
import { ReviewSection } from "@/components/reviews/ReviewSection";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { generateCourseSchema } from "@/lib/seo/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ContentRegion,
  PageContainer,
  PageHeader,
  StatusRegion,
} from "@/components/layout/shell";

export const dynamic = "force-dynamic";

type CourseDetailPageProps = {
  params: Promise<{ courseId: string }>;
};

export async function generateMetadata({ params }: CourseDetailPageProps): Promise<Metadata> {
  const { courseId } = await params;
  const course = await getCoursePreviewBySlug(courseId);

  if (!course) {
    return generateSEOMetadata({
      title: "Course Not Found",
      noindex: true,
    });
  }

  return generateSEOMetadata({
    title: course.title,
    description: course.description || `Learn ${course.title} with structured lessons and progress tracking.`,
    keywords: ["AI course", course.title, "online learning"],
    url: `/courses/${course.slug}`,
    type: "website",
    image: `/api/og?title=${encodeURIComponent(course.title)}&description=${encodeURIComponent(course.description || `Learn ${course.title} with structured lessons and progress tracking.`)}`,
  });
}

function formatPrice(priceCents: number) {
  return priceCents === 0 ? "Free" : `$${(priceCents / 100).toFixed(2)}`;
}

function resolveCourseImage(imageUrl: string | null) {
  if (!imageUrl) {
    return null;
  }

  if (imageUrl.startsWith("/") || imageUrl.includes("res.cloudinary.com")) {
    return imageUrl;
  }

  return null;
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { courseId } = await params;
  const course = await getCoursePreviewBySlug(courseId);

  if (!course) {
    notFound();
  }

  const reviewStats = await getCourseReviewStats(course.id);
  const courseImage = resolveCourseImage(course.imageUrl);
  const lessons = course.sections.flatMap((section) =>
    section.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      sectionTitle: section.title,
      contentType: lesson.contents?.[0]?.contentType || "Lesson",
    }))
  );

  const courseSchema = generateCourseSchema({
    name: course.title,
    description: course.description || `Learn ${course.title}`,
    url: `/courses/${course.slug}`,
    priceCents: course.priceCents,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(courseSchema),
        }}
      />
      <PageContainer className="space-y-6">
        <PageHeader
          title={course.title}
          description={course.description || "Structured AI curriculum with practical implementation focus."}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Courses", href: "/courses" },
            { label: course.title },
          ]}
          actions={
            <CourseActions
              courseId={course.id}
              courseSlug={course.slug}
              priceCents={course.priceCents}
              tier={course.tier}
            />
          }
        />

        <ContentRegion className="lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="grid gap-6">
            <Card className="ui-surface">
              <div className="relative aspect-video overflow-hidden rounded-t-[var(--radius-lg)] border-b bg-muted/25">
                {courseImage ? (
                  <Image
                    src={courseImage}
                    alt={course.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(145deg,hsl(var(--primary)_/_0.16),hsl(var(--accent)_/_0.6))]" />
                )}
              </div>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={course.tier === "PREMIUM" ? "default" : "secondary"}>
                    {course.tier}
                  </Badge>
                  <Badge variant="outline">{formatPrice(course.priceCents)}</Badge>
                </div>
                <CardTitle>Course Overview</CardTitle>
                <CardDescription>
                  This course is organized into sections and lessons with progress tracking and certification support.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[var(--radius-sm)] border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Sections</p>
                  <p className="mt-1 text-2xl font-semibold">{course.sections.length}</p>
                </div>
                <div className="rounded-[var(--radius-sm)] border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Lessons</p>
                  <p className="mt-1 text-2xl font-semibold">{lessons.length}</p>
                </div>
                <div className="rounded-[var(--radius-sm)] border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Learning Mode</p>
                  <p className="mt-1 text-sm font-semibold">Self-paced</p>
                </div>
              </CardContent>
            </Card>

            {lessons.length ? (
              <Card className="ui-surface">
                <CardHeader>
                  <CardTitle>Curriculum</CardTitle>
                  <CardDescription>Preview the course structure before purchase.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {lessons.slice(0, 12).map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-sm)] border bg-background p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {String(index + 1).padStart(2, "0")} · {lesson.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lesson.sectionTitle}
                        </p>
                      </div>
                      <Badge variant="outline">{lesson.contentType}</Badge>
                    </div>
                  ))}
                  {lessons.length > 12 ? (
                    <p className="text-xs text-muted-foreground">
                      + {lessons.length - 12} more lessons available after enrollment.
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            ) : (
              <EmptyState
                icon={<Layers3 className="h-6 w-6" />}
                title="Curriculum pending"
                description="The lesson structure is being finalized for this course."
              />
            )}
          </div>

          <div className="grid gap-6">
            <Card className="ui-surface">
              <CardHeader>
                <CardTitle className="text-xl">Enrollment Snapshot</CardTitle>
                <CardDescription>Commerce and access are handled in your checkout flow.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-[var(--radius-sm)] border bg-background px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Clock3 className="h-4 w-4" />
                    Access
                  </span>
                  <span className="font-semibold">Lifetime</span>
                </div>
                <div className="flex items-center justify-between rounded-[var(--radius-sm)] border bg-background px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    Content
                  </span>
                  <span className="font-semibold">{lessons.length} lessons</span>
                </div>
                <div className="flex items-center justify-between rounded-[var(--radius-sm)] border bg-background px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Star className="h-4 w-4" />
                    Rating
                  </span>
                  <span className="font-semibold">{reviewStats.averageRating.toFixed(1)} / 5</span>
                </div>
                <Link href="/courses" className="block">
                  <Button variant="outline" className="w-full">
                    Back to Catalog
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="ui-surface">
              <CardHeader>
                <CardTitle className="text-xl">Learner Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <ReviewSection courseId={course.id} initialStats={reviewStats} />
              </CardContent>
            </Card>
          </div>
        </ContentRegion>

        <StatusRegion>
          {!course.sections.length ? (
            <Card className="ui-surface">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <p className="text-sm text-muted-foreground">
                  Course details are available, but lesson structure is not published yet.
                </p>
                <Link href="/contact">
                  <Button size="sm" variant="ghost">
                    Contact Support
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : null}
        </StatusRegion>
      </PageContainer>
    </>
  );
}
