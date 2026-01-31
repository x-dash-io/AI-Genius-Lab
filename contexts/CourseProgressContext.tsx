"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface LessonProgress {
  lessonId: string;
  completedAt: string | null;
  completionPercent: number;
  lastPosition: number;
}

interface CourseProgress {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  overallProgress: number;
  lessons: LessonProgress[];
  isCompleted: boolean;
}

interface CourseProgressContextType {
  progress: Map<string, CourseProgress>;
  updateProgress: (courseId: string, lessonId: string, progress: Partial<LessonProgress>) => void;
  refreshCourse: (courseId: string) => Promise<void>;
  isUpdating: boolean;
}

const CourseProgressContext = createContext<CourseProgressContextType | undefined>(undefined);

export function CourseProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Map<string, CourseProgress>>(new Map());
  const [isUpdating, setIsUpdating] = useState(false);

  const updateProgress = async (courseId: string, lessonId: string, progressUpdate: Partial<LessonProgress>) => {
    setIsUpdating(true);
    
    try {
      // Update local state immediately for responsiveness
      setProgress(prev => {
        const newMap = new Map(prev);
        const courseProgress = newMap.get(courseId);
        
        if (courseProgress) {
          const updatedLessons = courseProgress.lessons.map(lesson => 
            lesson.lessonId === lessonId 
              ? { ...lesson, ...progressUpdate }
              : lesson
          );
          
          const completedLessons = updatedLessons.filter(l => l.completedAt !== null).length;
          const overallProgress = courseProgress.totalLessons > 0 
            ? Math.round((completedLessons / courseProgress.totalLessons) * 100) 
            : 0;
          
          newMap.set(courseId, {
            ...courseProgress,
            lessons: updatedLessons,
            completedLessons,
            overallProgress,
            isCompleted: overallProgress === 100
          });
        }
        
        return newMap;
      });

      // Send progress update to server
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          ...progressUpdate
        })
      });

      if (!response.ok) {
        console.error('Failed to update progress on server');
        // Optionally revert local state on error
      }

      // Check if course was completed and trigger certificate generation
      const courseProgress = progress.get(courseId);
      if (courseProgress && courseProgress.isCompleted) {
        // Trigger certificate check
        await fetch('/api/certificates/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId })
        });
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const refreshCourse = async (courseId: string) => {
    setIsUpdating(true);
    
    try {
      const response = await fetch(`/api/courses/${courseId}/progress`);
      if (response.ok) {
        const courseData = await response.json();
        setProgress(prev => {
          const newMap = new Map(prev);
          newMap.set(courseId, courseData);
          return newMap;
        });
      }
    } catch (error) {
      console.error('Error refreshing course progress:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <CourseProgressContext.Provider value={{
      progress,
      updateProgress,
      refreshCourse,
      isUpdating
    }}>
      {children}
    </CourseProgressContext.Provider>
  );
}

export function useCourseProgress() {
  const context = useContext(CourseProgressContext);
  if (context === undefined) {
    throw new Error('useCourseProgress must be used within a CourseProgressProvider');
  }
  return context;
}
