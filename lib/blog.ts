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
      const errorMsg = error.message || "";
      const isMissingColumnError = error.code === 'P2022' || errorMsg.includes("does not exist");

      if (isMissingColumnError) {
        console.warn(`[Blog] Database schema mismatch detected: ${errorMsg}. Falling back to minimal query.`);

        // Try a more restricted query
        try {
          const posts = await prisma.blogPost.findMany({
            where: {
              status: "published" as any,
              AND: [
                tag ? { tags: { some: { slug: tag } } } : {},
                search ? {
                  OR: [
                    { title: { contains: search } },
                    { content: { contains: search } },
                  ],
                } : {},
              ],
            },
            // Explicitly select all required fields except problematic ones if necessary
            // However, we'll try to select everything that is likely to exist
            select: {
              id: true,
              title: true,
              slug: true,
              content: true,
              excerpt: true,
              status: true,
              authorName: true,
              views: true,
              readTimeMinutes: true,
              createdAt: true,
              updatedAt: true,
              tags: true,
            },
            orderBy: { createdAt: "desc" },
          });

          return posts.map(post => ({
            ...post,
            featuredImage: null,
            _count: { reviews: 0 }
          }));
        } catch (innerError: any) {
          console.error("[Blog] Even minimal query failed:", innerError.message);
          // If even that fails, try the absolute most basic fields
          const basicPosts = await prisma.blogPost.findMany({
            select: {
              id: true,
              title: true,
              slug: true,
              content: true,
            },
            take: 20
          });
          return basicPosts.map(post => ({
            ...post,
            excerpt: "",
            featuredImage: null,
            status: "published",
            authorName: "Admin",
            views: 0,
            readTimeMinutes: 0,
            tags: [],
            _count: { reviews: 0 },
            createdAt: new Date(),
            updatedAt: new Date(),
          }));
        }
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
      const errorMsg = error.message || "";
      const isMissingColumnError = error.code === 'P2022' || errorMsg.includes("does not exist");

      if (isMissingColumnError) {
        console.warn(`[Blog] Database schema mismatch for slug "${slug}": ${errorMsg}. Falling back to minimal query.`);
        try {
          const post = await prisma.blogPost.findUnique({
            where: { slug },
            select: {
              id: true,
              title: true,
              slug: true,
              content: true,
              excerpt: true,
              status: true,
              authorName: true,
              views: true,
              readTimeMinutes: true,
              createdAt: true,
              updatedAt: true,
              tags: true,
            },
          });

          if (!post) return null;

          return {
            ...post,
            featuredImage: null,
            reviews: []
          };
        } catch (innerError) {
           // Super minimal fallback - MUST include all fields used in UI
           return prisma.blogPost.findUnique({
             where: { slug },
             select: {
               id: true,
               title: true,
               slug: true,
               content: true,
             }
           }).then(p => p ? {
             ...p,
             excerpt: "",
             featuredImage: null,
             status: "published",
             authorName: "Admin",
             views: 0,
             readTimeMinutes: 0,
             tags: [],
             reviews: [],
             createdAt: new Date(),
             updatedAt: new Date(),
           } : null);
        }
      }

      throw error;
    }
  });
}

export async function getBlogTags() {
  "use cache";
  return withRetry(async () => {
    try {
      return await prisma.blogTag.findMany({
        orderBy: { name: "asc" },
      });
    } catch (error) {
      console.warn("[Blog] Failed to fetch tags, returning empty array");
      return [];
    }
  });
}

export async function incrementPostViews(postId: string) {
  return withRetry(async () => {
    try {
      return await prisma.blogPost.update({
        where: { id: postId },
        data: {
          views: { increment: 1 },
        },
      });
    } catch (error) {
      console.warn(`[Blog] Failed to increment views for ${postId}`);
      return null;
    }
  });
}

export function estimateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const noOfWords = content.split(/\s+/g).length;
  const minutes = noOfWords / wordsPerMinute;
  return Math.max(1, Math.ceil(minutes));
}
