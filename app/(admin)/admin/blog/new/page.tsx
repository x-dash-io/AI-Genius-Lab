import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/access";
import { BlogForm } from "@/components/admin/BlogForm";

export default async function NewBlogPostPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !isAdmin(session.user.role)) {
    redirect("/admin");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Blog Post</h1>
        <p className="text-muted-foreground">Share your knowledge with the community</p>
      </div>

      <BlogForm />
    </div>
  );
}
