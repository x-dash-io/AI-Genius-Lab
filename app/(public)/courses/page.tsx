import { Metadata } from "next";
import { getPublishedCourses } from "@/lib/courses";
import { CourseList } from "@/components/courses/CourseList";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";

export const metadata: Metadata = generateSEOMetadata({
  title: "Course Catalog",
  description:
    "Browse curated AI courses with previews and structured learning paths. Learn AI for business, content, apps, and productivity.",
  keywords: ["AI courses", "course catalog", "online courses", "AI training"],
});

export default async function CoursesPage() {
  const courses = await getPublishedCourses();

  return (
    <section className="grid gap-6">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Course Catalog
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Browse curated AI courses with previews and structured learning paths.
        </p>
      </div>
      <CourseList courses={courses} />
    </section>
  );
}
