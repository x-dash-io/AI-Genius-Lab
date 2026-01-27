import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPublishedPosts, incrementPostViews } from "@/lib/blog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, Clock, PenTool, Share2, Bookmark, Star, Image as ImageIcon } from "lucide-react";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { generateLearningPathSchema } from "@/lib/seo/schemas";
import { BlogPageClient } from "@/components/blog/BlogPageClient";
import { BlogContent } from "@/components/blog/BlogContent";
import { BlogReviewClient } from "@/components/blog/BlogReviewClient";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const posts = await getAllPublishedPosts();
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.warn("Could not generate static params for blog posts:", error);
    // Return empty array to let the page be dynamically generated
    return [];
  }
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return generateSEOMetadata({
      title: "Blog Post Not Found",
      noindex: true,
    });
  }

  return generateSEOMetadata({
    title: post.title,
    description: post.excerpt || `Read about ${post.title}`,
    keywords: post.tags || ["blog", "AI", "machine learning"],
    url: `/blog/${slug}`,
    type: "article",
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Increment view count
  await incrementPostViews(slug);

  // Get related posts
  const relatedPosts = await getAllPublishedPosts();
  const filteredRelated = relatedPosts
    .filter((p) => p.id !== post.id && (p.category === post.category || p.tags?.some((tag) => post.tags?.includes(tag))))
    .slice(0, 3);

  return (
    <BlogPageClient>
      <article className="grid gap-8 max-w-4xl">
        {/* Back Button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        {/* Article Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-2">
            {post.featured && <Badge variant="secondary">Featured</Badge>}
            {post.category && <Badge variant="outline">{post.category}</Badge>}
          </div>
          
          <h1 className="font-display text-4xl font-bold tracking-tight">
            {post.title}
          </h1>
          
          {post.excerpt && (
            <p className="text-xl text-muted-foreground">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readingTime || "5"} min read
            </div>
            {post.author && (
              <div>By {post.author}</div>
            )}
            {post.ratingCount > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{post.ratingAvg.toFixed(1)}</span>
                <span>({post.ratingCount})</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Bookmark className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </header>

        {/* Featured Image */}
        {post.coverImage && (
          <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Images Gallery */}
        {post.images && post.images.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Gallery
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {post.images.map((image) => (
                <Card key={image.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted">
                    <img
                      src={image.url}
                      alt={image.alt || "Blog image"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {(image.caption || image.alt) && (
                    <CardContent className="p-4">
                      {image.caption && (
                        <p className="text-sm text-muted-foreground">{image.caption}</p>
                      )}
                      {image.alt && !image.caption && (
                        <p className="text-xs text-muted-foreground italic">{image.alt}</p>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Article Content */}
        <Card>
          <CardContent className="p-8">
            <BlogContent content={post.content} />
          </CardContent>
        </Card>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <Separator />
        <BlogReviewClient
          postId={post.id}
          initialReviews={post.reviews || []}
          averageRating={post.ratingAvg}
          totalReviews={post.ratingCount}
        />

        {/* Related Posts */}
        {filteredRelated.length > 0 && (
          <div className="space-y-4">
            <Separator />
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">Related Articles</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredRelated.map((relatedPost) => (
                  <Card key={relatedPost.id} className="group hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        {relatedPost.category && (
                          <Badge variant="outline" className="text-xs">
                            {relatedPost.category}
                          </Badge>
                        )}
                        <h4 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                          <Link href={`/blog/${relatedPost.slug}`} className="hover:underline">
                            {relatedPost.title}
                          </Link>
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(relatedPost.publishedAt || relatedPost.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {relatedPost.readingTime || "5"} min
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </article>
    </BlogPageClient>
  );
}
