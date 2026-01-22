import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function CourseDetailLoading() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-6 w-full max-w-2xl" />
      </div>
      <SkeletonCard />
      <div className="flex gap-4">
        <Skeleton className="h-11 w-48" />
        <Skeleton className="h-11 w-32" />
      </div>
      <SkeletonCard />
    </div>
  );
}
