"use client";

import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

interface SortableCourseListProps {
  courses: PathCourse[];
  onReorder: (courseIds: string[]) => Promise<void>;
  onRemove: (courseId: string) => Promise<void>;
  isRemoving: Record<string, boolean>;
}

function SortableCourseItem({
  course,
  index,
  onRemove,
  isRemoving,
}: {
  course: PathCourse;
  index: number;
  onRemove: (courseId: string) => Promise<void>;
  isRemoving: Record<string, boolean>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: course.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing touch-none"
              >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{course.course.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Order: {course.sortOrder}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/admin/courses/${course.course.id}/edit`}>
                <Button variant="outline" size="sm">
                  View Course
                </Button>
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemove(course.courseId)}
                disabled={isRemoving[course.courseId]}
              >
                {isRemoving[course.courseId] ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function SortableCourseList({
  courses,
  onReorder,
  onRemove,
  isRemoving,
}: SortableCourseListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [items, setItems] = React.useState(courses);

  React.useEffect(() => {
    setItems(courses);
  }, [courses]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    // Update sort order in database
    const courseIds = newItems.map((item) => item.courseId);
    await onReorder(courseIds);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {items.map((course, index) => (
            <SortableCourseItem
              key={course.id}
              course={course}
              index={index}
              onRemove={onRemove}
              isRemoving={isRemoving}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
