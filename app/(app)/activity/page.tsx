"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Filter
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ActivityEntry {
  id: string;
  type: string;
  metadata: any;
  createdAt: Date;
}

interface ActivityGroup {
  date: string;
  entries: ActivityEntry[];
}

const activityIcons: Record<string, any> = {
  purchase_completed: ShoppingCart,
  lesson_completed: GraduationCap,
  course_started: BookOpen,
  review_created: Star,
  default: Activity,
};

const activityLabels: Record<string, string> = {
  purchase_completed: "Purchase Completed",
  lesson_completed: "Lesson Completed",
  course_started: "Course Started",
  review_created: "Review Created",
};

export default function ActivityPage() {
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchActivity();
  }, [filter]);

  const fetchActivity = async () => {
    setLoading(true);
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
    } catch (err: any) {
      setError(err?.message || "Failed to load activity. Please check your database connection.");
    } finally {
      setLoading(false);
    }
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
  const activityTypes = Array.from(new Set(activity.map((a) => a.type)));

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Activity</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Your learning activity and purchase history.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">Loading activity...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Activity</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Your learning activity and purchase history.
          </p>
        </div>
        {activityTypes.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activity</SelectItem>
                {activityTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getActivityLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.includes("Can't reach database server")
              ? "Unable to connect to the database. Please check your database connection settings or try again later."
              : error}
          </AlertDescription>
        </Alert>
      )}

      {!error && groupedActivity.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No activity yet. Start learning or make a purchase to see your activity here.
            </p>
            <div className="mt-4 flex gap-2 justify-center">
              <Link href="/courses">
                <Button variant="outline">Browse Courses</Button>
              </Link>
              <Link href="/library">
                <Button>View Library</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {!error && groupedActivity.length > 0 && (
        <div className="space-y-8">
          {groupedActivity.map((group) => (
            <div key={group.date} className="space-y-4">
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
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{getActivityLabel(entry.type)}</p>
                              <Badge variant="secondary" className="text-xs">
                                {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {getActivityDescription(entry)}
                            </p>
                            {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                              <div className="text-xs text-muted-foreground mt-2">
                                {format(new Date(entry.createdAt), "h:mm a")}
                              </div>
                            )}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
