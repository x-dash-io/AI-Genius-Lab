import { Suspense } from "react";
import { getPublishedPosts, getBlogTags } from "@/lib/blog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Newspaper, Calendar, Clock, Eye, Search, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { getSignedCloudinaryUrl } from "@/lib/cloudinary";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import BlogHero from "@/components/blog/BlogHero";

export const dynamic = "force-dynamic";

export const metadata = generateSEOMetadata({
  title: "Blog",
  description: "Explore the latest in AI, education, and technology with the AI Genius Lab blog.",
  url: "/blog",
});

interface BlogPageProps {
  searchParams: Promise<{ tag?: string; search?: string }>;
}

async function BlogContent({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const posts = await getPublishedPosts({ 
    tag: params.tag, 
    search: params.search 
  });
  const tags = await getBlogTags();
  type BlogPost = (typeof posts)[number];
  type BlogTag = (typeof tags)[number];

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 space-y-8 flex-shrink-0">
        <div>
          <h3 className="text-lg font-semibold mb-4">Search</h3>
          <form action="/blog" className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              name="search"
              placeholder="Search posts..."
              className="pl-9"
              defaultValue={params.search}
            />
          </form>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            <Link href="/blog">
              <Badge variant={!params.tag ? "default" : "outline"} className="cursor-pointer">
                All
              </Badge>
            </Link>
            {tags.map((tag: BlogTag) => (
              <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
                <Badge 
                  variant={params.tag === tag.slug ? "default" : "outline"}
                  className="cursor-pointer"
                >
                  {tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Newspaper className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No posts found matching your criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post: BlogPost) => {
              const imageUrl = post.featuredImage
                ? getSignedCloudinaryUrl(post.featuredImage, "image") || post.featuredImage || ""
                : "";

              return (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-all group flex flex-col">
                    <div className="aspect-video relative bg-muted overflow-hidden">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Newspaper className="h-12 w-12 text-muted-foreground/20" />
                        </div>
                      )}
                    </div>
                    <CardHeader className="flex-none">
                      <div className="flex gap-2 mb-2 flex-wrap">
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag.id} variant="secondary" className="text-[10px]">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                      <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">{post.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                        {post.excerpt || "Read more about this article..."}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4 pt-4 border-t">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(post.createdAt), "MMM d, yyyy")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readTimeMinutes} min read
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.views ?? 0}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  return (
    <>
      <BlogHero
        title="AI Genius Blog"
        subtitle="Explore the latest in AI, education, and technology."
      />

      <div className="px-5">
        <div className="space-y-8 max-w-7xl mx-auto">
          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          }>
            <BlogContent searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
