import { prisma, withRetry } from "@/lib/prisma";

export async function getPublishedPosts(options: { tag?: string; search?: string } = {}) {
  "use cache";
  const { tag, search } = options;

  return withRetry(async () => {
    return prisma.blogPost.findMany({
      where: {
        status: "published",
        AND: [
          tag ? { tags: { some: { slug: tag } } } : {},
          search ? {
            OR: [
              { title: { contains: search } },
              { content: { contains: search } },
              { excerpt: { contains: search } },
            ],
          } : {},
        ],
      },
      include: {
        tags: true,
        _count: {
          select: { reviews: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  });
}

export async function getPostBySlug(slug: string) {
  "use cache";
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
  "use cache";
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

export function estimateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const noOfWords = content.split(/\s+/g).length;
  const minutes = noOfWords / wordsPerMinute;
  return Math.max(1, Math.ceil(minutes));
}
