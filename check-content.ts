import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkContent() {
  console.log('🔍 Checking lesson content in database...\n');

  const lessons = await prisma.lesson.findMany({
    include: {
      contents: true,
      section: {
        include: {
          course: {
            select: {
              title: true,
              slug: true,
            }
          }
        }
      }
    },
    take: 10, // Check first 10 lessons
  });

  console.log(`Found ${lessons.length} lessons\n`);

  for (const lesson of lessons) {
    console.log(`📚 Lesson: ${lesson.title}`);
    console.log(`   Course: ${lesson.section.course.title}`);
    console.log(`   Locked: ${lesson.isLocked}`);
    
    if (lesson.contents.length === 0) {
      console.log(`   ⚠️  NO CONTENT RECORDS FOUND`);
      
      // Check if there's old data in lesson table
      const oldData = lesson as any;
      if (oldData.contentUrl) {
        console.log(`   ⚠️  OLD SCHEMA: contentUrl exists in lesson table`);
        console.log(`      Type: ${oldData.contentType}`);
        console.log(`      URL: ${oldData.contentUrl}`);
      }
    } else {
      console.log(`   ✅ ${lesson.contents.length} content record(s):`);
      lesson.contents.forEach((content, idx) => {
        console.log(`      ${idx + 1}. Type: ${content.contentType}`);
        console.log(`         URL: ${content.contentUrl || 'NULL'}`);
        console.log(`         Title: ${content.title || 'N/A'}`);
      });
    }
    console.log('');
  }

  // Check if any lessons have old schema data
  const rawLessons = await prisma.$queryRaw`
    SELECT id, title, 
           CASE 
             WHEN json_extract(json_object(), '$.contentUrl') IS NOT NULL 
             THEN 'HAS_OLD_DATA' 
             ELSE 'NO_OLD_DATA' 
           END as status
    FROM Lesson 
    LIMIT 5
  `;
  
  console.log('\n📊 Summary:');
  console.log(`   Total lessons checked: ${lessons.length}`);
  console.log(`   Lessons with content: ${lessons.filter(l => l.contents.length > 0).length}`);
  console.log(`   Lessons without content: ${lessons.filter(l => l.contents.length === 0).length}`);
}

checkContent()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
