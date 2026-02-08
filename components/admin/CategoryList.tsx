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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState(false);

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

      // Optimistic update
      if (result.deleted) {
        setCategories(prev => prev.filter(c => c.id !== category.id));
      } else {
        setCategories(prev => prev.map(c =>
          c.id === category.id ? { ...c, isActive: false } : c
        ));
      }

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

    // Optimistic update
    const newStatus = !category.isActive;
    setCategories(prev => prev.map(c =>
      c.id === category.id ? { ...c, isActive: newStatus } : c
    ));

    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (!response.ok) {
        // Revert on error
        setCategories(prev => prev.map(c =>
          c.id === category.id ? { ...c, isActive: category.isActive } : c
        ));
        throw new Error("Failed to toggle category status");
      }

      const data = await response.json();
      const updatedCategory = data.category || data;

      // Update with server response
      setCategories(prev => prev.map(c =>
        c.id === category.id ? { ...c, ...updatedCategory, courseCount: c.courseCount } : c
      ));

      toast({
        title: "Status updated",
        description: `Category ${newStatus ? "activated" : "deactivated"} successfully.`,
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

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === index) return;

    const newCategories = [...categories];
    const draggedItem = newCategories[draggedIndex];

    // Remove from old position
    newCategories.splice(draggedIndex, 1);
    // Insert at new position
    newCategories.splice(index, 0, draggedItem);

    setCategories(newCategories);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;

    setDraggedIndex(null);
    setIsReordering(true);

    // Update sortOrder for all categories
    const reorderedCategories = categories.map((cat, index) => ({
      id: cat.id,
      sortOrder: index,
    }));

    try {
      const response = await fetch("/api/admin/categories/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: reorderedCategories }),
      });

      if (!response.ok) {
        throw new Error("Failed to reorder categories");
      }

      toast({
        title: "Order updated",
        description: "Categories have been reordered successfully.",
        variant: "success",
      });

      router.refresh();
    } catch (error) {
      // Revert to original order on error
      setCategories(initialCategories);
      toast({
        title: "Failed to reorder",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Categories</CardTitle>
            <Button onClick={() => setShowCreateDialog(true)} variant="premium" size="lg" className="rounded-xl shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" />
              Create Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                No categories yet. Use the button above to create your first category.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((category, index) => (
                <Card
                  key={category.id}
                  className={`overflow-hidden transition-all ${draggedIndex === index ? "opacity-50" : ""
                    } ${isReordering ? "pointer-events-none" : ""}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Drag Handle */}
                      <div
                        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
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
        onSuccess={(newCategory: any) => {
          if (newCategory) {
            // Optimistic update - add to list immediately
            setCategories(prev => [...prev, {
              id: newCategory.id,
              name: newCategory.name,
              slug: newCategory.slug,
              description: newCategory.description,
              icon: newCategory.icon,
              color: newCategory.color,
              sortOrder: newCategory.sortOrder || prev.length,
              isActive: newCategory.isActive ?? true,
              courseCount: newCategory.courseCount || 0,
              createdAt: newCategory.createdAt ? new Date(newCategory.createdAt) : new Date(),
              updatedAt: newCategory.updatedAt ? new Date(newCategory.updatedAt) : new Date(),
            }]);
          }
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
          onSuccess={(updatedCategory: any) => {
            if (updatedCategory) {
              // Optimistic update - update in list immediately
              setCategories(prev => prev.map(c =>
                c.id === updatedCategory.id
                  ? {
                    ...c,
                    name: updatedCategory.name,
                    slug: updatedCategory.slug,
                    description: updatedCategory.description,
                    icon: updatedCategory.icon,
                    color: updatedCategory.color,
                    isActive: updatedCategory.isActive ?? c.isActive,
                    courseCount: updatedCategory.courseCount ?? c.courseCount,
                    updatedAt: updatedCategory.updatedAt ? new Date(updatedCategory.updatedAt) : new Date(),
                  }
                  : c
              ));
            }
            setEditingCategory(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
