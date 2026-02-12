import { Suspense } from "react";
import { requireRole } from "@/lib/access";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

async function NewBlogContent() {
  await requireRole("admin");
  return <BlogPostForm />;
}

export default async function NewBlogPostPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }>
        <NewBlogContent />
      </Suspense>
    </div>
  );
}
