import { redirect } from "next/navigation";
import { requireRole } from "@/lib/access";
import { createCourse } from "@/lib/admin/courses";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

async function createCourseAction(formData: FormData) {
  "use server";
  await requireRole("admin");

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const priceCents = parseInt(formData.get("priceCents") as string) * 100;
  const isPublished = formData.get("isPublished") === "on";

  if (!title || !slug || !priceCents) {
    throw new Error("Missing required fields");
  }

  const course = await createCourse({
    title,
    slug,
    description: description || undefined,
    priceCents,
    isPublished,
  });

  redirect(`/admin/courses/${course.id}/edit`);
}

export default async function NewCoursePage() {
  await requireRole("admin");

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Link>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Create Course
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
          New Course
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Create a new course with sections and lessons.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>
            Basic information about your course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCourseAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., AI Foundations"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                name="slug"
                placeholder="e.g., ai-foundations"
                required
                pattern="[a-z0-9-]+"
                title="Lowercase letters, numbers, and hyphens only"
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue="">
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
                placeholder="129.00"
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter price in dollars (e.g., 129.00 for $129.00)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublished"
                name="isPublished"
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isPublished" className="cursor-pointer">
                Publish immediately
              </Label>
            </div>

            <div className="flex gap-4">
              <Button type="submit">Create Course</Button>
              <Link href="/admin/courses">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
