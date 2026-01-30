import { Suspense } from "react";
import { requireRole } from "@/lib/access";
import { getAllCategories } from "@/lib/admin/categories";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { CategoryList } from "@/components/admin/CategoryList";

async function CategoriesContent() {
  const categories = await getAllCategories();

  return (
    <div className="space-y-8">
      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overview</CardTitle>
          <CardDescription>
            {categories.length} categories total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">
                {categories.filter((c: any) => c.isActive).length}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Inactive</p>
              <p className="text-2xl font-bold">
                {categories.filter((c: any) => !c.isActive).length}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Courses</p>
              <p className="text-2xl font-bold">
                {categories.reduce((sum: number, c: any) => sum + c.courseCount, 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category List */}
      <CategoryList initialCategories={categories} />
    </div>
  );
}

export default async function AdminCategoriesPage() {
  await requireRole("admin");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Category Management
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
            Categories
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Manage course categories, icons, and organization.
          </p>
        </div>
      </div>

      <Suspense fallback={
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          </CardContent>
        </Card>
      }>
        <CategoriesContent />
      </Suspense>
    </div>
  );
}
