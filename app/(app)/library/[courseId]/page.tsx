import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCourseForLibraryBySlug } from "@/lib/courses";
import { hasCourseAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";

type CourseAppPageProps = {
  params: { courseId: string };
};

export default async function CourseAppPage({ params }: CourseAppPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/sign-in");
  }

  const { courseId } = await params;
  const course = await getCourseForLibraryBySlug(courseId);
  if (!course) {
    redirect("/courses");
  }

  const hasAccess = await hasCourseAccess(
    session.user.id,
    session.user.role,
    course.id
  );
  if (!hasAccess) {
    return (
      <section className="grid gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-white">{course.title}</h1>
          <p className="mt-2 text-zinc-400">
            Purchase required to unlock the full lesson experience.
          </p>
        </div>
        <Link
          href={`/courses/${course.slug}`}
          className="inline-flex w-fit rounded-full border border-zinc-700 px-5 py-2 text-sm font-semibold text-white"
        >
          View public preview
        </Link>
      </section>
    );
  }

  const lessonIds = course.sections.flatMap((section) =>
    section.lessons.map((lesson) => lesson.id)
  );

  const progressEntries =
    lessonIds.length === 0
      ? []
      : await prisma.progress.findMany({
          where: { userId: session.user.id, lessonId: { in: lessonIds } },
        });

  const progressMap = new Map(
    progressEntries.map((entry) => [entry.lessonId, entry])
  );

  return (
    <section className="grid gap-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">{course.title}</h1>
        <p className="mt-2 text-zinc-400">
          Continue your learning path with structured sections and lessons.
        </p>
      </div>
      <div className="grid gap-6">
        {course.sections.map((section) => (
          <div
            key={section.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5"
          >
            <h2 className="text-lg font-semibold text-white">
              {section.title}
            </h2>
            <div className="mt-4 grid gap-3">
              {section.lessons.map((lesson) => {
                const progress = progressMap.get(lesson.id);
                return (
                  <Link
                    key={lesson.id}
                    href={`/library/${course.slug}/lesson/${lesson.id}`}
                    className="flex items-center justify-between rounded-xl border border-zinc-800 px-4 py-3 text-sm text-zinc-200 hover:border-zinc-600"
                  >
                    <span>{lesson.title}</span>
                    <span className="text-xs text-zinc-400">
                      {progress?.completionPercent ?? 0}% complete
                    </span>
                  </Link>
                );
              })}
              {section.lessons.length === 0 ? (
                <p className="text-sm text-zinc-400">
                  No lessons yet for this section.
                </p>
              ) : null}
            </div>
          </div>
        ))}
        {course.sections.length === 0 ? (
          <p className="text-sm text-zinc-400">
            This course has no sections yet. Add content in the admin panel.
          </p>
        ) : null}
      </div>
    </section>
  );
}
