import { prisma } from "./prisma";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  published: boolean;
  publishedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
  author: string | null;
  category: string | null;
  tags: string[] | null;
  featured: boolean;
  views: number | null;
  readingTime: number | null;
  ratingAvg: number;
  ratingCount: number;
  images?: BlogImage[];
  reviews?: BlogReview[];
}

export interface BlogImage {
  id: string;
  url: string;
  alt: string | null;
  caption: string | null;
  sortOrder: number;
}

export interface BlogReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export async function getAllPublishedPosts(): Promise<BlogPost[]> {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        published: true,
        publishedAt: {
          lte: new Date(),
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      include: {
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    return posts;
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const post = await prisma.blogPost.findUnique({
    where: {
      slug,
      published: true,
      publishedAt: {
        lte: new Date(),
      },
    },
    include: {
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return post;
}

export async function getPostsByCategory(category: string): Promise<BlogPost[]> {
  const posts = await prisma.blogPost.findMany({
    where: {
      category,
      published: true,
      publishedAt: {
        lte: new Date(),
      },
    },
    orderBy: {
      publishedAt: "desc",
    },
    include: {
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  });

  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];

  return posts;
}

export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  const posts = await prisma.blogPost.findMany({
    where: {
      tags: {
        has: tag,
      },
      published: true,
      publishedAt: {
        lte: new Date(),
      },
    },
    orderBy: {
      publishedAt: "desc",
    },
    include: {
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  });

  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];

  return posts;
}

export async function getFeaturedPosts(limit: number = 3): Promise<BlogPost[]> {
  const posts = await prisma.blogPost.findMany({
    where: {
      featured: true,
      published: true,
      publishedAt: {
        lte: new Date(),
      },
    },
    orderBy: {
      publishedAt: "desc",
    },
    take: limit,
    include: {
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  });

  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];

  return posts;
}

export async function incrementPostViews(slug: string): Promise<void> {
  await prisma.blogPost.update({
    where: { slug },
    data: {
      views: {
        increment: 1,
      },
    },
  });
}

export async function createBlogReview(
  postId: string,
  userId: string,
  rating: number,
  comment?: string
) {
  // Create or update the review
  const review = await prisma.blogReview.upsert({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
    update: {
      rating,
      comment,
    },
    create: {
      postId,
      userId,
      rating,
      comment,
    },
  });

  // Update the post's rating average and count
  const ratingStats = await prisma.blogReview.groupBy({
    by: ["postId"],
    where: { postId },
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
  });

  const stats = ratingStats[0];
  if (stats) {
    await prisma.blogPost.update({
      where: { id: postId },
      data: {
        ratingAvg: stats._avg.rating || 0,
        ratingCount: stats._count.rating,
      },
    });
  }

  return review;
}

export async function getBlogReviews(postId: string) {
  return await prisma.blogReview.findMany({
    where: { postId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getUserBlogReview(postId: string, userId: string) {
  return await prisma.blogReview.findUnique({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
}

export async function deleteBlogReview(postId: string, userId: string) {
  const deleted = await prisma.blogReview.delete({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
  });

  // Update the post's rating average and count
  const ratingStats = await prisma.blogReview.groupBy({
    by: ["postId"],
    where: { postId },
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
  });

  const stats = ratingStats[0];
  if (stats && stats._count.rating > 0) {
    await prisma.blogPost.update({
      where: { id: postId },
      data: {
        ratingAvg: stats._avg.rating || 0,
        ratingCount: stats._count.rating,
      },
    });
  } else {
    await prisma.blogPost.update({
      where: { id: postId },
      data: {
        ratingAvg: 0,
        ratingCount: 0,
      },
    });
  }

  return deleted;
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const posts = await prisma.blogPost.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  });

  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];

  return posts;
}
