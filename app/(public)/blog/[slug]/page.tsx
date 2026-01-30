import { getPostBySlug, incrementPostViews } from "@/lib/blog";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Eye, User, ArrowLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSignedCloudinaryUrl } from "@/lib/cloudinary";
import { BlogReviewSection } from "@/components/blog/BlogReviewSection";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return generateSEOMetadata({ title: "Post Not Found" });
  }

  return generateSEOMetadata({
    title: post.title,
    description: post.excerpt || undefined,
    url: `/blog/${post.slug}`,
    type: "article",
    image: post.featuredImage ? getSignedCloudinaryUrl(post.featuredImage, "image") || undefined : undefined,
  });
}

async function BlogPostContent({ slug }: { slug: string }) {
  const post = await getPostBySlug(slug);

  if (!post || post.status !== "published") {
    notFound();
  }

  // Increment views
  await incrementPostViews(post.id);

  return (
    <article className="max-w-4xl mx-auto py-12">
      <Link href="/blog">
        <Button variant="ghost" size="sm" className="mb-8 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Button>
      </Link>

      <div className="space-y-4 mb-8">
        <div className="flex gap-2 flex-wrap">
          {post.tags.map((tag: any) => (
            <Badge key={tag.id} variant="secondary">{tag.name}</Badge>
          ))}
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap pt-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{post.authorName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(post.createdAt), "MMMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{post.readTimeMinutes} min read</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>{post.views + 1} views</span>
          </div>
        </div>
      </div>

      {post.featuredImage && (
        <div className="aspect-video relative rounded-2xl overflow-hidden mb-12 shadow-xl border bg-muted">
          <Image
            src={getSignedCloudinaryUrl(post.featuredImage, "image") || ""}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {post.excerpt && (
        <p className="text-xl text-muted-foreground leading-relaxed mb-12 font-medium italic border-l-4 pl-6 py-2 border-primary/30 bg-muted/30">
          {post.excerpt}
        </p>
      )}

      <div 
        className="prose prose-lg dark:prose-invert max-w-none prose-primary prose-headings:font-display prose-a:text-primary hover:prose-a:text-primary/80"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <BlogReviewSection postId={post.id} reviews={post.reviews} />
    </article>
  );
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    }>
      <BlogPostContent slug={slug} />
    </Suspense>
  );
}
