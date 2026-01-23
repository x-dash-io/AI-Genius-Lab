import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateLessonContent() {
  console.log('Starting lesson content migration...');

  // Get all lessons
  const lessons = await prisma.lesson.findMany({
    select: {
      id: true,
      title: true,
    },
  });

  console.log(`Found ${lessons.length} lessons to migrate`);

  for (const lesson of lessons) {
    // Check if lesson already has content
    const existingContent = await prisma.lessonContent.findMany({
      where: { lessonId: lesson.id },
    });

    if (existingContent.length === 0) {
      // Create default content for the lesson
      await prisma.lessonContent.create({
        data: {
          lessonId: lesson.id,
          contentType: 'video', // Default to video
          contentUrl: null, // No URL yet - content needs to be re-uploaded
          title: 'Main Content',
          sortOrder: 0,
        },
      });
      console.log(`Created default content for lesson: ${lesson.title}`);
    }
  }

  console.log('Lesson content migration completed!');
  console.log('Note: Existing content URLs were lost in the migration. Content will need to be re-uploaded through the admin interface.');
}

migrateLessonContent()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });