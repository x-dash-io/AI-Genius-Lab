import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/access";
import { getAllBlogPosts } from "@/lib/blog";
import { BlogList } from "@/components/admin/BlogList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function AdminBlogPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !isAdmin(session.user.role)) {
    redirect("/admin");
  }

  const posts = await getAllBlogPosts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground">Manage your blog content</p>
        </div>
        <Link href="/admin/blog/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      <BlogList posts={posts} />
    </div>
  );
}
