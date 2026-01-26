import Link from "next/link";
import { BlogPost } from "@/lib/blog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Eye, EyeOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

interface BlogListProps {
  posts: BlogPost[];
}

export function BlogList({ posts }: BlogListProps) {
  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No blog posts yet. Create your first post!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  {post.featured && <Badge variant="secondary">Featured</Badge>}
                  {post.published ? (
                    <Badge variant="default" className="bg-green-600">
                      Published
                    </Badge>
                  ) : (
                    <Badge variant="outline">Draft</Badge>
                  )}
                  {post.category && <Badge variant="outline">{post.category}</Badge>}
                </div>
                <CardTitle className="text-xl">{post.title}</CardTitle>
                {post.excerpt && (
                  <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/blog/${post.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/blog/${post.slug}`} target="_blank">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    {post.published ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Publish
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>Created {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                {post.publishedAt && (
                  <span>
                    Published {formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}
                  </span>
                )}
                {post.views !== null && <span>{post.views} views</span>}
                {post.readingTime && <span>{post.readingTime} min read</span>}
              </div>
              <div className="flex items-center gap-2">
                {post.tags?.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
