import 'dotenv/config';
import { getSignedCloudinaryUrl } from '../lib/cloudinary';

console.log('🧪 Testing Signed URL Generation...\n');

// Test with one of the actual content URLs from the database
const testPublicId = 'synapze-content/cmkr62urr0001vkb12s3ccz6k-0/file_ol6fs5';
const resourceType = 'video';

console.log(`📦 Testing with:`);
console.log(`   Public ID: ${testPublicId}`);
console.log(`   Resource Type: ${resourceType}\n`);

const signedUrl = getSignedCloudinaryUrl(testPublicId, resourceType, {
  download: false,
});

if (signedUrl) {
  console.log('✅ Signed URL generated successfully!\n');
  console.log('🔗 URL:');
  console.log(signedUrl);
  console.log('\n📝 URL Details:');
  console.log(`   - Protocol: ${signedUrl.startsWith('https://') ? 'HTTPS ✅' : 'HTTP ⚠️'}`);
  console.log(`   - Has signature: ${signedUrl.includes('s--') ? 'YES ✅' : 'NO ❌'}`);
  console.log(`   - Type: ${signedUrl.includes('/upload/') ? 'upload ✅' : signedUrl.includes('/authenticated/') ? 'authenticated ⚠️' : 'unknown ❌'}`);
  console.log(`   - Expires: ${signedUrl.includes('e_at_') ? 'YES ✅' : 'NO ❌'}`);
  console.log('\n💡 This URL should work for customers who have purchased the course.');
  console.log('   It will expire in 10 minutes.');
} else {
  console.log('❌ Failed to generate signed URL');
  console.log('   Check the logs above for errors.');
}
