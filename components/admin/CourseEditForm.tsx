"use client";

import { useState } from "react";
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
import { Plus, Trash2, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";
import type { Course, Section, Lesson } from "@prisma/client";

type CourseWithSections = Course & {
  sections: (Section & {
    lessons: Lesson[];
  })[];
};

type CourseEditFormProps = {
  course: CourseWithSections;
  updateCourseAction: (formData: FormData) => Promise<void>;
  addSectionAction: (formData: FormData) => Promise<void>;
  deleteSectionAction: (sectionId: string, courseId: string) => Promise<void>;
  addLessonAction: (sectionId: string, formData: FormData) => Promise<void>;
  deleteLessonAction: (lessonId: string, courseId: string) => Promise<void>;
};

export function CourseEditForm({
  course,
  updateCourseAction,
  addSectionAction,
  deleteSectionAction,
  addLessonAction,
  deleteLessonAction,
}: CourseEditFormProps) {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showAddSection, setShowAddSection] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState<string | null>(null);
  const [contentTypes, setContentTypes] = useState<Record<string, string>>({});
  const [contentUrls, setContentUrls] = useState<Record<string, string>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [isSavingCourse, setIsSavingCourse] = useState(false);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [isDeletingSection, setIsDeletingSection] = useState<Record<string, boolean>>({});
  const [isAddingLesson, setIsAddingLesson] = useState<Record<string, boolean>>({});
  const [isDeletingLesson, setIsDeletingLesson] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleUpdateCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSavingCourse(true);
    try {
      const formData = new FormData(e.currentTarget);
      await updateCourseAction(formData);
      toast({
        title: "Course updated",
        description: "Course details have been saved successfully.",
        variant: "success",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update course",
        variant: "destructive",
      });
    } finally {
      setIsSavingCourse(false);
    }
  };

  const handleAddSection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAddingSection(true);
    try {
      const formData = new FormData(e.currentTarget);
      await addSectionAction(formData);
      toast({
        title: "Section added",
        description: "New section has been added successfully.",
        variant: "success",
      });
      setShowAddSection(false);
      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to add section",
        description: error instanceof Error ? error.message : "Failed to add section",
        variant: "destructive",
      });
    } finally {
      setIsAddingSection(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Are you sure you want to delete this section? All lessons in this section will also be deleted.")) {
      return;
    }
    setIsDeletingSection((prev) => ({ ...prev, [sectionId]: true }));
    try {
      await deleteSectionAction(sectionId, course.id);
      toast({
        title: "Section deleted",
        description: "Section has been deleted successfully.",
        variant: "success",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to delete section",
        description: error instanceof Error ? error.message : "Failed to delete section",
        variant: "destructive",
      });
    } finally {
      setIsDeletingSection((prev) => {
        const next = { ...prev };
        delete next[sectionId];
        return next;
      });
    }
  };

  const handleAddLesson = async (sectionId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAddingLesson((prev) => ({ ...prev, [sectionId]: true }));
    try {
      const formData = new FormData(e.currentTarget);
      await addLessonAction(sectionId, formData);
      toast({
        title: "Lesson added",
        description: "New lesson has been added successfully.",
        variant: "success",
      });
      setShowAddLesson(null);
      setContentTypes((prev) => {
        const next = { ...prev };
        delete next[sectionId];
        return next;
      });
      setContentUrls((prev) => {
        const next = { ...prev };
        delete next[sectionId];
        return next;
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to add lesson",
        description: error instanceof Error ? error.message : "Failed to add lesson",
        variant: "destructive",
      });
    } finally {
      setIsAddingLesson((prev) => {
        const next = { ...prev };
        delete next[sectionId];
        return next;
      });
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) {
      return;
    }
    setIsDeletingLesson((prev) => ({ ...prev, [lessonId]: true }));
    try {
      await deleteLessonAction(lessonId, course.id);
      toast({
        title: "Lesson deleted",
        description: "Lesson has been deleted successfully.",
        variant: "success",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to delete lesson",
        description: error instanceof Error ? error.message : "Failed to delete lesson",
        variant: "destructive",
      });
    } finally {
      setIsDeletingLesson((prev) => {
        const next = { ...prev };
        delete next[lessonId];
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Course Details */}
      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>Basic information about your course</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateCourse} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                defaultValue={course.title}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={course.slug}
                required
                pattern="[a-z0-9-]+"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                defaultValue={course.description || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={course.category || ""}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No category</SelectItem>
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
                defaultValue={(course.priceCents / 100).toFixed(2)}
                required
              />
            </div>
            <div>
              <Label htmlFor="inventory">Inventory</Label>
              <Input
                id="inventory"
                name="inventory"
                type="number"
                min="0"
                placeholder="Leave empty for unlimited"
                defaultValue={course.inventory ?? ""}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty for unlimited inventory. Set a number to limit available quantity.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublished"
                name="isPublished"
                defaultChecked={course.isPublished}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isPublished" className="cursor-pointer">
                Published
              </Label>
            </div>

            <Button type="submit" disabled={isSavingCourse}>
              {isSavingCourse ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Course"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Sections */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sections & Lessons</CardTitle>
              <CardDescription>
                Organize your course content into sections and lessons
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddSection(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Section
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddSection && (
            <Card className="mb-4">
              <CardContent className="pt-6">
                <form
                  onSubmit={handleAddSection}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="sectionTitle">Section Title *</Label>
                    <Input
                      id="sectionTitle"
                      name="title"
                      placeholder="e.g., Getting Started"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={isAddingSection}>
                      {isAddingSection ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Section"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddSection(false)}
                      disabled={isAddingSection}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {course.sections.map((section) => (
              <Card key={section.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {expandedSections.has(section.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      <Badge variant="secondary">{section.lessons.length} lessons</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Expand section if closed
                          if (!expandedSections.has(section.id)) {
                            setExpandedSections(new Set([...expandedSections, section.id]));
                          }
                          setShowAddLesson(section.id);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSection(section.id)}
                        disabled={isDeletingSection[section.id]}
                      >
                        {isDeletingSection[section.id] ? (
                          <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {expandedSections.has(section.id) && (
                  <CardContent>
                    {showAddLesson === section.id && (
                      <Card className="mb-4">
                        <CardContent className="pt-6">
                          <form
                            onSubmit={(e) => handleAddLesson(section.id, e)}
                            className="space-y-4"
                          >
                            <input type="hidden" name="courseId" value={course.id} />
                            <div className="space-y-2">
                              <Label htmlFor={`lessonTitle-${section.id}`}>Lesson Title *</Label>
                              <Input
                                id={`lessonTitle-${section.id}`}
                                name="title"
                                placeholder="e.g., Welcome to the Course"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`contentType-${section.id}`}>Content Type *</Label>
                              <input
                                type="hidden"
                                name="contentType"
                                value={contentTypes[section.id] || ""}
                                required
                              />
                              <Select
                                value={contentTypes[section.id] || ""}
                                onValueChange={(value) =>
                                  setContentTypes((prev) => ({ ...prev, [section.id]: value }))
                                }
                                required
                              >
                                <SelectTrigger id={`contentType-${section.id}`} className="w-full">
                                  <SelectValue placeholder="Select content type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="video">Video</SelectItem>
                                  <SelectItem value="audio">Audio</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="link">Link</SelectItem>
                                  <SelectItem value="file">File</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`contentUrl-${section.id}`}>Content</Label>
                              <input
                                type="hidden"
                                name="contentUrl"
                                value={contentUrls[section.id] || ""}
                              />
                              <ContentUpload
                                sectionId={section.id}
                                contentType={contentTypes[section.id] || "video"}
                                value={contentUrls[section.id] || ""}
                                onChange={(publicId) =>
                                  setContentUrls((prev) => ({ ...prev, [section.id]: publicId }))
                                }
                                onError={(error) =>
                                  setUploadErrors((prev) => ({ ...prev, [section.id]: error }))
                                }
                              />
                              {uploadErrors[section.id] && (
                                <p className="text-sm text-destructive">{uploadErrors[section.id]}</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`durationSeconds-${section.id}`}>Duration (seconds)</Label>
                              <Input
                                id={`durationSeconds-${section.id}`}
                                name="durationSeconds"
                                type="number"
                                min="0"
                                placeholder="420"
                              />
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`isLocked-${section.id}`}
                                  name="isLocked"
                                  defaultChecked
                                  className="h-4 w-4 rounded border-gray-300"
                                />
                                <Label htmlFor={`isLocked-${section.id}`} className="cursor-pointer">
                                  Locked
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`allowDownload-${section.id}`}
                                  name="allowDownload"
                                  className="h-4 w-4 rounded border-gray-300"
                                />
                                <Label htmlFor={`allowDownload-${section.id}`} className="cursor-pointer">
                                  Allow Download
                                </Label>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button type="submit" size="sm" disabled={isAddingLesson[section.id]}>
                                {isAddingLesson[section.id] ? (
                                  <>
                                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                    Creating...
                                  </>
                                ) : (
                                  "Create Lesson"
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setShowAddLesson(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </CardContent>
                      </Card>
                    )}

                    <div className="space-y-2">
                      {section.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{lesson.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{lesson.contentType}</Badge>
                              {lesson.durationSeconds && (
                                <span className="text-xs text-muted-foreground">
                                  {Math.floor(lesson.durationSeconds / 60)}m {lesson.durationSeconds % 60}s
                                </span>
                              )}
                              {lesson.isLocked && (
                                <Badge variant="secondary">Locked</Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLesson(lesson.id)}
                            disabled={isDeletingLesson[lesson.id]}
                          >
                            {isDeletingLesson[lesson.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        </div>
                      ))}
                      {section.lessons.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No lessons yet. Add your first lesson above.
                        </p>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}

            {course.sections.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No sections yet. Create your first section to get started.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
