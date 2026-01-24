import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Fix Cloudinary access type for all content files
 * Changes from "upload" (public) to "authenticated" (signed URLs only)
 * This fixes the "Limited access" error customers are experiencing
 */
async function fixCloudinaryAccessType() {
  console.log('🔧 Fixing Cloudinary Access Types...\n');
  console.log('This will change all content files from "upload" to "authenticated" type.');
  console.log('This ensures content can only be accessed via signed URLs.\n');

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

  console.log(`📚 Found ${lessons.length} lessons to process...\n`);

  let fixedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const lesson of lessons) {
    if (lesson.LessonContent.length === 0) continue;

    for (const content of lesson.LessonContent) {
      if (!content.contentUrl) continue;

      console.log('─'.repeat(70));
      console.log(`📖 ${lesson.title}`);
      console.log(`   Public ID: ${content.contentUrl}`);

      try {
        // Determine resource type
        let resourceType: 'video' | 'raw' | 'image' = 'raw';
        if (content.contentType === 'video' || content.contentType === 'audio') {
          resourceType = 'video';
        } else if (content.contentType === 'pdf' || content.contentType === 'file') {
          resourceType = 'raw';
        }

        // Get current resource details
        const resource = await cloudinary.api.resource(content.contentUrl, {
          resource_type: resourceType,
        });

        console.log(`   Current type: ${resource.type}`);

        if (resource.type === 'authenticated') {
          console.log(`   ✅ Already authenticated - skipping`);
          skippedCount++;
          continue;
        }

        // Change access type to authenticated
        // Use update_access_mode to change from upload to authenticated
        console.log(`   🔄 Changing to authenticated...`);

        const result = await cloudinary.api.update(content.contentUrl, {
          resource_type: resourceType,
          type: 'upload', // Current type
          access_mode: 'authenticated', // New access mode
        });

        console.log(`   ✅ Successfully changed to authenticated`);
        fixedCount++;

      } catch (error: any) {
        console.log(`   ❌ ERROR: ${error.message}`);
        if (error.error?.message) {
          console.log(`      ${error.error.message}`);
        }
        errorCount++;
      }
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('📊 Migration Summary:');
  console.log('='.repeat(70));
  console.log(`✅ Successfully fixed: ${fixedCount}`);
  console.log(`⏭️  Already correct (skipped): ${skippedCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log('='.repeat(70));

  if (fixedCount > 0) {
    console.log('\n✨ Access types updated successfully!');
    console.log('   Customers should now be able to access purchased content.');
    console.log('   Test by logging in as a customer and accessing a lesson.');
  }

  if (errorCount > 0) {
    console.log('\n⚠️  Some files had errors. Check the output above for details.');
  }
}

fixCloudinaryAccessType()
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
