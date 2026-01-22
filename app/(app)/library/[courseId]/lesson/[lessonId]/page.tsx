import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireLessonAccess, getAuthorizedLessonContent } from "@/lib/lessons";
import { prisma } from "@/lib/prisma";

type LessonPageProps = {
  params: { courseId: string; lessonId: string };
};

async function updateLessonProgress(formData: FormData) {
  "use server";

  const lessonId = String(formData.get("lessonId") ?? "");
  if (!lessonId) {
    throw new Error("INVALID_LESSON");
  }

  const access = await requireLessonAccess(lessonId);

  await prisma.progress.upsert({
    where: {
      userId_lessonId: {
        userId: access.userId,
        lessonId: access.lessonId,
      },
    },
    create: {
      userId: access.userId,
      lessonId: access.lessonId,
      startedAt: new Date(),
      completedAt: new Date(),
      completionPercent: 100,
    },
    update: {
      completedAt: new Date(),
      completionPercent: 100,
    },
  });
}

export default async function LessonPage({ params }: LessonPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const { lesson, courseSlug, signedUrl } = await getAuthorizedLessonContent(
    params.lessonId
  );
  if (courseSlug !== params.courseId) {
    redirect(`/library/${params.courseId}`);
  }

  const progress = await prisma.progress.findUnique({
    where: {
      userId_lessonId: {
        userId: session.user.id,
        lessonId: lesson.id,
      },
    },
  });

  return (
    <section className="grid gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
          Lesson Viewer
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">
          {lesson.title}
        </h1>
        <p className="mt-2 text-zinc-400">
          Content type: {lesson.contentType.toUpperCase()} ·{" "}
          {lesson.durationSeconds ?? 0}s
        </p>
      </div>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-sm text-zinc-300">
        {signedUrl ? (
          <a
            href={signedUrl}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-white underline"
          >
            Open secured lesson asset
          </a>
        ) : (
          <p>No secured asset is available for this lesson yet.</p>
        )}
      </div>
      <form action={updateLessonProgress}>
        <input type="hidden" name="lessonId" value={lesson.id} />
        <button
          type="submit"
          className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
        >
          {progress?.completedAt ? "Completed" : "Complete lesson"}
        </button>
      </form>
    </section>
  );
}
