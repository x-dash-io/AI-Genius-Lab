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
}

export async function getAllPublishedPosts(): Promise<BlogPost[]> {
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
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      coverImage: true,
      published: true,
      publishedAt: true,
      updatedAt: true,
      createdAt: true,
      author: true,
      category: true,
      tags: true,
      featured: true,
      views: true,
      readingTime: true,
    },
  });

  return posts;
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
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      coverImage: true,
      published: true,
      publishedAt: true,
      updatedAt: true,
      createdAt: true,
      author: true,
      category: true,
      tags: true,
      featured: true,
      views: true,
      readingTime: true,
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
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      coverImage: true,
      published: true,
      publishedAt: true,
      updatedAt: true,
      createdAt: true,
      author: true,
      category: true,
      tags: true,
      featured: true,
      views: true,
      readingTime: true,
    },
  });

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
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      coverImage: true,
      published: true,
      publishedAt: true,
      updatedAt: true,
      createdAt: true,
      author: true,
      category: true,
      tags: true,
      featured: true,
      views: true,
      readingTime: true,
    },
  });

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
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      coverImage: true,
      published: true,
      publishedAt: true,
      updatedAt: true,
      createdAt: true,
      author: true,
      category: true,
      tags: true,
      featured: true,
      views: true,
      readingTime: true,
    },
  });

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

export async function getAllBlogPosts(): Promise<BlogPost[]> {
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

  return posts;
}
