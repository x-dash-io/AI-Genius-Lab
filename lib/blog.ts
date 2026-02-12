import { prisma, withRetry } from "@/lib/prisma";
import { estimateReadTime } from "@/lib/read-time";
import type { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";

type PublishedPostsOptions = { tag?: string; search?: string };

const getPublishedPostsCached = unstable_cache(
  async (tag?: string, search?: string) => {
    // Construct where clause dynamically to avoid empty objects in AND array
    const where: Prisma.BlogPostWhereInput = {
      status: "published",
    };

    if (tag) {
      where.tags = { some: { slug: tag } };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ];
    }

    return withRetry(async () => {
      return prisma.blogPost.findMany({
        where,
        include: {
          tags: true,
          _count: {
            select: { reviews: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    });
  },
  ["blog_posts"],
  { tags: ["blog_posts"] }
);

export async function getPublishedPosts(options: PublishedPostsOptions = {}) {
  return getPublishedPostsCached(options.tag, options.search);
}

export async function getPostBySlug(slug: string) {
  return withRetry(async () => {
    return prisma.blogPost.findUnique({
      where: { slug },
      include: {
        tags: true,
        reviews: {
          include: {
            User: {
              select: {
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  });
}

export async function getBlogTags() {
  return withRetry(async () => {
    return prisma.blogTag.findMany({
      orderBy: { name: "asc" },
    });
  });
}

export async function incrementPostViews(postId: string) {
  return withRetry(async () => {
    return prisma.blogPost.update({
      where: { id: postId },
      data: {
        views: { increment: 1 },
      },
    });
  });
}

export { estimateReadTime };
