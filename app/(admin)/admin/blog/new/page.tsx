import { requireRole } from "@/lib/access";
import { BlogPostForm } from "@/components/admin/BlogPostForm";

export default async function NewBlogPostPage() {
  await requireRole("admin");

  return (
    <div className="max-w-5xl mx-auto">
      <BlogPostForm />
    </div>
  );
}
