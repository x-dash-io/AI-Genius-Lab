import Link from "next/link";
import { notFound } from "next/navigation";
import { getCoursePreviewBySlug } from "@/lib/courses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type CourseDetailPageProps = {
  params: { courseId: string };
};

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const { courseId } = await params;
  const course = await getCoursePreviewBySlug(courseId);

  if (!course) {
    notFound();
  }

  const lessons = course.sections.flatMap((section) => section.lessons);

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
                      {lesson.contentType.toUpperCase()}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <div className="flex flex-wrap gap-4">
        <Link href={`/checkout?course=${course.slug}`}>
          <Button size="lg">
            Buy for ${(course.priceCents / 100).toFixed(2)}
          </Button>
        </Link>
        <Link href="/courses">
          <Button variant="outline" size="lg">
            Back to catalog
          </Button>
        </Link>
      </div>
    </section>
  );
}
