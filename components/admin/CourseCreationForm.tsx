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
import { Plus, Trash2, ChevronDown, ChevronUp, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "@/lib/toast";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import type { Course, Section, Lesson, Category } from "@prisma/client";

type CourseWithSections = Course & {
  sections: (Section & {
    lessons: Lesson[];
  })[];
};

export function CourseCreationForm({
  createCourseAction,
}: {
  createCourseAction: (formData: FormData) => Promise<{ course?: Course; error?: string }>;
}) {
  const router = useRouter();
  const { confirm } = useConfirmDialog();
  const [createdCourse, setCreatedCourse] = useState<CourseWithSections | null>(null);
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({
          title: "Failed to load categories",
          description: "Using default categories",
          variant: "destructive",
        });
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreatingCourse(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await createCourseAction(formData);

      if (result.error) {
        toast({
          title: "Failed to create course",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      const course = result.course!;
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
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  disabled={isCreatingCourse}
                />
                <p className="text-xs text-muted-foreground">
                  Provide a URL for the course preview image.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" disabled={isCreatingCourse || isLoadingCategories}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select a category"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name}
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

              <div className="space-y-2">
                <Label htmlFor="tier">Course Tier</Label>
                <Select name="tier" defaultValue="STANDARD" disabled={isCreatingCourse}>
                  <SelectTrigger id="tier">
                    <SelectValue placeholder="Select a tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STANDARD">Standard (Starter+)</SelectItem>
                    <SelectItem value="PREMIUM">Premium (Pro+)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Standard courses are available to all subscribers. Premium courses require a Pro or Elite subscription.
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

              <Button type="submit" disabled={isCreatingCourse} variant="premium" size="lg">
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
          <Card className="border-green-600 dark:border-green-600 bg-green-100 dark:bg-green-900/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-700 dark:text-green-400" />
                <CardTitle className="text-green-800 dark:text-green-200">Course Created Successfully</CardTitle>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-green-800 dark:text-green-300 font-semibold">
                  {createdCourse.title} - ${(createdCourse.priceCents / 100).toFixed(2)}
                </span>
                {createdCourse.isPublished && (
                  <Badge variant="secondary" className="bg-green-100 text-green-900 border-green-300 dark:bg-green-800 dark:text-green-200 dark:border-green-600">Published</Badge>
                )}
              </div>
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
