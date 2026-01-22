import Link from "next/link";
import { getPublishedCourses } from "@/lib/courses";

export default async function CoursesPage() {
  const courses = await getPublishedCourses();

  return (
    <section className="grid gap-8">
      <div>
        <h1 className="text-3xl font-semibold text-zinc-900">Course Catalog</h1>
        <p className="mt-2 text-zinc-600">
          Browse curated AI courses with previews and structured learning paths.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((course) => (
          <article
            key={course.id}
            className="rounded-2xl border border-zinc-200 p-5"
          >
            <h2 className="text-lg font-semibold text-zinc-900">
              {course.title}
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              {course.description ?? "Course details coming soon."}
            </p>
            <Link
              href={`/courses/${course.slug}`}
              className="mt-4 inline-flex text-sm font-semibold text-zinc-900"
            >
              View details →
            </Link>
          </article>
        ))}
        {courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600">
            No published courses yet. Seed data to preview the catalog.
          </div>
        ) : null}
      </div>
    </section>
  );
}
