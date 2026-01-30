"use client";

import { CheckCircle2, PlayCircle, Circle, Clock } from "lucide-react";

interface Course {
  id: string;
  title: string;
  status: 'completed' | 'in-progress' | 'not-started';
}

interface PathProgressSectionProps {
  totalCourses: number;
  completedCount: number;
  inProgressCount: number;
  progressPercent: number;
  estimatedHours?: number;
  courses: Array<{ id: string; title: string; status: 'completed' | 'in-progress' | 'not-started' }>;
}

export function PathProgressSection({
  totalCourses,
  completedCount,
  inProgressCount,
  progressPercent,
  estimatedHours,
  courses,
}: PathProgressSectionProps) {
  const notStartedCount = totalCourses - completedCount - inProgressCount;
  const hoursRemaining = estimatedHours 
    ? Math.ceil((estimatedHours / totalCourses) * notStartedCount)
    : null;

  return (
    <section className="space-y-6">
      {/* Progress Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/70">Completed</p>
              <p className="text-2xl font-bold text-blue-600">{completedCount}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/70">In Progress</p>
              <p className="text-2xl font-bold text-amber-600">{inProgressCount}</p>
            </div>
            <PlayCircle className="h-8 w-8 text-amber-600 opacity-50" />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/70">Not Started</p>
              <p className="text-2xl font-bold text-gray-600">{notStartedCount}</p>
            </div>
            <Circle className="h-8 w-8 text-gray-600 opacity-50" />
          </div>
        </div>

        {hoursRemaining !== null && (
          <div className="rounded-lg border border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground/70">Est. Time Left</p>
                <p className="text-2xl font-bold text-purple-600">{hoursRemaining}h</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600 opacity-50" />
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Overall Progress</h3>
          <span className="text-sm font-medium text-foreground/70">{progressPercent}%</span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Course Breakdown */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Course Breakdown</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {courses.map((course) => (
            <div key={course.id} className="flex items-center gap-3 p-3 rounded-lg border border-muted-foreground/10 hover:bg-muted/50 transition-colors">
              {course.status === 'completed' && (
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              )}
              {course.status === 'in-progress' && (
                <PlayCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              )}
              {course.status === 'not-started' && (
                <Circle className="h-5 w-5 text-gray-600 flex-shrink-0" />
              )}
              <span className={`text-sm ${
                course.status === 'completed' ? 'text-foreground line-through opacity-60' : 'text-foreground'
              }`}>
                {course.title}
              </span>
              <span className="ml-auto text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground">
                {course.status === 'completed' && 'Completed'}
                {course.status === 'in-progress' && 'In Progress'}
                {course.status === 'not-started' && 'Not Started'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
