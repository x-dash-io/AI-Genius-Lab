import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function LearningPathDetailLoading() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-4 w-24 mb-4" />
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-6 w-full max-w-2xl" />
      </div>
      <SkeletonCard />
      <div>
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
      <SkeletonCard />
    </div>
  );
}
