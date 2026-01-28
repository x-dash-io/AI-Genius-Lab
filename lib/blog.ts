import { prisma, withRetry } from "@/lib/prisma";

export async function getPublishedPosts(options: { tag?: string; search?: string } = {}) {
  "use cache";
  const { tag, search } = options;

  return withRetry(async () => {
    try {
      return await prisma.blogPost.findMany({
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
    } catch (error: any) {
      // Handle missing BlogReview table or blogPostId column gracefully
      const isMissingColumnError =
        error.code === 'P2022' ||
        error.message?.includes("BlogReview") ||
        error.message?.includes("blogPostId") ||
        error.message?.includes("reviews");

      if (isMissingColumnError) {
        console.warn("[Blog] Database schema mismatch detected. Falling back to query without reviews.");
        const posts = await prisma.blogPost.findMany({
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
          },
          orderBy: { createdAt: "desc" },
        });

        // Return posts with a dummy reviews count to maintain type compatibility
        return posts.map(post => ({
          ...post,
          _count: { reviews: 0 }
        }));
      }

      throw error;
    }
  });
}

export async function getPostBySlug(slug: string) {
  "use cache";
  return withRetry(async () => {
    try {
      return await prisma.blogPost.findUnique({
        where: { slug },
        include: {
          tags: true,
          reviews: {
            include: {
              user: {
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
    } catch (error: any) {
      const isMissingColumnError =
        error.code === 'P2022' ||
        error.message?.includes("BlogReview") ||
        error.message?.includes("blogPostId") ||
        error.message?.includes("reviews");

      if (isMissingColumnError) {
        console.warn(`[Blog] Database schema mismatch for slug "${slug}". Falling back to query without reviews.`);
        const post = await prisma.blogPost.findUnique({
          where: { slug },
          include: {
            tags: true,
          },
        });

        if (!post) return null;

        return {
          ...post,
          reviews: []
        };
      }

      throw error;
    }
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
