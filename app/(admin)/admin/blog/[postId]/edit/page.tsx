import { requireRole } from "@/lib/access";
import { getPostForEdit } from "@/lib/admin/blog";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { notFound } from "next/navigation";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  await requireRole("admin");
  const { postId } = await params;
  const post = await getPostForEdit(postId);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <BlogPostForm initialData={post} />
    </div>
  );
}
