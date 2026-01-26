import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { getAllPublishedPosts } from "@/lib/blog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, PenTool, Star } from "lucide-react";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { BlogFilters } from "@/components/blog/BlogFilters";
import { BlogPageClient } from "@/components/blog/BlogPageClient";

export const metadata: Metadata = generateSEOMetadata({
  title: "Blog",
  description:
    "Stay updated with the latest insights on AI, machine learning, and educational technology. Expert tips, tutorials, and industry news.",
  keywords: ["AI blog", "machine learning articles", "tech education", "AI tutorials"],
});

interface BlogPageProps {
  searchParams: Promise<{ search?: string; category?: string; tag?: string; sort?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const allPosts = await getAllPublishedPosts();
  
  let posts = [...allPosts];

  // Apply search filter
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    posts = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt?.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower)
    );
  }

  // Apply category filter
  if (params.category) {
    posts = posts.filter((post) => post.category === params.category);
  }

  // Apply tag filter
  if (params.tag) {
    posts = posts.filter((post) => post.tags?.includes(params.tag!));
  }

  // Apply sorting
  if (params.sort) {
    switch (params.sort) {
      case "oldest":
        posts = posts.reverse();
        break;
      case "popular":
        posts = posts.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      // "newest" is the default
    }
  }

  const totalPosts = allPosts.length;
  const filteredCount = posts.length;
  const hasFilters = params.search || params.category || params.tag || params.sort;

  return (
    <BlogPageClient>
      <section className="grid gap-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Blog
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
            Insights & Tutorials
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            {hasFilters
              ? `Showing ${filteredCount} of ${totalPosts} articles`
              : "Stay updated with the latest insights on AI, machine learning, and educational technology."}
          </p>
        </div>

        {/* Filters */}
        <Suspense fallback={<div className="h-12 animate-pulse bg-muted rounded" />}>
          <BlogFilters />
        </Suspense>

        {/* Featured Post */}
        {!hasFilters && posts.length > 0 && posts[0].featured && (
          <Card className="overflow-hidden">
            <div className="md:grid md:grid-cols-2 gap-6">
              <div className="aspect-video md:aspect-auto bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <PenTool className="h-16 w-16 text-primary/30" />
              </div>
              <CardContent className="p-6 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary">Featured</Badge>
                  {posts[0].category && (
                    <Badge variant="outline">{posts[0].category}</Badge>
                  )}
                </div>
                <h2 className="text-2xl font-bold mb-2">{posts[0].title}</h2>
                <p className="text-muted-foreground mb-4 line-clamp-2">{posts[0].excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(posts[0].publishedAt || posts[0].createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {posts[0].readingTime || "5"} min read
                    </div>
                    {posts[0].ratingCount > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{posts[0].ratingAvg.toFixed(1)}</span>
                        <span>({posts[0].ratingCount})</span>
                      </div>
                    )}
                  </div>
                  <Link href={`/blog/${posts[0].slug}`}>
                    <Button>
                      Read More
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </div>
          </Card>
        )}

        {/* Blog Posts Grid */}
        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <PenTool className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {hasFilters
                  ? "No articles match your search criteria. Try adjusting your filters."
                  : "No articles available at the moment. Check back soon for new content!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Card key={post.id} className="group hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    {post.featured && <Badge variant="secondary">Featured</Badge>}
                    {post.category && <Badge variant="outline">{post.category}</Badge>}
                  </div>
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                    <Link href={`/blog/${post.slug}`} className="hover:underline">
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readingTime || "5"} min
                      </div>
                      {post.ratingCount > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{post.ratingAvg.toFixed(1)}</span>
                          <span className="text-xs">({post.ratingCount})</span>
                        </div>
                      )}
                    </div>
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="ghost" size="sm">
                        Read
                      </Button>
                    </Link>
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </BlogPageClient>
  );
}
