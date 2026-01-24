import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkContent() {
  console.log('🔍 Checking lesson content...\n');

  const lessons = await prisma.lesson.findMany({
    include: {
      LessonContent: {
        orderBy: { sortOrder: 'asc' },
      },
      Section: {
        include: {
          Course: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  console.log(`📚 Total lessons: ${lessons.length}\n`);

  for (const lesson of lessons) {
    console.log('─'.repeat(60));
    console.log(`📖 Lesson: ${lesson.title}`);
    console.log(`   Course: ${lesson.Section.Course.title}`);
    console.log(`   Content items: ${lesson.LessonContent.length}`);
    
    if (lesson.LessonContent.length === 0) {
      console.log('   ⚠️  NO CONTENT - needs to be uploaded');
    } else {
      lesson.LessonContent.forEach((content, idx) => {
        console.log(`   ${idx + 1}. Type: ${content.contentType}`);
        console.log(`      URL: ${content.contentUrl || '(none)'}`);
        console.log(`      Title: ${content.title || '(none)'}`);
      });
    }
  }

  console.log('\n' + '='.repeat(60));
  
  const withContent = lessons.filter(l => l.LessonContent.length > 0 && l.LessonContent[0].contentUrl);
  const withoutContent = lessons.filter(l => l.LessonContent.length === 0 || !l.LessonContent[0].contentUrl);
  
  console.log(`✅ Lessons with content: ${withContent.length}`);
  console.log(`⚠️  Lessons without content: ${withoutContent.length}`);
  console.log('='.repeat(60));
}

checkContent()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
