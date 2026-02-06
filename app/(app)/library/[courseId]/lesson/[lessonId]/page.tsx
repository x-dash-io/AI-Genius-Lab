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
  ChevronRight,
  BookOpen
} from "lucide-react";

export const dynamic = "force-dynamic";

type LessonPageProps = {
  params: { courseId: string; lessonId: string };
};

export default async function LessonPage({ params }: LessonPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/sign-in");
  }

  const { courseId, lessonId } = params;

  let lesson, courseSlug, signedUrl, downloadUrl, contentMetadata;
  try {
    const result = await getAuthorizedLessonContent(lessonId);
    lesson = result.lesson;
    courseSlug = result.courseSlug;
    signedUrl = result.signedUrl;
    downloadUrl = result.downloadUrl;
    contentMetadata = result.contentMetadata;
  } catch (error) {
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
        return <BookOpen className="h-4 w-4" />;
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
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto pb-2">
        <Link
          href="/library"
          className="hover:text-foreground transition-colors whitespace-nowrap flex items-center gap-1.5 hover:underline"
        >
          <BookOpen className="h-4 w-4" />
          Library
        </Link>
        <ChevronRight className="h-4 w-4 flex-shrink-0" />
        <Link
          href={`/library/${courseId}`}
          className="hover:text-foreground transition-colors whitespace-nowrap hover:underline"
        >
          Course
        </Link>
        <ChevronRight className="h-4 w-4 flex-shrink-0" />
        <span className="text-foreground truncate font-medium">{lesson.title}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lesson Header Card */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary uppercase tracking-wide">
                {getContentTypeIcon(lesson.contentType)}
                {lesson.contentType?.toUpperCase() || 'CONTENT'}
              </div>
              {progress?.completedAt && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-sm font-medium text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Completed
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
              {lesson.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {formatDuration(lesson.contentType, lesson.durationSeconds ?? undefined)}
              </div>

              {lesson.allowDownload && (
                <div className="flex items-center gap-2 text-primary">
                  <Download className="h-4 w-4" />
                  Downloadable
                </div>
              )}

              {progress && (
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${progress.completionPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium">{Math.round(progress.completionPercent)}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Content Viewer */}
          <LessonViewer
            lessonId={lesson.id}
            contentType={lesson.contentType}
            contentUrl={signedUrl}
            downloadUrl={downloadUrl}
            allowDownload={lesson.allowDownload}
            contentMetadata={contentMetadata}
            initialProgress={progress ? {
              lastPosition: progress.lastPosition,
              completionPercent: progress.completionPercent,
              completedAt: progress.completedAt,
            } : null}
          />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Actions Card */}
          <div className="rounded-xl border bg-card p-6 shadow-sm sticky top-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

            <div className="space-y-3">
              <Link
                href={`/library/${courseId}`}
                className="flex items-center gap-3 px-5 py-3 rounded-lg border bg-muted/50 hover:bg-muted transition-all group"
              >
                <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="font-medium">Back to Course</span>
              </Link>

              <Link
                href="/library"
                className="flex items-center gap-3 px-5 py-3 rounded-lg border bg-muted/50 hover:bg-muted transition-all group"
              >
                <BookOpen className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="font-medium">My Library</span>
              </Link>
            </div>

            {/* Progress Summary */}
            {progress && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Your Progress</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completion</span>
                    <span className="font-semibold">{Math.round(progress.completionPercent)}%</span>
                  </div>
                  {progress.completedAt && (
                    <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-4 w-4" />
                      Completed on {new Date(progress.completedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
