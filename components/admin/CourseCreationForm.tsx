"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContentUpload } from "@/components/admin/ContentUpload";
import { Plus, Trash2, ChevronDown, ChevronUp, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "@/lib/toast";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { createCourse, createSection, updateSection, deleteSection, createLesson, updateLesson, deleteLesson } from "@/lib/admin/courses";
import { courseSchema, safeParse } from "@/lib/validation";
import type { Course, Section, Lesson } from "@prisma/client";

type CourseWithSections = Course & {
  sections: (Section & {
    lessons: Lesson[];
  })[];
};

async function createCourseAction(formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const priceCents = parseInt(formData.get("priceCents") as string) * 100;
  const inventoryStr = formData.get("inventory") as string;
  const inventory = inventoryStr && inventoryStr.trim() !== "" ? parseInt(inventoryStr) : null;
  const isPublished = formData.get("isPublished") === "on";

  if (!title || !slug || !priceCents) {
    throw new Error("Missing required fields");
  }

  const course = await createCourse({
    title,
    slug,
    description: description || undefined,
    category: category === "none" ? undefined : category || undefined,
    priceCents,
    inventory,
    isPublished,
  });

  return course;
}

async function addSectionAction(courseId: string, formData: FormData) {
  const title = formData.get("title") as string;

  // Mock getting course sections to find max sort order
  const maxSortOrder = 0; // For new courses, start with 0
  const section = await createSection(courseId, title, maxSortOrder + 1);

  return section;
}

async function deleteSectionAction(sectionId: string) {
  await deleteSection(sectionId);
}

async function addLessonAction(sectionId: string, formData: FormData) {
  const title = formData.get("title") as string;
  const durationSeconds = formData.get("durationSeconds") ? parseInt(formData.get("durationSeconds") as string) : undefined;
  const isLocked = formData.get("isLocked") === "on";
  const allowDownload = formData.get("allowDownload") === "on";

  const lesson = await createLesson({
    sectionId,
    title,
    durationSeconds,
    isLocked,
    allowDownload,
    sortOrder: 0, // Will be updated based on existing lessons
  });

  // Parse content data from form
  const contentData: Array<{ contentType: string; contentUrl?: string; title?: string }> = [];
  let contentIndex = 0;

  while (true) {
    const contentTypeKey = `content-${contentIndex}-type`;
    const contentUrlKey = `content-${contentIndex}-url`;
    const contentTitleKey = `content-${contentIndex}-title`;

    const contentType = formData.get(contentTypeKey);
    const contentUrl = formData.get(contentUrlKey);
    const contentTitle = formData.get(contentTitleKey);

    if (!contentType) break;

    contentData.push({
      contentType: contentType as string,
      contentUrl: contentUrl as string || undefined,
      title: contentTitle as string || undefined,
    });

    contentIndex++;
  }

  // Create lesson content items
  if (contentData.length > 0) {
    const { createLessonContent } = await import("@/lib/admin/courses");
    for (let i = 0; i < contentData.length; i++) {
      const content = contentData[i];
      await createLessonContent({
        lessonId: lesson.id,
        contentType: content.contentType as "video" | "audio" | "pdf" | "link" | "file",
        contentUrl: content.contentUrl,
        title: content.title,
        sortOrder: i,
      });
    }
  }

  return lesson;
}

async function deleteLessonAction(lessonId: string) {
  await deleteLesson(lessonId);
}

export function CourseCreationForm() {
  const router = useRouter();
  const { confirm } = useConfirmDialog();
  const [createdCourse, setCreatedCourse] = useState<CourseWithSections | null>(null);
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleCreateCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreatingCourse(true);

    const formData = new FormData(e.currentTarget);

    try {
      const course = await createCourseAction(formData);
      const courseWithSections: CourseWithSections = {
        ...course,
        sections: [],
      };

      setCreatedCourse(courseWithSections);
      setIsFormCollapsed(true);

      toast({
        title: "Course created successfully!",
        description: `"${course.title}" has been created and is ready for content.`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Failed to create course",
        description: error instanceof Error ? error.message : "Failed to create course",
        variant: "destructive",
      });
    } finally {
      setIsCreatingCourse(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Course Creation Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Course Details</CardTitle>
              <CardDescription>
                Basic information about your course
              </CardDescription>
            </div>
            {createdCourse && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsFormCollapsed(!isFormCollapsed)}
              >
                {isFormCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </CardHeader>

        {(!isFormCollapsed || !createdCourse) && (
          <CardContent>
            <form onSubmit={handleCreateCourse} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., AI Foundations"
                  required
                  disabled={isCreatingCourse}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  name="slug"
                  placeholder="e.g., ai-foundations"
                  required
                  pattern="[a-z0-9\-]+"
                  disabled={isCreatingCourse}
                />
                <p className="text-xs text-muted-foreground">
                  URL-friendly identifier (lowercase, numbers, hyphens only)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Course description..."
                  disabled={isCreatingCourse}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" disabled={isCreatingCourse}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    <SelectItem value="business">Make Money & Business</SelectItem>
                    <SelectItem value="content">Create Content & Video</SelectItem>
                    <SelectItem value="marketing">Marketing & Traffic</SelectItem>
                    <SelectItem value="apps">Build Apps & Tech</SelectItem>
                    <SelectItem value="productivity">Productivity & Tools</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceCents">Price (USD) *</Label>
                <Input
                  id="priceCents"
                  name="priceCents"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="129.00"
                  required
                  disabled={isCreatingCourse}
                />
                <p className="text-xs text-muted-foreground">
                  Enter price in dollars (e.g., 129.00 for $129.00)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inventory">Inventory</Label>
                <Input
                  id="inventory"
                  name="inventory"
                  type="number"
                  min="0"
                  placeholder="Leave empty for unlimited"
                  disabled={isCreatingCourse}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty for unlimited inventory. Set a number to limit available quantity.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  name="isPublished"
                  className="h-4 w-4 rounded border-gray-300"
                  disabled={isCreatingCourse}
                />
                <Label htmlFor="isPublished" className="cursor-pointer">
                  Publish immediately
                </Label>
              </div>

              <Button type="submit" disabled={isCreatingCourse}>
                {isCreatingCourse ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Course...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Course
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Created Course Display */}
      {createdCourse && (
        <>
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <CardTitle className="text-green-800">Course Created Successfully</CardTitle>
              </div>
              <CardDescription className="text-green-700">
                {createdCourse.title} - ${(createdCourse.priceCents / 100).toFixed(2)}
                {createdCourse.isPublished && (
                  <Badge variant="secondary" className="ml-2">Published</Badge>
                )}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>
                Your course has been created. You can now:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">Edit Course Details</h3>
                    <p className="text-sm text-muted-foreground">
                      Go to the course edit page to add sections, lessons, and content.
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push(`/admin/courses/${createdCourse.id}/edit`)}
                    variant="outline"
                  >
                    Edit Course
                  </Button>
                </div>

                <div className="flex items-center gap-2 p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">Create Another Course</h3>
                    <p className="text-sm text-muted-foreground">
                      Expand the form above to create another course.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setIsFormCollapsed(false);
                      setCreatedCourse(null);
                    }}
                    variant="outline"
                  >
                    New Course
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
