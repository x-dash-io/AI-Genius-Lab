import { Suspense } from "react";
import { requireRole } from "@/lib/access";
import { getAllPosts } from "@/lib/admin/blog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Newspaper, Plus, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import { format } from "date-fns";

async function BlogPostsList() {
  const posts = await getAllPosts();

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Newspaper className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            No blog posts yet. Create your first post to get started.
          </p>
          <Link href="/admin/blog/new">
            <Button variant="outline">Create Post</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {posts.map((post: any) => (
        <Card key={post.id}>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  {post.status === "published" ? (
                    <Badge variant="default">Published</Badge>
                  ) : (
                    <Badge variant="secondary">Draft</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground font-mono">
                  /{post.slug}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                  <span>{format(new Date(post.createdAt), "MMM d, yyyy")}</span>
                  <span>•</span>
                  <span>{post.views} views</span>
                  <span>•</span>
                  <span>{post._count.reviews} reviews</span>
                  <span>•</span>
                  <span>{post.readTimeMinutes} min read</span>
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {post.tags.map((tag: any) => (
                    <Badge key={tag.id} variant="outline" className="text-[10px]">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/blog/${post.slug}`} target="_blank">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/admin/blog/${post.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

export default async function AdminBlogPage() {
  await requireRole("admin");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Content Management
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
            Blog Posts
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Create and manage blog articles for your students.
          </p>
        </div>
        <Link href="/admin/blog/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        </Link>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }>
        <BlogPostsList />
      </Suspense>
    </div>
  );
}
