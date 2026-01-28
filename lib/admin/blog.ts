import { prisma, withRetry } from "@/lib/prisma";
import { estimateReadTime } from "../blog";

export async function getAllPosts() {
  return withRetry(async () => {
    try {
      return await prisma.blogPost.findMany({
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
        console.warn(`[Admin Blog] Database schema mismatch detected: ${errorMsg}. Falling back to minimal query.`);
        try {
          const posts = await prisma.blogPost.findMany({
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
        } catch (innerError) {
          const basicPosts = await prisma.blogPost.findMany({
            select: {
              id: true,
              title: true,
              slug: true,
            },
          });
          return basicPosts.map(post => ({
            ...post,
            content: "",
            excerpt: "",
            featuredImage: null,
            status: "draft",
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

export async function getPostForEdit(postId: string) {
  return withRetry(async () => {
    try {
      return await prisma.blogPost.findUnique({
        where: { id: postId },
        include: {
          tags: true,
        },
      });
    } catch (error: any) {
      const errorMsg = error.message || "";
      if (error.code === 'P2022' || errorMsg.includes("does not exist")) {
        try {
          return await prisma.blogPost.findUnique({
            where: { id: postId },
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
            }
          }).then(p => p ? {
            ...p,
            featuredImage: null,
            tags: [],
          } : null);
        } catch (innerError) {
          return prisma.blogPost.findUnique({
            where: { id: postId },
            select: {
              id: true,
              title: true,
              slug: true,
            }
          }).then(p => p ? {
            ...p,
            content: "",
            excerpt: "",
            featuredImage: null,
            status: "draft",
            authorName: "Admin",
            views: 0,
            readTimeMinutes: 0,
            tags: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          } : null);
        }
      }
      throw error;
    }
  });
}

export async function createPost(data: {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status?: "draft" | "published";
  tags?: string[];
}) {
  const readTimeMinutes = estimateReadTime(data.content);
  
  return withRetry(async () => {
    // Attempt to create with all fields, but be ready to omit featuredImage if it fails
    try {
      return await prisma.blogPost.create({
        data: {
          title: data.title,
          slug: data.slug,
          content: data.content,
          excerpt: data.excerpt,
          featuredImage: data.featuredImage,
          status: data.status || "draft",
          readTimeMinutes,
          tags: {
            connectOrCreate: data.tags?.map(tagName => ({
              where: { name: tagName },
              create: {
                name: tagName,
                slug: tagName.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "")
              }
            })) || []
          }
        },
      });
    } catch (error: any) {
      if (error.message?.includes("featuredImage") || error.code === 'P2022') {
        const { featuredImage, ...otherData } = data;
        // Try creating without featuredImage and potentially other missing columns
        try {
          return await prisma.blogPost.create({
            data: {
              ...otherData,
              status: data.status || "draft",
              readTimeMinutes,
              tags: {
                connectOrCreate: data.tags?.map(tagName => ({
                  where: { name: tagName },
                  create: {
                    name: tagName,
                    slug: tagName.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "")
                  }
                })) || []
              }
            } as any
          });
        } catch (innerError) {
          // Absolute fallback for create
          const { tags, ...basicData } = otherData;
          return prisma.blogPost.create({
            data: {
              title: basicData.title,
              slug: basicData.slug,
              content: basicData.content,
            } as any
          });
        }
      }
      throw error;
    }
  });
}

export async function updatePost(
  postId: string,
  data: {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    featuredImage?: string;
    status?: "draft" | "published";
    tags?: string[];
  }
) {
  const { tags, ...otherData } = data;
  const updateData: any = { ...otherData };
  
  if (data.content) {
    updateData.readTimeMinutes = estimateReadTime(data.content);
  }

  if (tags) {
    updateData.tags = {
      set: [], // Clear existing tags
      connectOrCreate: tags.map(tagName => ({
        where: { name: tagName },
        create: { 
          name: tagName,
          slug: tagName.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "")
        }
      }))
    };
  }

  return withRetry(async () => {
    try {
      return await prisma.blogPost.update({
        where: { id: postId },
        data: updateData as any,
      });
    } catch (error: any) {
      if (error.message?.includes("featuredImage") || error.code === 'P2022') {
        const { featuredImage, ...safeData } = updateData;
        return prisma.blogPost.update({
          where: { id: postId },
          data: safeData as any,
        });
      }
      throw error;
    }
  });
}

export async function deletePost(postId: string) {
  return withRetry(async () => {
    return prisma.blogPost.delete({
      where: { id: postId },
    });
  });
}

export async function getTags() {
  return withRetry(async () => {
    try {
      return await prisma.blogTag.findMany({
        orderBy: { name: "asc" },
      });
    } catch (error) {
      return [];
    }
  });
}
