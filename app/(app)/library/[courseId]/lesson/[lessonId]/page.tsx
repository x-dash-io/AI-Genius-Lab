import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireLessonAccess, getAuthorizedLessonContent } from "@/lib/lessons";
import { getLessonProgress } from "@/lib/progress";
import { LessonViewer } from "@/components/lessons/LessonViewer";

type LessonPageProps = {
  params: { courseId: string; lessonId: string };
};


export default async function LessonPage({ params }: LessonPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/sign-in");
  }

  const { courseId, lessonId } = await params;
  const { lesson, courseSlug, signedUrl } = await getAuthorizedLessonContent(
    lessonId
  );
  if (courseSlug !== courseId) {
    redirect(`/library/${courseId}`);
  }

  const progress = await getLessonProgress(lesson.id);

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
      
      <LessonViewer
        lessonId={lesson.id}
        contentType={lesson.contentType}
        contentUrl={signedUrl}
        allowDownload={lesson.allowDownload}
        initialProgress={progress ? {
          lastPosition: progress.lastPosition,
          completionPercent: progress.completionPercent,
          completedAt: progress.completedAt,
        } : null}
      />
    </section>
  );
}
