"use client";

import { useState, useEffect } from "react";
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
import { Plus, Trash2, ChevronDown, ChevronRight, Loader2, Edit } from "lucide-react";
import { toast } from "@/lib/toast";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import type { Course, Section, Lesson, LessonContent } from "@prisma/client";

type CourseWithSections = Course & {
  sections: (Section & {
    lessons: (Lesson & {
      contents: LessonContent[];
    })[];
  })[];
};

type CourseEditFormProps = {
  course: CourseWithSections;
  updateCourseAction: (formData: FormData) => Promise<{ success: boolean }>;
  addSectionAction: (formData: FormData) => Promise<Section & { lessons: Lesson[] }>;
  deleteSectionAction: (sectionId: string, courseId: string) => Promise<{ success: boolean }>;
  addLessonAction: (sectionId: string, formData: FormData) => Promise<Lesson>;
  deleteLessonAction: (lessonId: string, courseId: string) => Promise<{ success: boolean }>;
  updateLessonAction?: (lessonId: string, formData: FormData) => Promise<{ success: boolean }>;
};

export function CourseEditForm({
  course: initialCourse,
  updateCourseAction,
  addSectionAction,
  deleteSectionAction,
  addLessonAction,
  deleteLessonAction,
  updateLessonAction,
}: CourseEditFormProps) {
  const router = useRouter();
  const { confirm } = useConfirmDialog();
  const [course, setCourse] = useState(initialCourse);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showAddSection, setShowAddSection] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [lessonContents, setLessonContents] = useState<Record<string, Array<{
    id?: string;
    contentType: string;
    contentUrl?: string;
    title?: string;
    description?: string;
  }>>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [isSavingCourse, setIsSavingCourse] = useState(false);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [isDeletingSection, setIsDeletingSection] = useState<Record<string, boolean>>({});
  const [isAddingLesson, setIsAddingLesson] = useState<Record<string, boolean>>({});
  const [isDeletingLesson, setIsDeletingLesson] = useState<Record<string, boolean>>({});
  const [isUpdatingLesson, setIsUpdatingLesson] = useState<Record<string, boolean>>({});
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  // Load existing lesson content on mount and when course changes
  useEffect(() => {
    const initialContents: Record<string, Array<{
      id?: string;
      contentType: string;
      contentUrl?: string;
      title?: string;
      description?: string;
    }>> = {};

    course.Section.forEach(section => {
      (section.Lesson || []).forEach(lesson => {
        if (lesson.LessonContent && lesson.LessonContent.length > 0) {
          initialContents[lesson.id] = lesson.LessonContent.map(content => ({
            id: content.id,
            contentType: content.contentType,
            contentUrl: content.contentUrl || undefined,
            title: content.title || undefined,
            description: content.description || undefined,
          }));
        }
      });
    });

    setLessonContents(initialContents);
  }, [course]);

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
      setIsEditingCourse(false);
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
    
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    
    // Optimistic update - add temporary section
    const tempId = `temp_${Date.now()}`;
    const tempSection = {
      id: tempId,
      courseId: course.id,
      title,
      sortOrder: course.Section.length,
      createdAt: new Date(),
      updatedAt: new Date(),
      Lesson: [],
    };
    
    setCourse(prev => ({
      ...prev,
      Section: [...prev.Section, tempSection],
    }));
    
    try {
      const newSection = await addSectionAction(formData);
      
      // Replace temp section with real one
      setCourse(prev => ({
        ...prev,
        Section: prev.Section.map(s => s.id === tempId ? newSection : s),
      }));
      
      toast({
        title: "Section added",
        description: "New section has been added successfully.",
        variant: "success",
      });
      setShowAddSection(false);
      router.refresh();
    } catch (error) {
      // Remove temp section on error
      setCourse(prev => ({
        ...prev,
        Section: prev.Section.filter(s => s.id !== tempId),
      }));
      
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
    const confirmed = await confirm({
      title: "Delete Section",
      description: "Are you sure you want to delete this section? All lessons in this section will also be deleted. This action cannot be undone.",
      confirmText: "Delete Section",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (!confirmed) {
      return;
    }
    
    setIsDeletingSection((prev) => ({ ...prev, [sectionId]: true }));
    
    // Optimistic update - remove section
    const previousCourse = course;
    setCourse(prev => ({
      ...prev,
      Section: prev.Section.filter(s => s.id !== sectionId),
    }));
    
    try {
      await deleteSectionAction(sectionId, course.id);
      toast({
        title: "Section deleted",
        description: "Section has been deleted successfully.",
        variant: "success",
      });
      router.refresh();
    } catch (error) {
      // Revert on error
      setCourse(previousCourse);
      
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
    
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    
    // Optimistic update - add temporary lesson
    const tempId = `temp_${Date.now()}`;
    const section = course.Section.find(s => s.id === sectionId);
    const tempLesson = {
      id: tempId,
      sectionId,
      title,
      durationSeconds: null,
      isLocked: true,
      allowDownload: false,
      sortOrder: (section?.Lesson || []).length,
      createdAt: new Date(),
      updatedAt: new Date(),
      LessonContent: [],
    };
    
    setCourse(prev => ({
      ...prev,
      Section: prev.Section.map(s => 
        s.id === sectionId 
          ? { ...s, Lesson: [...s.Lesson, tempLesson] }
          : s
      ),
    }));
    
    try {
      const newLesson = await addLessonAction(sectionId, formData);
      
      // Replace temp lesson with real one
      setCourse(prev => ({
        ...prev,
        Section: prev.Section.map(s => 
          s.id === sectionId 
            ? { ...s, Lesson: s.Lesson.map(l => l.id === tempId ? { ...newLesson, LessonContent: [] } : l) }
            : s
        ),
      }));
      
      toast({
        title: "Lesson added",
        description: "New lesson has been added successfully.",
        variant: "success",
      });
      setShowAddLesson(null);
      setLessonContents(prev => {
        const next = { ...prev };
        delete next[sectionId];
        return next;
      });
      router.refresh();
    } catch (error) {
      // Remove temp lesson on error
      setCourse(prev => ({
        ...prev,
        Section: prev.Section.map(s => 
          s.id === sectionId 
            ? { ...s, Lesson: s.Lesson.filter(l => l.id !== tempId) }
            : s
        ),
      }));
      
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
    const confirmed = await confirm({
      title: "Delete Lesson",
      description: "Are you sure you want to delete this lesson? This action cannot be undone.",
      confirmText: "Delete Lesson",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (!confirmed) {
      return;
    }
    
    setIsDeletingLesson((prev) => ({ ...prev, [lessonId]: true }));
    
    // Optimistic update - remove lesson
    const previousCourse = course;
    setCourse(prev => ({
      ...prev,
      Section: prev.Section.map(s => ({
        ...s,
        Lesson: s.Lesson.filter(l => l.id !== lessonId),
      })),
    }));
    
    try {
      await deleteLessonAction(lessonId, course.id);
      toast({
        title: "Lesson deleted",
        description: "Lesson has been deleted successfully.",
        variant: "success",
      });
      router.refresh();
    } catch (error) {
      // Revert on error
      setCourse(previousCourse);
      
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

  const handleUpdateLesson = async (lessonId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!updateLessonAction) {
      toast({
        title: "Update not available",
        description: "Lesson update functionality is not available.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingLesson((prev) => ({ ...prev, [lessonId]: true }));
    try {
      const formData = new FormData(e.currentTarget);
      formData.append("courseId", course.id);
      await updateLessonAction(lessonId, formData);
      toast({
        title: "Lesson updated",
        description: "Lesson has been updated successfully.",
        variant: "success",
      });
      setEditingLesson(null);
      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to update lesson",
        description: error instanceof Error ? error.message : "Failed to update lesson",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingLesson((prev) => {
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Course Details</CardTitle>
              <CardDescription>Basic information about your course</CardDescription>
            </div>
            {!isEditingCourse && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditingCourse(true)}
              >
                Edit Course
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditingCourse ? (
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
                  pattern="[a-z0-9\-]+"
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
                <Select name="category" defaultValue={course.category || "none"} disabled={isLoadingCategories}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder={isLoadingCategories ? "Loading..." : "Select a category"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </SelectItem>
                    ))}
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

              <div className="flex gap-2">
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditingCourse(false)}
                  disabled={isSavingCourse}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Title</Label>
                    <p className="text-lg font-semibold">{course.title}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Slug</Label>
                    <p className="text-sm font-mono">{course.slug}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Price</Label>
                    <p className="text-lg font-semibold">${(course.priceCents / 100).toFixed(2)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                    <p className="text-sm">
                      {course.category ? course.category.replace(/^\w/, c => c.toUpperCase()).replace(/-/g, ' ') : 'No category'}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <div className="flex items-center gap-2">
                      {course.isPublished ? (
                        <Badge variant="default">Published</Badge>
                      ) : (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Inventory</Label>
                    <p className="text-sm">
                      {course.inventory !== null && course.inventory !== undefined ? `${course.inventory} units` : 'Unlimited'}
                    </p>
                  </div>
                </div>
              </div>

              {course.description && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="text-sm mt-1">{course.description}</p>
                </div>
              )}
            </div>
          )}
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
            {course.Section.map((section) => (
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
                      <Badge variant="secondary">{(section.Lesson || []).length} lessons</Badge>
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

                            {/* Lesson Content Management */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Label>Lesson Content</Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const contents = lessonContents[section.id] || [];
                                    setLessonContents(prev => ({
                                      ...prev,
                                      [section.id]: [...contents, {
                                        contentType: 'video',
                                        title: `Content ${contents.length + 1}`,
                                      }]
                                    }));
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Content
                                </Button>
                              </div>

                              {(lessonContents[section.id] || []).map((content, index) => (
                                <Card key={index} className="p-4">
                                  {/* Hidden inputs for form submission */}
                                  <input type="hidden" name={`content-${index}-type`} value={content.contentType} />
                                  <input type="hidden" name={`content-${index}-url`} value={content.contentUrl || ''} />
                                  <input type="hidden" name={`content-${index}-title`} value={content.title || ''} />

                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <Label className="text-sm font-medium">Content #{index + 1}</Label>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const contents = lessonContents[section.id] || [];
                                          setLessonContents(prev => ({
                                            ...prev,
                                            [section.id]: contents.filter((_, i) => i !== index)
                                          }));
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Content Type</Label>
                                        <Select
                                          value={content.contentType}
                                          onValueChange={(value) => {
                                            const contents = lessonContents[section.id] || [];
                                            const updated = [...contents];
                                            updated[index] = { ...updated[index], contentType: value };
                                            setLessonContents(prev => ({
                                              ...prev,
                                              [section.id]: updated
                                            }));
                                          }}
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
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
                                        <Label>Title (Optional)</Label>
                                        <Input
                                          value={content.title || ''}
                                          onChange={(e) => {
                                            const contents = lessonContents[section.id] || [];
                                            const updated = [...contents];
                                            updated[index] = { ...updated[index], title: e.target.value };
                                            setLessonContents(prev => ({
                                              ...prev,
                                              [section.id]: updated
                                            }));
                                          }}
                                          placeholder="e.g., Main Video"
                                        />
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <Label>Content {content.contentType === 'link' ? 'URL' : 'Upload'}</Label>
                                      {content.contentType === 'link' ? (
                                        <Input
                                          value={content.contentUrl || ''}
                                          onChange={(e) => {
                                            const contents = lessonContents[section.id] || [];
                                            const updated = [...contents];
                                            updated[index] = { ...updated[index], contentUrl: e.target.value };
                                            setLessonContents(prev => ({
                                              ...prev,
                                              [section.id]: updated
                                            }));
                                          }}
                                          placeholder="https://example.com/resource"
                                        />
                                      ) : (
                                        <ContentUpload
                                          sectionId={`${section.id}-${index}`}
                                          contentType={content.contentType}
                                          value={content.contentUrl || ''}
                                          onChange={(publicId) => {
                                            const contents = lessonContents[section.id] || [];
                                            const updated = [...contents];
                                            updated[index] = { ...updated[index], contentUrl: publicId };
                                            setLessonContents(prev => ({
                                              ...prev,
                                              [section.id]: updated
                                            }));
                                          }}
                                          onError={(error) =>
                                            setUploadErrors((prev) => ({ ...prev, [`${section.id}-${index}`]: error }))
                                          }
                                        />
                                      )}
                                      {uploadErrors[`${section.id}-${index}`] && (
                                        <p className="text-sm text-destructive">{uploadErrors[`${section.id}-${index}`]}</p>
                                      )}
                                    </div>
                                  </div>
                                </Card>
                              ))}

                              {(lessonContents[section.id] || []).length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed rounded-lg">
                                  No content added yet. Click "Add Content" to add video, PDF, or other materials.
                                </p>
                              )}
                            </div>

                            {/* Duration field - hidden for links since they're external URLs */}
                            {(() => {
                              const firstContent = (lessonContents[section.id] || [])[0];
                              const contentType = firstContent?.contentType || 'video';

                              // Don't show duration field for links
                              if (contentType === 'link') {
                                return null;
                              }

                              const getDurationLabel = () => {
                                switch (contentType) {
                                  case 'pdf':
                                    return 'Pages';
                                  case 'file':
                                    return 'File Size (MB)';
                                  case 'video':
                                  case 'audio':
                                  default:
                                    return 'Duration (seconds)';
                                }
                              };

                              const getDurationPlaceholder = () => {
                                switch (contentType) {
                                  case 'pdf':
                                    return '25';
                                  case 'file':
                                    return '5.2';
                                  case 'video':
                                  case 'audio':
                                  default:
                                    return '420';
                                }
                              };

                              return (
                                <div className="space-y-2">
                                  <Label htmlFor={`durationSeconds-${section.id}`}>{getDurationLabel()}</Label>
                                  <Input
                                    id={`durationSeconds-${section.id}`}
                                    name="durationSeconds"
                                    type="number"
                                    min="0"
                                    step={contentType === 'file' ? '0.1' : '1'}
                                    placeholder={getDurationPlaceholder()}
                                  />
                                </div>
                              );
                            })()}
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
                                onClick={() => {
                                  setShowAddLesson(null);
                                  setLessonContents(prev => {
                                    const next = { ...prev };
                                    delete next[section.id];
                                    return next;
                                  });
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </CardContent>
                      </Card>
                    )}

                    <div className="space-y-2">
                      {(section.Lesson || []).map((lesson) => (
                        <div key={lesson.id}>
                          {editingLesson === lesson.id ? (
                            <Card className="mb-4">
                              <CardContent className="pt-6">
                                <form
                                  onSubmit={(e) => handleUpdateLesson(lesson.id, e)}
                                  className="space-y-4"
                                >
                                  <input type="hidden" name="courseId" value={course.id} />
                                  <div className="space-y-2">
                                    <Label htmlFor={`lessonTitle-edit-${lesson.id}`}>Lesson Title *</Label>
                                    <Input
                                      id={`lessonTitle-edit-${lesson.id}`}
                                      name="title"
                                      defaultValue={lesson.title}
                                      required
                                    />
                                  </div>

                                  {/* Duration field - hidden for links since they're external URLs */}
                                  {(() => {
                                    const firstContent = (lessonContents[lesson.id] || [])[0];
                                    const contentType = firstContent?.contentType || lesson.LessonContent?.[0]?.contentType || 'video';

                                    // Don't show duration field for links
                                    if (contentType === 'link') {
                                      return null;
                                    }

                                    const getDurationLabel = () => {
                                      switch (contentType) {
                                        case 'pdf':
                                          return 'Pages';
                                        case 'file':
                                          return 'File Size (MB)';
                                        case 'video':
                                        case 'audio':
                                        default:
                                          return 'Duration (seconds)';
                                      }
                                    };

                                    const getDurationPlaceholder = () => {
                                      switch (contentType) {
                                        case 'pdf':
                                          return '25';
                                        case 'file':
                                          return '5.2';
                                        case 'video':
                                        case 'audio':
                                        default:
                                          return '420';
                                      }
                                    };

                                    const getStep = () => {
                                      return contentType === 'file' ? '0.1' : '1';
                                    };

                                    return (
                                      <div className="space-y-2">
                                        <Label htmlFor={`durationSeconds-edit-${lesson.id}`}>{getDurationLabel()}</Label>
                                        <Input
                                          id={`durationSeconds-edit-${lesson.id}`}
                                          name="durationSeconds"
                                          type="number"
                                          min="0"
                                          step={getStep()}
                                          placeholder={getDurationPlaceholder()}
                                          defaultValue={lesson.durationSeconds || ""}
                                        />
                                      </div>
                                    );
                                  })()}

                                  <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id={`isLocked-edit-${lesson.id}`}
                                        name="isLocked"
                                        defaultChecked={lesson.isLocked}
                                        className="h-4 w-4 rounded border-gray-300"
                                      />
                                      <Label htmlFor={`isLocked-edit-${lesson.id}`} className="cursor-pointer">
                                        Locked
                                      </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id={`allowDownload-edit-${lesson.id}`}
                                        name="allowDownload"
                                        defaultChecked={lesson.allowDownload}
                                        className="h-4 w-4 rounded border-gray-300"
                                      />
                                      <Label htmlFor={`allowDownload-edit-${lesson.id}`} className="cursor-pointer">
                                        Allow Download
                                      </Label>
                                    </div>
                                  </div>

                                  {/* Lesson Content Management */}
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <Label>Lesson Content</Label>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          const contents = lessonContents[lesson.id] || [];
                                          setLessonContents(prev => ({
                                            ...prev,
                                            [lesson.id]: [...contents, {
                                              contentType: 'video',
                                              title: `Content ${contents.length + 1}`,
                                            }]
                                          }));
                                        }}
                                      >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Content
                                      </Button>
                                    </div>

                                    {(lessonContents[lesson.id] || []).map((content, index) => (
                                      <Card key={index} className="p-4">
                                        <input type="hidden" name={`content-${index}-id`} value={content.id || ''} />
                                        <input type="hidden" name={`content-${index}-type`} value={content.contentType} />
                                        <input type="hidden" name={`content-${index}-url`} value={content.contentUrl || ''} />
                                        <input type="hidden" name={`content-${index}-title`} value={content.title || ''} />

                                        <div className="space-y-4">
                                          <div className="flex items-center justify-between">
                                            <Label className="text-sm font-medium">Content #{index + 1}</Label>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => {
                                                const contents = lessonContents[lesson.id] || [];
                                                setLessonContents(prev => ({
                                                  ...prev,
                                                  [lesson.id]: contents.filter((_, i) => i !== index)
                                                }));
                                              }}
                                            >
                                              <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                          </div>

                                          <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                              <Label>Content Type</Label>
                                              <Select
                                                value={content.contentType}
                                                onValueChange={(value) => {
                                                  const contents = lessonContents[lesson.id] || [];
                                                  const updated = [...contents];
                                                  updated[index] = { ...updated[index], contentType: value };
                                                  setLessonContents(prev => ({
                                                    ...prev,
                                                    [lesson.id]: updated
                                                  }));
                                                }}
                                              >
                                                <SelectTrigger>
                                                  <SelectValue />
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
                                              <Label>Title (Optional)</Label>
                                              <Input
                                                value={content.title || ''}
                                                onChange={(e) => {
                                                  const contents = lessonContents[lesson.id] || [];
                                                  const updated = [...contents];
                                                  updated[index] = { ...updated[index], title: e.target.value };
                                                  setLessonContents(prev => ({
                                                    ...prev,
                                                    [lesson.id]: updated
                                                  }));
                                                }}
                                                placeholder="e.g., Main Video"
                                              />
                                            </div>
                                          </div>

                                          <div className="space-y-2">
                                            <Label>Content {content.contentType === 'link' ? 'URL' : 'Upload'}</Label>
                                            {content.contentType === 'link' ? (
                                              <Input
                                                value={content.contentUrl || ''}
                                                onChange={(e) => {
                                                  const contents = lessonContents[lesson.id] || [];
                                                  const updated = [...contents];
                                                  updated[index] = { ...updated[index], contentUrl: e.target.value };
                                                  setLessonContents(prev => ({
                                                    ...prev,
                                                    [lesson.id]: updated
                                                  }));
                                                }}
                                                placeholder="https://example.com/resource"
                                              />
                                            ) : (
                                              <ContentUpload
                                                sectionId={`${lesson.id}-${index}`}
                                                contentType={content.contentType}
                                                value={content.contentUrl || ''}
                                                onChange={(publicId) => {
                                                  const contents = lessonContents[lesson.id] || [];
                                                  const updated = [...contents];
                                                  updated[index] = { ...updated[index], contentUrl: publicId };
                                                  setLessonContents(prev => ({
                                                    ...prev,
                                                    [lesson.id]: updated
                                                  }));
                                                }}
                                                onError={(error) =>
                                                  setUploadErrors((prev) => ({ ...prev, [`${lesson.id}-${index}`]: error }))
                                                }
                                              />
                                            )}
                                            {uploadErrors[`${lesson.id}-${index}`] && (
                                              <p className="text-sm text-destructive">{uploadErrors[`${lesson.id}-${index}`]}</p>
                                            )}
                                          </div>
                                        </div>
                                      </Card>
                                    ))}

                                    {(lessonContents[lesson.id] || []).length === 0 && (
                                      <p className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed rounded-lg">
                                        No content added yet. Click "Add Content" to add video, PDF, or other materials.
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex gap-2">
                                    <Button type="submit" size="sm" disabled={isUpdatingLesson[lesson.id]}>
                                      {isUpdatingLesson[lesson.id] ? (
                                        <>
                                          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                          Saving...
                                        </>
                                      ) : (
                                        "Save Lesson"
                                      )}
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setEditingLesson(null)}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </form>
                              </CardContent>
                            </Card>
                          ) : (
                            <div className="flex items-center justify-between rounded-lg border p-3">
                              <div className="flex-1">
                                <p className="font-medium">{lesson.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline">
                                    {lesson.LessonContent?.length || 0} content item{(lesson.LessonContent?.length || 0) !== 1 ? 's' : ''}
                                  </Badge>
                                  {lesson.durationSeconds && (
                                    <span className="text-xs text-muted-foreground">
                                      {(() => {
                                        const firstContent = lesson.LessonContent?.[0];
                                        const contentType = firstContent?.contentType || 'video';
                                        
                                        switch (contentType) {
                                          case 'pdf':
                                            return `${lesson.durationSeconds} pages`;
                                          case 'file':
                                            return `${lesson.durationSeconds.toFixed(1)} MB`;
                                          case 'video':
                                          case 'audio':
                                          default:
                                            return `${Math.floor(lesson.durationSeconds / 60)}m ${lesson.durationSeconds % 60}s`;
                                        }
                                      })()}
                                    </span>
                                  )}
                                  {lesson.isLocked && (
                                    <Badge variant="secondary">Locked</Badge>
                                  )}
                                  {!lesson.LessonContent || lesson.LessonContent.length === 0 || !lesson.LessonContent[0]?.contentUrl ? (
                                    <Badge variant="destructive">No Content</Badge>
                                  ) : null}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {updateLessonAction && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingLesson(lesson.id)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
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
                            </div>
                          )}
                        </div>
                      ))}
                      {(section.Lesson || []).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No lessons yet. Add your first lesson above.
                        </p>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}

            {course.Section.length === 0 && (
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
