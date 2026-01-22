import { SkeletonList } from "@/components/ui/skeleton";

export default function ActivityLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-6 w-96" />
      </div>
      <SkeletonList count={10} />
    </div>
  );
}
