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

async function diagnoseCloudinaryAccess() {
  console.log('🔍 Diagnosing Cloudinary Access Issues...\n');

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

  for (const lesson of lessons) {
    if (lesson.LessonContent.length === 0) continue;

    for (const content of lesson.LessonContent) {
      if (!content.contentUrl) continue;

      console.log('─'.repeat(70));
      console.log(`📖 Lesson: ${lesson.title}`);
      console.log(`   Course: ${lesson.Section.Course.title}`);
      console.log(`   Public ID: ${content.contentUrl}`);
      console.log(`   Type: ${content.contentType}`);

      try {
        // Determine resource type
        let resourceType: 'video' | 'raw' | 'image' = 'raw';
        if (content.contentType === 'video' || content.contentType === 'audio') {
          resourceType = 'video';
        } else if (content.contentType === 'pdf' || content.contentType === 'file') {
          resourceType = 'raw';
        }

        // Get resource details from Cloudinary
        const resource = await cloudinary.api.resource(content.contentUrl, {
          resource_type: resourceType,
        });

        console.log(`\n   📊 Cloudinary Details:`);
        console.log(`      ✅ Exists: YES`);
        console.log(`      🔐 Access Type: ${resource.type || 'unknown'}`);
        console.log(`      📦 Resource Type: ${resource.resource_type}`);
        console.log(`      📏 Size: ${(resource.bytes / 1024 / 1024).toFixed(2)} MB`);
        console.log(`      🔗 Format: ${resource.format}`);
        console.log(`      📅 Created: ${new Date(resource.created_at).toLocaleDateString()}`);

        // Check if access type is correct
        if (resource.type !== 'authenticated') {
          console.log(`\n   ⚠️  WARNING: Access type is "${resource.type}" but should be "authenticated"`);
          console.log(`      This will cause "Limited access" errors for customers!`);
          console.log(`      Solution: Re-upload this content through the admin interface.`);
        } else {
          console.log(`\n   ✅ Access type is correct (authenticated)`);
        }

        // Generate test signed URL
        const signedUrl = cloudinary.url(content.contentUrl, {
          secure: true,
          sign_url: true,
          type: 'authenticated',
          resource_type: resourceType,
          expires_at: Math.floor(Date.now() / 1000) + 60 * 10, // 10 minutes
        });

        console.log(`\n   🔗 Test Signed URL (expires in 10 min):`);
        console.log(`      ${signedUrl.substring(0, 100)}...`);

      } catch (error: any) {
        console.log(`\n   ❌ ERROR: ${error.message}`);
        if (error.http_code === 404) {
          console.log(`      File not found in Cloudinary!`);
        } else if (error.error?.message) {
          console.log(`      ${error.error.message}`);
        }
      }

      console.log('');
    }
  }

  console.log('='.repeat(70));
  console.log('\n💡 Summary:');
  console.log('   If any files show access type other than "authenticated",');
  console.log('   they need to be re-uploaded through the admin interface.');
  console.log('   Files with wrong access type will show "Limited access" errors.');
  console.log('='.repeat(70));
}

diagnoseCloudinaryAccess()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
