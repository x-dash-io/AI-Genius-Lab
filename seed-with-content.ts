import { PrismaClient } from '@prisma/client';
import { hashPassword } from './lib/password';

const prisma = new PrismaClient();

async function main() {
  const hash = await hashPassword('admin123');
  
  // Create users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      name: 'Admin User',
      passwordHash: hash,
      role: 'admin'
    }
  });
  
  const customer = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      email: 'customer@test.com',
      name: 'Test Customer',
      passwordHash: hash,
      role: 'customer'
    }
  });
  
  console.log('✅ Users created');

  // Create a course with actual content
  const course = await prisma.course.upsert({
    where: { slug: 'introduction-to-debugging' },
    update: {},
    create: {
      slug: 'introduction-to-debugging',
      title: 'Introduction to Debugging Course',
      description: 'Learn the fundamentals of debugging and troubleshooting code effectively.',
      category: 'productivity',
      priceCents: 4900, // $49.00
      inventory: 100,
      isPublished: true,
    }
  });

  console.log('✅ Course created');

  // Create sections with lessons and content
  const section1 = await prisma.section.create({
    data: {
      courseId: course.id,
      title: 'Getting Started',
      sortOrder: 1,
    }
  });

  const lesson1 = await prisma.lesson.create({
    data: {
      sectionId: section1.id,
      title: 'Introduction to Debugging Course',
      durationSeconds: 300,
      isLocked: false,
      allowDownload: true,
      sortOrder: 1,
    }
  });

  // Add video content to lesson
  await prisma.lessonContent.create({
    data: {
      lessonId: lesson1.id,
      contentType: 'video',
      contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      title: 'Introduction Video',
      description: 'Welcome to the debugging course',
      sortOrder: 1,
    }
  });

  const lesson2 = await prisma.lesson.create({
    data: {
      sectionId: section1.id,
      title: 'Setting Up Your Environment',
      durationSeconds: 420,
      isLocked: false,
      allowDownload: false,
      sortOrder: 2,
    }
  });

  await prisma.lessonContent.create({
    data: {
      lessonId: lesson2.id,
      contentType: 'video',
      contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      title: 'Environment Setup',
      description: 'Learn how to set up your debugging environment',
      sortOrder: 1,
    }
  });

  console.log('✅ Section 1 with lessons and content created');

  const section2 = await prisma.section.create({
    data: {
      courseId: course.id,
      title: 'Core Debugging Techniques',
      sortOrder: 2,
    }
  });

  const lesson3 = await prisma.lesson.create({
    data: {
      sectionId: section2.id,
      title: 'Using Breakpoints',
      durationSeconds: 600,
      isLocked: false,
      allowDownload: false,
      sortOrder: 1,
    }
  });

  await prisma.lessonContent.create({
    data: {
      lessonId: lesson3.id,
      contentType: 'video',
      contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      title: 'Breakpoints Tutorial',
      description: 'Master the art of using breakpoints',
      sortOrder: 1,
    }
  });

  console.log('✅ Section 2 with lessons and content created');

  // Create a purchase and enrollment for the customer
  const purchase = await prisma.purchase.create({
    data: {
      userId: customer.id,
      courseId: course.id,
      amountCents: 4900,
      currency: 'usd',
      status: 'paid',
      provider: 'paypal',
      providerRef: 'test-payment-123',
    }
  });

  await prisma.enrollment.create({
    data: {
      userId: customer.id,
      courseId: course.id,
      purchaseId: purchase.id,
    }
  });

  console.log('✅ Purchase and enrollment created for customer');

  // Create some progress for the customer
  await prisma.progress.create({
    data: {
      userId: customer.id,
      lessonId: lesson1.id,
      startedAt: new Date(),
      completedAt: new Date(),
      lastPosition: 300,
      completionPercent: 100,
    }
  });

  await prisma.progress.create({
    data: {
      userId: customer.id,
      lessonId: lesson2.id,
      startedAt: new Date(),
      lastPosition: 150,
      completionPercent: 35,
    }
  });

  console.log('✅ Progress records created');

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('Test accounts:');
  console.log('  Admin: admin@test.com / admin123');
  console.log('  Customer: customer@test.com / admin123');
  console.log('\nThe customer has access to "Introduction to Debugging Course"');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
