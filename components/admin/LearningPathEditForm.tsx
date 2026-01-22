"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, GripVertical } from "lucide-react";

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
  courses: PathCourse[];
}

interface LearningPathEditFormProps {
  path: LearningPath;
  availableCourses: Course[];
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: () => Promise<void>;
  addCourseAction: (formData: FormData) => Promise<void>;
  removeCourseAction: (courseId: string) => Promise<void>;
}

export function LearningPathEditForm({
  path,
  availableCourses,
  updateAction,
  deleteAction,
  addCourseAction,
  removeCourseAction,
}: LearningPathEditFormProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;

    const formData = new FormData();
    formData.set("courseId", selectedCourseId);
    await addCourseAction(formData);
    setSelectedCourseId("");
  };

  const handleDelete = async () => {
    if (showDeleteConfirm) {
      await deleteAction();
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
          <form action={updateAction} className="space-y-4">
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
              <Button type="submit">Update Path</Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
              >
                {showDeleteConfirm ? "Confirm Delete" : "Delete Path"}
              </Button>
              {showDeleteConfirm && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
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
              <Button type="submit" disabled={!selectedCourseId}>
                <Plus className="h-4 w-4 mr-2" />
                Add Course
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
              : `Drag to reorder (coming soon). Courses are displayed in order.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {path.courses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No courses in this path yet.
            </p>
          ) : (
            <div className="space-y-2">
              {path.courses.map((pathCourse, index) => (
                <div
                  key={pathCourse.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{pathCourse.course.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Order: {index + 1}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/courses/${pathCourse.course.id}/edit`}>
                      <Button variant="outline" size="sm">
                        View Course
                      </Button>
                    </Link>
                    <form action={removeCourseAction.bind(null, pathCourse.courseId)}>
                      <Button type="submit" variant="ghost" size="sm">
                        <X className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
