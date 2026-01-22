"use client";

import { useState } from "react";
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
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showAddSection, setShowAddSection] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState<string | null>(null);
  const [contentTypes, setContentTypes] = useState<Record<string, string>>({});
  const [contentUrls, setContentUrls] = useState<Record<string, string>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
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
          <form action={updateCourseAction} className="space-y-6">
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

            <Button type="submit">Save Course</Button>
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
                  action={addSectionAction}
                  onSubmit={() => setShowAddSection(false)}
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
                    <Button type="submit" size="sm">
                      Create Section
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddSection(false)}
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
                      <form
                        action={deleteSectionAction.bind(null, section.id, course.id)}
                        className="inline"
                      >
                        <Button type="submit" variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </form>
                    </div>
                  </div>
                </CardHeader>
                {expandedSections.has(section.id) && (
                  <CardContent>
                    {showAddLesson === section.id && (
                      <Card className="mb-4">
                        <CardContent className="pt-6">
                          <form
                            action={addLessonAction.bind(null, section.id)}
                            onSubmit={() => {
                              setShowAddLesson(null);
                              // Clear form state after submission
                              setContentTypes((prev) => {
                                const newTypes = { ...prev };
                                delete newTypes[section.id];
                                return newTypes;
                              });
                              setContentUrls((prev) => {
                                const newUrls = { ...prev };
                                delete newUrls[section.id];
                                return newUrls;
                              });
                              setUploadErrors((prev) => {
                                const newErrors = { ...prev };
                                delete newErrors[section.id];
                                return newErrors;
                              });
                            }}
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
                              <Button type="submit" size="sm">
                                Create Lesson
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
                          <form
                            action={deleteLessonAction.bind(null, lesson.id, course.id)}
                            className="inline"
                          >
                            <Button type="submit" variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </form>
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
