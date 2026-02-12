"use client";

import { useState, useEffect, useTransition, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  AlertCircle,
  ShoppingCart,
  BookOpen,
  GraduationCap,
  Star,
  Calendar,
  Filter,
  Loader2,
  X,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { formatDistanceToNow, format, subDays, subHours } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { useAdminPreview } from "@/components/admin/PreviewBanner";
import { sampleCourses, sampleLessons } from "@/lib/config";
import {
  ContentRegion,
  PageContainer,
  PageHeader,
  StatusRegion,
  Toolbar,
} from "@/components/layout/shell";

export const dynamic = "force-dynamic";

interface ActivityEntry {
  id: string;
  type: string;
  metadata: Record<string, string | number | boolean | null | undefined>;
  createdAt: Date;
}

interface ActivityGroup {
  date: string;
  entries: ActivityEntry[];
}

const activityIcons: Record<string, LucideIcon> = {
  purchase_completed: ShoppingCart,
  lesson_completed: GraduationCap,
  course_started: BookOpen,
  review_created: Star,
  certificate_earned: Star,
  default: Activity,
};

const activityLabels: Record<string, string> = {
  purchase_completed: "Purchase Completed",
  lesson_completed: "Lesson Completed",
  course_started: "Course Started",
  review_created: "Review Created",
  certificate_earned: "Certificate Earned",
};

// Sample activity data for admin preview
const getSampleActivityData = (): ActivityEntry[] => {
  const now = new Date();

  return [
    {
      id: "sample-1",
      type: "purchase_completed",
      metadata: { courseTitle: sampleCourses[0].title, courseSlug: sampleCourses[0].slug },
      createdAt: subHours(now, 2),
    },
    {
      id: "sample-2",
      type: "course_started",
      metadata: { courseTitle: sampleCourses[0].title, courseSlug: sampleCourses[0].slug },
      createdAt: subHours(now, 2),
    },
    {
      id: "sample-3",
      type: "lesson_completed",
      metadata: { lessonTitle: sampleLessons[0].title, courseSlug: sampleCourses[0].slug, lessonId: "lesson-1" },
      createdAt: subHours(now, 1),
    },
    {
      id: "sample-4",
      type: "lesson_completed",
      metadata: { lessonTitle: sampleLessons[1].title, courseSlug: sampleCourses[0].slug, lessonId: "lesson-2" },
      createdAt: subHours(now, 1),
    },
    {
      id: "sample-5",
      type: "purchase_completed",
      metadata: { courseTitle: sampleCourses[1].title, courseSlug: sampleCourses[1].slug },
      createdAt: subDays(now, 1),
    },
    {
      id: "sample-6",
      type: "course_started",
      metadata: { courseTitle: sampleCourses[1].title, courseSlug: sampleCourses[1].slug },
      createdAt: subDays(now, 1),
    },
    {
      id: "sample-7",
      type: "review_created",
      metadata: { courseTitle: sampleCourses[0].title, courseSlug: sampleCourses[0].slug },
      createdAt: subDays(now, 2),
    },
    {
      id: "sample-8",
      type: "certificate_earned",
      metadata: { courseTitle: sampleCourses[0].title },
      createdAt: subDays(now, 3),
    },
  ];
};

function ActivitySkeleton() {
  return (
    <div className="space-y-8 pb-8">
      {[1, 2].map((group) => (
        <div key={group} className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((entry) => (
              <Card key={entry}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <Skeleton className="h-4 w-64" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ActivityPage() {
  const { isAdminPreview } = useAdminPreview();
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [isFiltering, startTransition] = useTransition();
  const [allActivityTypes, setAllActivityTypes] = useState<string[]>([]);
  const hasLoadedActivityRef = useRef(false);

  const fetchActivity = useCallback(async (showLoadingState: boolean) => {
    if (isAdminPreview) return; // Skip fetch for admin preview

    if (showLoadingState) {
      setLoading(true);
    }
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") {
        params.append("type", filter);
      }
      const response = await fetch(`/api/activity?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load activity");
      }
      const data = await response.json();
      setActivity(data.activity || []);

      // Collect all unique activity types on initial load
      if (!hasLoadedActivityRef.current && data.activity) {
        const types = Array.from(new Set(data.activity.map((a: ActivityEntry) => a.type))) as string[];
        setAllActivityTypes(types);
        hasLoadedActivityRef.current = true;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load activity. Please check your database connection.";
      setError(message);
      toast({
        title: "Failed to load activity",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filter, isAdminPreview]);

  useEffect(() => {
    if (isAdminPreview) {
      // Use sample data for admin preview
      const sampleData = getSampleActivityData();
      const types = Array.from(new Set(sampleData.map((entry) => entry.type))) as string[];
      const filtered = filter === "all" ? sampleData : sampleData.filter((entry) => entry.type === filter);
      setAllActivityTypes(types);
      setActivity(filtered);
      setLoading(false);
      hasLoadedActivityRef.current = true;
      return;
    }

    const shouldShowLoadingState = !hasLoadedActivityRef.current;
    if (shouldShowLoadingState) {
      void fetchActivity(true);
      return;
    }

    startTransition(() => {
      void fetchActivity(false);
    });
  }, [filter, isAdminPreview, fetchActivity, startTransition]);

  const handleFilterChange = (value: string) => {
    setFilter(value);
  };

  const handleClearFilter = () => {
    setFilter("all");
  };

  const groupByDate = (entries: ActivityEntry[]): ActivityGroup[] => {
    const groups: Record<string, ActivityEntry[]> = {};

    entries.forEach((entry) => {
      const date = format(new Date(entry.createdAt), "yyyy-MM-dd");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(entry);
    });

    return Object.entries(groups)
      .map(([date, entries]) => ({
        date,
        entries: entries.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  };

  const getActivityIcon = (type: string) => {
    const Icon = activityIcons[type] || activityIcons.default;
    return Icon;
  };

  const getActivityLabel = (type: string) => {
    return activityLabels[type] || type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getActivityDescription = (entry: ActivityEntry): string => {
    const metadata = entry.metadata || {};
    switch (entry.type) {
      case "purchase_completed":
        return metadata.courseTitle
          ? `Purchased "${metadata.courseTitle}"`
          : "Completed a purchase";
      case "lesson_completed":
        return metadata.lessonTitle
          ? `Completed "${metadata.lessonTitle}"`
          : "Completed a lesson";
      case "course_started":
        return metadata.courseTitle
          ? `Started "${metadata.courseTitle}"`
          : "Started a course";
      case "review_created":
        return metadata.courseTitle
          ? `Reviewed "${metadata.courseTitle}"`
          : "Created a review";
      case "certificate_earned":
        return metadata.courseTitle || metadata.pathTitle
          ? `Earned certificate for "${metadata.courseTitle || metadata.pathTitle}"`
          : "Earned a certificate";
      default:
        return "Activity recorded";
    }
  };

  const getActivityLink = (entry: ActivityEntry): string | null => {
    const metadata = entry.metadata || {};
    switch (entry.type) {
      case "purchase_completed":
      case "course_started":
        return metadata.courseSlug ? `/library/${metadata.courseSlug}` : null;
      case "lesson_completed":
        return metadata.courseSlug && metadata.lessonId
          ? `/library/${metadata.courseSlug}/lesson/${metadata.lessonId}`
          : null;
      case "review_created":
        return metadata.courseSlug ? `/courses/${metadata.courseSlug}` : null;
      default:
        return null;
    }
  };

  const groupedActivity = groupByDate(activity);
  const hasFilter = filter !== "all";

  if (loading) {
    return (
      <PageContainer className="space-y-6">
        <PageHeader
          title="Activity"
          description="Your learning activity and purchase history."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Activity" },
          ]}
        />
        <ContentRegion>
          <ActivitySkeleton />
        </ContentRegion>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Activity"
        description={
          isAdminPreview
            ? "Sample learning activity and purchase history."
            : "Your learning activity and purchase history."
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Activity" },
        ]}
      />

      <Toolbar className="justify-between gap-3">
        {isAdminPreview ? (
          <div className="flex items-start gap-2 rounded-[var(--radius-sm)] border bg-warning/10 px-3 py-2 text-xs text-warning-foreground">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <span>
              Sample activity mode is enabled for admin preview.
            </span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Track purchases, progress milestones, and certificate events.</p>
        )}

        {allActivityTypes.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {isFiltering ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-full min-w-48 sm:w-56">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activity</SelectItem>
                {allActivityTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getActivityLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasFilter ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearFilter}
                className="h-11 w-11"
                aria-label="Clear activity filter"
              >
                <X className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        ) : null}
      </Toolbar>

      <StatusRegion>
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.includes("Can't reach database server")
                ? "Unable to connect to the database. Please check your database connection settings or try again later."
                : error}
            </AlertDescription>
          </Alert>
        ) : null}

        {!error && isFiltering ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Filtering activity...
          </div>
        ) : null}

        {!error && !isFiltering && groupedActivity.length === 0 ? (
          <Card className="ui-surface">
            <CardContent className="py-12 text-center">
              <Activity className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                {hasFilter
                  ? "No activity matches your filter. Try selecting a different type."
                  : "No activity yet. Start learning or make a purchase to see activity here."}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {hasFilter ? (
                  <Button variant="outline" onClick={handleClearFilter}>
                    Clear filter
                  </Button>
                ) : (
                  <>
                    <Link href="/courses">
                      <Button variant="outline">Browse courses</Button>
                    </Link>
                    <Link href="/library">
                      <Button variant="premium">View library</Button>
                    </Link>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </StatusRegion>

      <ContentRegion>
        {!error && !isFiltering && groupedActivity.length > 0 ? (
          <section className="space-y-6">
            {groupedActivity.map((group) => (
              <article key={group.date} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">
                    {format(new Date(group.date), "EEEE, MMMM d, yyyy")}
                  </h2>
                </div>
                <div className="space-y-3">
                  {group.entries.map((entry) => {
                    const Icon = getActivityIcon(entry.type);
                    const link = getActivityLink(entry);
                    const content = (
                      <Card className="ui-surface supports-hover-card">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium">{getActivityLabel(entry.type)}</p>
                                <Badge variant="secondary" className="text-xs">
                                  {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{getActivityDescription(entry)}</p>
                              {entry.metadata && Object.keys(entry.metadata).length > 0 ? (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  {format(new Date(entry.createdAt), "h:mm a")}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );

                    return link ? (
                      <Link key={entry.id} href={link}>
                        {content}
                      </Link>
                    ) : (
                      <div key={entry.id}>{content}</div>
                    );
                  })}
                </div>
              </article>
            ))}
          </section>
        ) : null}
      </ContentRegion>
    </PageContainer>
  );
}
