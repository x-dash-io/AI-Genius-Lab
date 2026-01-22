import Link from "next/link";
import { notFound } from "next/navigation";
import { getCoursePreviewBySlug } from "@/lib/courses";

type CourseDetailPageProps = {
  params: { courseId: string };
};

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const course = await getCoursePreviewBySlug(params.courseId);

  if (!course) {
    notFound();
  }

  return (
    <section className="grid gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Course Preview
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-900">
          {course.title}
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-600">
          {course.description ??
            "Detailed course pages will include lesson previews, outcomes, and learning resources."}
        </p>
      </div>
      <div className="grid gap-4 rounded-2xl border border-dashed border-zinc-300 p-5 text-sm text-zinc-600">
        <p>Preview lessons and resources below.</p>
        <ul className="grid gap-2">
          {course.sections.flatMap((section) => section.lessons).length === 0 ? (
            <li>No lessons yet. Add lessons in the admin panel.</li>
          ) : (
            course.sections.flatMap((section) =>
              section.lessons.slice(0, 2).map((lesson) => (
                <li key={lesson.id}>
                  {lesson.title} · {lesson.contentType.toUpperCase()}
                </li>
              ))
            )
          )}
        </ul>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/checkout?course=${course.slug}`}
          className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white"
        >
          Buy for ${(course.priceCents / 100).toFixed(2)}
        </Link>
        <Link
          href="/courses"
          className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-900"
        >
          Back to catalog
        </Link>
      </div>
    </section>
  );
}
