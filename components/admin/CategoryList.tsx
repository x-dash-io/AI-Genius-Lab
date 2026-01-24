"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, GripVertical, Loader2, Power } from "lucide-react";
import { toast } from "@/lib/toast";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { CategoryFormDialog } from "@/components/admin/CategoryFormDialog";
import * as LucideIcons from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sortOrder: number;
  isActive: boolean;
  courseCount: number;
  createdAt: Date;
  updatedAt: Date;
};

type CategoryListProps = {
  initialCategories: Category[];
};

export function CategoryList({ initialCategories }: CategoryListProps) {
  const router = useRouter();
  const { confirm } = useConfirmDialog();
  const [categories, setCategories] = useState(initialCategories);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleDelete = async (category: Category) => {
    const confirmed = await confirm({
      title: "Delete Category",
      description: category.courseCount > 0
        ? `This category has ${category.courseCount} course(s). It will be deactivated instead of deleted. Continue?`
        : "Are you sure you want to delete this category? This action cannot be undone.",
      confirmText: category.courseCount > 0 ? "Deactivate" : "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (!confirmed) return;

    setDeletingId(category.id);
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      const result = await response.json();

      toast({
        title: result.deleted ? "Category deleted" : "Category deactivated",
        description: result.deleted
          ? "Category has been permanently deleted."
          : `Category has been deactivated because it has ${result.courseCount} course(s).`,
        variant: "success",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to delete category",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (category: Category) => {
    setTogglingId(category.id);
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !category.isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle category status");
      }

      toast({
        title: "Status updated",
        description: `Category ${!category.isActive ? "activated" : "deactivated"} successfully.`,
        variant: "success",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to update status",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const getCategoryIcon = (iconName: string | null) => {
    if (!iconName) return null;
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="h-5 w-5" /> : null;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Categories</CardTitle>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No categories yet. Create your first category to get started.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Category
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => (
                <Card key={category.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Drag Handle */}
                      <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                        <GripVertical className="h-5 w-5" />
                      </div>

                      {/* Icon */}
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: category.color || "#6B7280" }}
                      >
                        <div className="text-white">
                          {getCategoryIcon(category.icon)}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-base">{category.name}</h3>
                          {category.isActive ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                          <Badge variant="outline">{category.courseCount} courses</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="font-mono text-xs">{category.slug}</span>
                          {category.description && (
                            <>
                              <span>•</span>
                              <span className="truncate">{category.description}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(category)}
                          disabled={togglingId === category.id}
                          title={category.isActive ? "Deactivate" : "Activate"}
                        >
                          {togglingId === category.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCategory(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category)}
                          disabled={deletingId === category.id}
                        >
                          {deletingId === category.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <CategoryFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setShowCreateDialog(false);
          router.refresh();
        }}
      />

      {/* Edit Dialog */}
      {editingCategory && (
        <CategoryFormDialog
          open={!!editingCategory}
          onOpenChange={(open) => !open && setEditingCategory(null)}
          category={editingCategory}
          onSuccess={() => {
            setEditingCategory(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
