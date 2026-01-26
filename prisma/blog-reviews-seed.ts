import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sampleReviews = [
  {
    postId: "sample-post-1", // Replace with actual post IDs
    userId: "user-1", // Replace with actual user IDs
    rating: 5,
    comment: "Excellent article! Very well explained and comprehensive.",
  },
  {
    postId: "sample-post-1",
    userId: "user-2",
    rating: 4,
    comment: "Great content, helped me understand the concepts better.",
  },
  {
    postId: "sample-post-2",
    userId: "user-1",
    rating: 5,
    comment: "This is exactly what I was looking for. Thank you!",
  },
  {
    postId: "sample-post-3",
    userId: "user-3",
    rating: 4,
    comment: "Good tutorial, but could use more examples.",
  },
  {
    postId: "sample-post-4",
    userId: "user-2",
    rating: 5,
    comment: "Amazing insights! Looking forward to more articles like this.",
  },
];

async function seedBlogReviews() {
  console.log("🌱 Seeding blog reviews...");

  // Get all blog posts and users
  const posts = await prisma.blogPost.findMany({
    select: { id: true },
  });
  
  const users = await prisma.user.findMany({
    select: { id: true },
  });

  if (posts.length === 0 || users.length === 0) {
    console.log("❌ No posts or users found. Please seed them first.");
    return;
  }

  // Create sample reviews for each post
  for (const post of posts) {
    const numReviews = Math.floor(Math.random() * 5) + 1; // 1-5 reviews per post
    
    for (let i = 0; i < numReviews; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars
      
      await prisma.blogReview.create({
        data: {
          postId: post.id,
          userId: randomUser.id,
          rating,
          comment: getRandomComment(rating),
        },
      });
    }
  }

  // Update rating averages
  const ratingStats = await prisma.blogReview.groupBy({
    by: ["postId"],
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
  });

  for (const stat of ratingStats) {
    await prisma.blogPost.update({
      where: { id: stat.postId },
      data: {
        ratingAvg: stat._avg.rating || 0,
        ratingCount: stat._count.rating,
      },
    });
  }

  console.log("✅ Blog reviews seeded successfully!");
}

function getRandomComment(rating: number): string {
  const excellentComments = [
    "Excellent article! Very well explained and comprehensive.",
    "This is exactly what I was looking for. Thank you!",
    "Amazing insights! Looking forward to more articles like this.",
    "Perfect! This helped me understand everything clearly.",
    "Outstanding content! Keep up the great work.",
  ];

  const goodComments = [
    "Great content, helped me understand the concepts better.",
    "Good tutorial with clear explanations.",
    "Very helpful article, thank you for sharing.",
    "Nice work! The examples were really useful.",
    "Good read, learned something new today.",
  ];

  return rating === 5 
    ? excellentComments[Math.floor(Math.random() * excellentComments.length)]
    : goodComments[Math.floor(Math.random() * goodComments.length)];
}

seedBlogReviews()
  .catch((e) => {
    console.error("❌ Error seeding blog reviews:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
