import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-6 w-96" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
