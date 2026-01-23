import { redirect } from "next/navigation";
import { requireRole } from "@/lib/access";
import { createLearningPath } from "@/lib/admin/learning-paths";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";

async function createLearningPathAction(formData: FormData) {
  "use server";
  await requireRole("admin");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  if (!title) {
    throw new Error("Title is required");
  }

  const path = await createLearningPath({
    title,
    description: description || undefined,
  });

  redirect(`/admin/learning-paths/${path.id}/edit`);
}

export default async function NewLearningPathPage() {
  await requireRole("admin");

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/learning-paths"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Learning Paths
        </Link>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Create Learning Path
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
          New Learning Path
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Learning Path Details</CardTitle>
          <CardDescription>
            Create a new learning path to organize courses in a structured sequence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createLearningPathAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Complete Web Development Path"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe what students will learn in this path..."
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <SubmitButton
                loadingText="Creating..."
                icon={<Plus className="h-4 w-4 mr-2" />}
              >
                Create Learning Path
              </SubmitButton>
              <Link href="/admin/learning-paths">
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
