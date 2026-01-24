import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Safe migration script that preserves existing content URLs
 * This migrates from the old schema (contentUrl/contentType in Lesson table)
 * to the new schema (LessonContent table)
 */
async function migrateLessonContentSafe() {
  console.log('🔄 Starting safe lesson content migration...\n');

  try {
    // First, check if the old columns exist by trying to query them
    const lessonsRaw = await prisma.$queryRaw<any[]>`
      SELECT 
        id, 
        title,
        "contentUrl",
        "contentType",
        "allowDownload"
      FROM "Lesson"
      WHERE "contentUrl" IS NOT NULL
      LIMIT 5
    `;

    console.log(`📊 Found ${lessonsRaw.length} lessons with old content URLs (sample)`);

    if (lessonsRaw.length === 0) {
      console.log('✅ No lessons with old contentUrl found. Migration may have already been completed.');
      console.log('   Checking LessonContent table...\n');
      
      const contentCount = await prisma.lessonContent.count();
      console.log(`📦 LessonContent records: ${contentCount}`);
      
      if (contentCount === 0) {
        console.log('⚠️  No content in LessonContent table. Content may need to be uploaded.');
      } else {
        console.log('✅ Content exists in LessonContent table. Migration appears complete.');
      }
      
      return;
    }

    // Get all lessons with content
    const allLessonsWithContent = await prisma.$queryRaw<any[]>`
      SELECT 
        id, 
        title,
        "contentUrl",
        "contentType",
        "allowDownload"
      FROM "Lesson"
      WHERE "contentUrl" IS NOT NULL
    `;

    console.log(`\n🔍 Total lessons to migrate: ${allLessonsWithContent.length}\n`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const lesson of allLessonsWithContent) {
      try {
        // Check if content already exists in new table
        const existingContent = await prisma.lessonContent.findFirst({
          where: { lessonId: lesson.id },
        });

        if (existingContent) {
          console.log(`⏭️  Skipped: "${lesson.title}" (content already exists)`);
          skippedCount++;
          continue;
        }

        // Migrate to new LessonContent table
        await prisma.lessonContent.create({
          data: {
            lessonId: lesson.id,
            contentType: lesson.contentType || 'video',
            contentUrl: lesson.contentUrl,
            title: 'Main Content',
            description: null,
            sortOrder: 0,
          },
        });

        console.log(`✅ Migrated: "${lesson.title}" (${lesson.contentType || 'video'})`);
        migratedCount++;
      } catch (error) {
        console.error(`❌ Error migrating "${lesson.title}":`, error);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Successfully migrated: ${migratedCount}`);
    console.log(`⏭️  Skipped (already exists): ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('='.repeat(60));

    if (migratedCount > 0) {
      console.log('\n✨ Migration completed successfully!');
      console.log('💡 Note: Old contentUrl columns still exist in Lesson table for safety.');
      console.log('   You can remove them with a migration after verifying everything works.');
    }

  } catch (error: any) {
    if (error.message?.includes('column') && error.message?.includes('does not exist')) {
      console.log('ℹ️  Old schema columns (contentUrl/contentType) do not exist in Lesson table.');
      console.log('   This means the migration has already been completed at the database level.');
      console.log('   Checking current state...\n');
      
      const contentCount = await prisma.lessonContent.count();
      const lessonCount = await prisma.lesson.count();
      
      console.log(`📦 Total lessons: ${lessonCount}`);
      console.log(`📦 LessonContent records: ${contentCount}`);
      
      if (contentCount === 0 && lessonCount > 0) {
        console.log('\n⚠️  WARNING: No content in LessonContent table but lessons exist.');
        console.log('   Content needs to be uploaded through the admin interface.');
      } else {
        console.log('\n✅ Schema is up to date.');
      }
    } else {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }
}

migrateLessonContentSafe()
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
