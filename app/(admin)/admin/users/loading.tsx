import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";

export default function AdminUsersLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-6 w-96" />
      </div>
      <SkeletonTable rows={10} cols={4} />
    </div>
  );
}
