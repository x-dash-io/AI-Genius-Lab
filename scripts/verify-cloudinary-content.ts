import { PrismaClient } from '@prisma/client';
import { checkCloudinaryResourceExists } from '../lib/cloudinary';

const prisma = new PrismaClient();

async function verifyCloudinaryContent() {
  console.log('🔍 Verifying Cloudinary content...\n');

  const lessons = await prisma.lesson.findMany({
    include: {
      LessonContent: true,
      Section: {
        include: {
          Course: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });

  console.log(`📚 Checking ${lessons.length} lessons...\n`);

  let existsCount = 0;
  let missingCount = 0;
  let noUrlCount = 0;

  for (const lesson of lessons) {
    console.log('─'.repeat(60));
    console.log(`📖 ${lesson.title}`);
    console.log(`   Course: ${lesson.Section.Course.title}`);

    if (lesson.LessonContent.length === 0) {
      console.log('   ⚠️  No content records');
      noUrlCount++;
      continue;
    }

    for (const content of lesson.LessonContent) {
      if (!content.contentUrl) {
        console.log(`   ⚠️  No URL for content: ${content.title || 'Untitled'}`);
        noUrlCount++;
        continue;
      }

      console.log(`   📦 Checking: ${content.contentUrl}`);
      
      try {
        // Determine resource type
        let resourceType: 'video' | 'raw' | 'image' = 'raw';
        if (content.contentType === 'video' || content.contentType === 'audio') {
          resourceType = 'video';
        } else if (content.contentType === 'pdf' || content.contentType === 'file') {
          resourceType = 'raw';
        }

        const exists = await checkCloudinaryResourceExists(content.contentUrl, resourceType);
        
        if (exists) {
          console.log(`   ✅ EXISTS in Cloudinary (${resourceType})`);
          existsCount++;
        } else {
          console.log(`   ❌ NOT FOUND in Cloudinary (${resourceType})`);
          missingCount++;
        }
      } catch (error: any) {
        console.log(`   ❌ ERROR checking: ${error.message}`);
        missingCount++;
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log('='.repeat(60));
  console.log(`✅ Content exists in Cloudinary: ${existsCount}`);
  console.log(`❌ Content missing from Cloudinary: ${missingCount}`);
  console.log(`⚠️  No URL in database: ${noUrlCount}`);
  console.log('='.repeat(60));

  if (missingCount > 0) {
    console.log('\n⚠️  Some content is missing from Cloudinary.');
    console.log('   This content needs to be re-uploaded through the admin interface.');
  } else if (existsCount > 0) {
    console.log('\n✅ All content with URLs exists in Cloudinary!');
  }
}

verifyCloudinaryContent()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
