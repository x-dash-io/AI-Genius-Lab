import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireLessonAccess, getAuthorizedLessonContent } from "@/lib/lessons";
import { getLessonProgress } from "@/lib/progress";
import { LessonViewer } from "@/components/lessons/LessonViewer";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  PlayCircle,
  Download,
  ChevronRight
} from "lucide-react";

type LessonPageProps = {
  params: { courseId: string; lessonId: string };
};

export default async function LessonPage({ params }: LessonPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/sign-in");
  }

  const { courseId, lessonId } = await params;

  let lesson, courseSlug, signedUrl;
  try {
    const result = await getAuthorizedLessonContent(lessonId);
    lesson = result.lesson;
    courseSlug = result.courseSlug;
    signedUrl = result.signedUrl;
  } catch (error) {
    // If lesson doesn't exist, redirect to course page
    if (error instanceof Error && error.message === "NOT_FOUND") {
      redirect(`/library/${courseId}`);
    }
    throw error;
  }

  if (courseSlug !== courseId) {
    redirect(`/library/${courseId}`);
  }

  const progress = await getLessonProgress(lesson.id);

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'video':
        return <PlayCircle className="h-4 w-4" />;
      case 'audio':
        return <PlayCircle className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'file':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatDuration = (contentType: string, durationSeconds?: number) => {
    if (!durationSeconds) return 'Duration unknown';

    if (contentType === 'pdf' || contentType === 'file') {
      return `${durationSeconds} page${durationSeconds !== 1 ? 's' : ''}`;
    }

    const hours = Math.floor(durationSeconds / 3600);
    const minutes = Math.floor((durationSeconds % 3600) / 60);
    const seconds = durationSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <section className="grid gap-4 sm:gap-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-zinc-400 overflow-x-auto">
        <Link
          href="/library"
          className="hover:text-zinc-200 transition-colors whitespace-nowrap"
        >
          Library
        </Link>
        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
        <Link
          href={`/library/${courseId}`}
          className="hover:text-zinc-200 transition-colors whitespace-nowrap"
        >
          Course
        </Link>
        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
        <span className="text-zinc-200 truncate">{lesson.title}</span>
      </nav>

      {/* Header */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
              <div className="flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full bg-zinc-800 text-xs font-medium text-zinc-200 uppercase tracking-wide">
                {getContentTypeIcon(lesson.contentType)}
                {lesson.contentType?.toUpperCase() || 'UNKNOWN'}
              </div>
              {progress?.completedAt && (
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full bg-green-900/20 border border-green-800 text-xs font-medium text-green-400">
                  <CheckCircle2 className="h-3 w-3" />
                  Completed
                </div>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 break-words">
              {lesson.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-zinc-400">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                {formatDuration(lesson.contentType, lesson.durationSeconds ?? undefined)}
              </div>

              {lesson.allowDownload && (
                <div className="flex items-center gap-2">
                  <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                  Downloadable
                </div>
              )}

              {progress && (
                <div className="flex items-center gap-2">
                  <div className="w-12 sm:w-16 h-2 bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress.completionPercent}%` }}
                    />
                  </div>
                  <span className="text-xs whitespace-nowrap">{Math.round(progress.completionPercent)}% complete</span>
                </div>
              )}
            </div>
          </div>

          <Link
            href={`/library/${courseId}`}
            className="flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 rounded-lg border border-zinc-700 text-xs sm:text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors whitespace-nowrap flex-shrink-0"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            Back to Course
          </Link>
        </div>
      </div>

      {/* Content Viewer */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-6">
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
      </div>
    </section>
  );
}
