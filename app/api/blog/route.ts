import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { sanitizeBlogContent, sanitizeText } from "@/lib/sanitize";
import { checkRateLimit, createStandardErrorResponse } from "@/lib/api-helpers";
import { z } from "zod";

const blogPostSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1),
  coverImage: z.string().url().optional(),
  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string().optional(),
    caption: z.string().optional(),
  })).optional(),
  author: z.string().max(100).optional(),
  category: z.string().max(50).optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
});

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        coverImage: true,
        publishedAt: true,
        updatedAt: true,
        createdAt: true,
        author: true,
        category: true,
        tags: true,
        featured: true,
        views: true,
        readingTime: true,
        published: true,
      },
    });

    // Sanitize content before returning
    const sanitizedPosts = posts.map(post => ({
      ...post,
      content: sanitizeBlogContent(post.content || ""),
      excerpt: post.excerpt ? sanitizeText(post.excerpt) : post.excerpt,
    }));

    return NextResponse.json(sanitizedPosts);
  } catch (error) {
    return createStandardErrorResponse(error, "Failed to fetch blog posts");
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await checkRateLimit(request, "api");
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json(
        {
          error: {
            message: "Unauthorized",
            code: "UNAUTHORIZED",
          },
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = blogPostSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            message: "Invalid request data",
            code: "VALIDATION_ERROR",
            details: validationResult.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      images,
      author,
      category,
      tags,
      featured,
      published,
    } = validationResult.data;

    // Check if slug is unique
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (existingPost) {
      return NextResponse.json(
        {
          error: {
            message: "A post with this slug already exists",
            code: "CONFLICT",
          },
        },
        { status: 409 }
      );
    }

    // Sanitize content before storing
    const sanitizedContent = sanitizeBlogContent(content);
    const sanitizedExcerpt = excerpt ? sanitizeText(excerpt) : excerpt;

    // Calculate reading time (simple estimation: 200 words per minute)
    const wordCount = sanitizedContent.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt: sanitizedExcerpt,
        content: sanitizedContent,
        coverImage,
        author,
        category,
        tags,
        featured,
        published,
        publishedAt: published ? new Date() : null,
        readingTime,
        images: images && images.length > 0 ? {
          create: images.map((img, index: number) => ({
            url: img.url,
            alt: img.alt ? sanitizeText(img.alt) : img.alt,
            caption: img.caption ? sanitizeText(img.caption) : img.caption,
            sortOrder: index,
          })),
        } : undefined,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return createStandardErrorResponse(error, "Failed to create blog post");
  }
}
