import { prisma } from '../lib/prisma';

async function clearHeroLogosSettings() {
  try {
    // Check if hero_logos setting exists
    const existingSetting = await prisma.siteSettings.findUnique({
      where: { key: 'hero_logos' }
    });

    if (existingSetting) {
      console.log('Found existing hero_logos setting:', JSON.stringify(existingSetting.value, null, 2));
      
      // Delete the existing setting to force using defaults
      await prisma.siteSettings.delete({
        where: { key: 'hero_logos' }
      });
      
      console.log('Deleted existing hero_logos setting - will now use defaults from lib/settings.ts');
    } else {
      console.log('No existing hero_logos setting found - will use defaults');
    }

    // Also check social_links
    const socialSetting = await prisma.siteSettings.findUnique({
      where: { key: 'social_links' }
    });

    if (socialSetting) {
      console.log('Found existing social_links setting');
    } else {
      console.log('No existing social_links setting found - will use defaults');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearHeroLogosSettings();
