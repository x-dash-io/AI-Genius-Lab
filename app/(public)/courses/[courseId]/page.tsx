import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCoursePreviewBySlug } from "@/lib/courses";
import { getCourseReviewStats } from "@/lib/reviews";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReviewSection } from "@/components/reviews/ReviewSection";
import { CourseActions } from "@/components/courses/CourseActions";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { generateCourseSchema } from "@/lib/seo/schemas";

type CourseDetailPageProps = {
  params: Promise<{ courseId: string }>;
};

export async function generateMetadata({
  params,
}: CourseDetailPageProps): Promise<Metadata> {
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
  });
}

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const { courseId } = await params;
  const course = await getCoursePreviewBySlug(courseId);

  if (!course) {
    notFound();
  }

  const reviewStats = await getCourseReviewStats(course.id);
  const lessons = course.sections.flatMap((section) =>
    section.lessons.map(lesson => ({
      ...lesson,
      contents: lesson.contents,
    }))
  );
  
  const courseSchema = generateCourseSchema({
    name: course.title,
    description: course.description || `Learn ${course.title}`,
    url: `/courses/${course.slug}`,
    priceCents: course.priceCents,
  });

  return (
    <section className="grid gap-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Course Preview
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
          {course.title}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          {course.description ??
            "Detailed course pages will include lesson previews, outcomes, and learning resources."}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Preview Lessons</CardTitle>
          <CardDescription>
            Get a preview of what you'll learn in this course
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lessons.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No lessons yet. Add lessons in the admin panel.
            </p>
          ) : (
            <ul className="grid gap-3">
              {lessons.slice(0, 5).map((lesson) => (
                <li
                  key={lesson.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{lesson.title}</p>
                    <Badge variant="secondary" className="mt-1">
                      {(lesson.contents?.[0]?.contentType?.toUpperCase()) || "LESSON"}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <CourseActions
        courseId={course.id}
        courseSlug={course.slug}
        priceCents={course.priceCents}
      />

      {/* Reviews Section */}
      <ReviewSection courseId={course.id} initialStats={reviewStats} />
    </section>
  );
}
