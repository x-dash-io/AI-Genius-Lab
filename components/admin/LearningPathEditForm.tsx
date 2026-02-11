"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { toast } from "@/lib/toast";
import { SortableCourseList } from "@/components/admin/SortableCourseList";
import { LogoImageUpload } from "@/components/admin/LogoImageUpload";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  priceCents: number;
  isPublished: boolean;
}

interface PathCourse {
  id: string;
  courseId: string;
  sortOrder: number;
  course: {
    id: string;
    title: string;
    slug: string;
  };
}

interface LearningPath {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  courses: PathCourse[];
}

interface LearningPathEditFormProps {
  path: LearningPath;
  availableCourses: Course[];
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: () => Promise<void>;
  addCourseAction: (formData: FormData) => Promise<void>;
  removeCourseAction: (courseId: string) => Promise<void>;
  reorderCoursesAction: (courseIds: string[]) => Promise<void>;
}

export function LearningPathEditForm({
  path,
  availableCourses,
  updateAction,
  deleteAction,
  addCourseAction,
  removeCourseAction,
  reorderCoursesAction,
}: LearningPathEditFormProps) {
  const router = useRouter();
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [isRemovingCourse, setIsRemovingCourse] = useState<Record<string, boolean>>({});
  const [imageUrl, setImageUrl] = useState(path.imageUrl || "");

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const formData = new FormData(e.currentTarget);
      await updateAction(formData);
      toast({
        title: "Path updated",
        description: "Learning path has been updated successfully.",
        variant: "success",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update path",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;

    setIsAddingCourse(true);
    try {
      const formData = new FormData();
      formData.set("courseId", selectedCourseId);
      await addCourseAction(formData);
      toast({
        title: "Course added",
        description: "Course has been added to the learning path.",
        variant: "success",
      });
      setSelectedCourseId("");
      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to add course",
        description: error instanceof Error ? error.message : "Failed to add course",
        variant: "destructive",
      });
    } finally {
      setIsAddingCourse(false);
    }
  };

  const handleRemoveCourse = async (courseId: string) => {
    setIsRemovingCourse((prev) => ({ ...prev, [courseId]: true }));
    try {
      await removeCourseAction(courseId);
      toast({
        title: "Course removed",
        description: "Course has been removed from the learning path.",
        variant: "success",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to remove course",
        description: error instanceof Error ? error.message : "Failed to remove course",
        variant: "destructive",
      });
    } finally {
      setIsRemovingCourse((prev) => {
        const next = { ...prev };
        delete next[courseId];
        return next;
      });
    }
  };

  const handleReorderCourses = async (courseIds: string[]) => {
    try {
      await reorderCoursesAction(courseIds);
      toast({
        title: "Courses reordered",
        description: "Course order has been updated successfully.",
        variant: "success",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to reorder courses",
        description: error instanceof Error ? error.message : "Failed to reorder courses",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (showDeleteConfirm) {
      setIsDeleting(true);
      try {
        await deleteAction();
        toast({
          title: "Path deleted",
          description: "Learning path has been deleted successfully.",
          variant: "success",
        });
        router.push("/admin/learning-paths");
      } catch (error) {
        toast({
          title: "Failed to delete path",
          description: error instanceof Error ? error.message : "Failed to delete path",
          variant: "destructive",
        });
        setIsDeleting(false);
        setShowDeleteConfirm(false);
      }
    } else {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Path Details */}
      <Card>
        <CardHeader>
          <CardTitle>Path Details</CardTitle>
          <CardDescription>Update learning path information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Cover Image</Label>
              <input type="hidden" name="imageUrl" value={imageUrl} />
              <LogoImageUpload
                value={imageUrl}
                onChange={setImageUrl}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                defaultValue={path.title}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={path.description || ""}
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isUpdating} variant="premium" size="lg">
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Path"
                )}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : showDeleteConfirm ? (
                  "Confirm Delete"
                ) : (
                  "Delete Path"
                )}
              </Button>
              {showDeleteConfirm && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isUpdating}
                  size="lg"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Add Course */}
      {availableCourses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Add Course</CardTitle>
            <CardDescription>Add a course to this learning path</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCourse} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="courseId">Select Course</Label>
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                  <SelectTrigger id="courseId" className="w-full">
                    <SelectValue placeholder="Choose a course to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                        {!course.isPublished && (
                          <span className="text-muted-foreground ml-2">(Unpublished)</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={!selectedCourseId || isAddingCourse}>
                {isAddingCourse ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Course
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Courses in Path */}
      <Card>
        <CardHeader>
          <CardTitle>Courses in Path</CardTitle>
          <CardDescription>
            {path.courses.length === 0
              ? "No courses added yet. Add courses above to build your learning path."
              : `Drag courses to reorder them. Courses are displayed in the order shown below.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {path.courses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No courses in this path yet.
            </p>
          ) : (
            <SortableCourseList
              courses={path.courses}
              onReorder={handleReorderCourses}
              onRemove={handleRemoveCourse}
              isRemoving={isRemovingCourse}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
