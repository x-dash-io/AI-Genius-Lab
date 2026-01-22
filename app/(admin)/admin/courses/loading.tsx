import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";

export default function AdminCoursesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <SkeletonTable rows={10} cols={5} />
    </div>
  );
}
