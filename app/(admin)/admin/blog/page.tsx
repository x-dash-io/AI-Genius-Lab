import { Suspense } from "react";
import { requireRole } from "@/lib/access";
import { getAllPosts } from "@/lib/admin/blog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Newspaper, Plus, Edit, Eye, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteBlogPostAction } from "@/app/actions/delete-actions";

export const dynamic = "force-dynamic";

async function BlogPostsList() {
  const posts = await getAllPosts();
  type BlogPost = (typeof posts)[number];
  type BlogTag = BlogPost["tags"][number];

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Newspaper className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            No blog posts yet. Create your first post to get started.
          </p>
          <Link href="/admin/blog/new">
            <Button variant="premium" size="lg">Create Post</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {posts.map((post: BlogPost) => (
        <Card key={post.id}>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
                  {post.tags.map((tag: BlogTag) => (
                    <Badge key={tag.id} variant="outline" className="text-[10px]">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex w-full flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end">
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
                <DeleteButton
                  id={post.id}
                  title={post.title}
                  onDelete={async (id) => {
                    "use server";
                    await deleteBlogPostAction(id);
                  }}
                />
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
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
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
        <Link href="/admin/blog/new" className="w-full sm:w-auto">
          <Button
            variant="premium"
            size="lg"
            className="w-full whitespace-normal rounded-xl text-center shadow-lg shadow-primary/20 sm:w-auto"
          >
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
