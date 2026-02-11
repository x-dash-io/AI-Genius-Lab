import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAuthorizedLessonContent } from "@/lib/lessons";
import { getLessonProgress } from "@/lib/progress";
import { LessonViewer } from "@/components/lessons/LessonViewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ContentRegion,
  PageContainer,
  PageHeader,
  StatusRegion,
  Toolbar,
} from "@/components/layout/shell";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  PlayCircle,
  Download,
  BookOpen,
  Sparkles,
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

  const { courseId, lessonId } = await params;

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
  const completionPercent = Math.round(progress?.completionPercent ?? 0);
  const isCompleted = Boolean(progress?.completedAt);

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case "video":
        return <PlayCircle className="h-4 w-4" />;
      case "audio":
        return <PlayCircle className="h-4 w-4" />;
      case "pdf":
        return <FileText className="h-4 w-4" />;
      case "file":
        return <FileText className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getContentTypeLabel = (contentType: string) => {
    switch (contentType) {
      case "video":
        return "Video lesson";
      case "audio":
        return "Audio lesson";
      case "pdf":
        return "PDF lesson";
      case "file":
        return "File lesson";
      case "link":
        return "External resource";
      default:
        return "Lesson content";
    }
  };

  const formatDuration = (contentType: string, durationSeconds?: number) => {
    if (!durationSeconds) return "Duration unknown";

    if (contentType === "pdf" || contentType === "file") {
      return `${durationSeconds} page${durationSeconds !== 1 ? "s" : ""}`;
    }

    const hours = Math.floor(durationSeconds / 3600);
    const minutes = Math.floor((durationSeconds % 3600) / 60);
    const seconds = durationSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title={lesson.title}
        description={contentMetadata?.description || "Continue this lesson and keep your completion streak active."}
        breadcrumbs={[
          { label: "Library", href: "/library" },
          { label: "Course", href: `/library/${courseId}` },
          { label: lesson.title },
        ]}
        actions={
          <Link href={`/library/${courseId}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to course
            </Button>
          </Link>
        }
      />

      <Toolbar className="gap-2">
        <Badge variant="secondary" className="inline-flex items-center gap-1">
          {getContentTypeIcon(lesson.contentType)}
          {getContentTypeLabel(lesson.contentType)}
        </Badge>
        <Badge variant="outline" className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {formatDuration(lesson.contentType, lesson.durationSeconds ?? undefined)}
        </Badge>
        <Badge variant="outline">{completionPercent}% complete</Badge>
        {lesson.allowDownload ? (
          <Badge variant="outline" className="inline-flex items-center gap-1">
            <Download className="h-3.5 w-3.5" />
            Download enabled
          </Badge>
        ) : null}
        {isCompleted ? (
          <Badge variant="secondary" className="inline-flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Completed
          </Badge>
        ) : null}
      </Toolbar>

      <ContentRegion>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card className="ui-surface">
            <CardHeader className="space-y-1">
              <CardTitle>Lesson Viewer</CardTitle>
              <CardDescription>Playback, downloads, and progress updates are handled by the existing lesson logic.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={completionPercent} className="h-2" />
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
            </CardContent>
          </Card>

          <StatusRegion className="xl:sticky xl:top-24 xl:self-start">
            <Card className="ui-surface">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/library/${courseId}`} className="block">
                  <Button className="w-full">Back to course</Button>
                </Link>
                <Link href="/library" className="block">
                  <Button variant="outline" className="w-full">Open library</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="ui-surface">
              <CardHeader>
                <CardTitle className="text-lg">Progress Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Completion</span>
                  <span className="font-semibold">{completionPercent}%</span>
                </div>
                {isCompleted ? (
                  <p className="inline-flex items-center gap-2 text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    Completed on {new Date(progress?.completedAt as Date).toLocaleDateString()}
                  </p>
                ) : (
                  <p className="inline-flex items-center gap-2 text-muted-foreground">
                    <Sparkles className="h-4 w-4" />
                    Keep going to finish this lesson.
                  </p>
                )}
              </CardContent>
            </Card>
          </StatusRegion>
        </div>
      </ContentRegion>
    </PageContainer>
  );
}
