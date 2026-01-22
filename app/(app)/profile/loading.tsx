import { Skeleton, SkeletonCard, SkeletonForm } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-6 w-96" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <SkeletonCard />
        </div>
        <SkeletonCard />
      </div>
      <SkeletonCard />
    </div>
  );
}
