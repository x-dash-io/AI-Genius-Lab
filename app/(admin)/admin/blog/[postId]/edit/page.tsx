import { Suspense } from "react";
import { requireRole } from "@/lib/access";
import { getPostForEdit } from "@/lib/admin/blog";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { notFound } from "next/navigation";
import { Loader2 } from "lucide-react";

async function EditBlogFormWrapper({ postId }: { postId: string }) {
  const post = await getPostForEdit(postId);

  if (!post) {
    notFound();
  }

  return <BlogPostForm initialData={post} />;
}

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  await requireRole("admin");
  const { postId } = await params;

  return (
    <div className="max-w-5xl mx-auto">
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }>
        <EditBlogFormWrapper postId={postId} />
      </Suspense>
    </div>
  );
}
