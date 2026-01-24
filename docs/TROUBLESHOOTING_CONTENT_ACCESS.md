# Content Access Troubleshooting Guide

## Quick Diagnosis

### Using the Diagnostic Endpoints

1. **Check if a user has access to a course:**

```bash
curl -X POST http://localhost:3000/api/debug/access-check \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID_HERE","courseId":"COURSE_ID_HERE"}'
```

**Response should show:**
- ✅ `purchase.status: "paid"` - User has paid
- ✅ `enrollment` exists - Access was granted after payment
- ✅ `lessonsWithContent` have `hasContentUrl: true` - Content is linked

**If something is missing:**
- No purchase → User never bought the course
- Purchase status = "pending" → Webhook hasn't run yet (check PayPal webhook logs)
- No enrollment → Webhook didn't create the enrollment record

2. **Check if content exists in Cloudinary:**

```bash
curl -X POST http://localhost:3000/api/debug/content-check \
  -H "Content-Type: application/json" \
  -d '{"courseId":"COURSE_ID_HERE"}'
```

**Response shows:**
- Which lessons have missing content
- Which Cloudinary public IDs don't exist
- Summary of total missing items

### Using the Bash Script

```bash
./scripts/diagnose-access.sh USER_ID COURSE_ID
```

Example:
```bash
./scripts/diagnose-access.sh clh1234567 clh7654321
```

## Common Issues & Fixes

### Issue 1: "Purchase Status is Pending"

**Symptom**: `purchase.status: "pending"` (not "paid")

**Root Cause**: PayPal webhook has not run

**Solution Steps**:

1. **Check PayPal Webhook Configuration**:
   - Log into PayPal Dashboard
   - Navigate to: Settings > Notifications > Webhooks
   - Verify webhook URL is correct:
     - Production: `https://yourdomain.com/api/webhooks/paypal`
     - Sandbox: `https://yoursandboxdomain.com/api/webhooks/paypal`
   - Verify event types include: `PAYMENT.CAPTURE.COMPLETED`

2. **Check Webhook Logs**:
   - Look in your application logs for `[WEBHOOK]` prefix logs
   - Check for errors like:
     - "Invalid signature" → PayPal credentials mismatch
     - "Purchase not found" → Order ID doesn't exist in database
     - "Enrollment failed" → Database connection issue

3. **Test Webhook Manually**:

```bash
# Get a valid PayPal order ID from the database
psql -c "SELECT id, providerRef FROM \"Purchase\" WHERE status = 'pending' LIMIT 1;"

# Use that providerRef in the test
curl -X POST http://localhost:3000/api/webhooks/paypal \
  -H "Content-Type: application/json" \
  -H "paypal-transmission-id: test-1" \
  -H "paypal-transmission-time: 2024-01-24T15:00:00Z" \
  -H "paypal-transmission-sig: test" \
  -H "paypal-cert-url: test" \
  -H "paypal-auth-algo: SHA256withRSA" \
  -d '{
    "event_type":"PAYMENT.CAPTURE.COMPLETED",
    "resource":{
      "id":"test-id",
      "supplementary_data":{
        "related_ids":{"order_id":"PROVIDER_REF_HERE"}
      }
    }
  }'
```

4. **Check Network/Firewall**:
   - Verify PayPal can reach your webhook endpoint
   - Use online tools like Webhook.cool to test delivery
   - Check firewall rules allow POST to `/api/webhooks/paypal`

### Issue 2: "No Enrollment Record"

**Symptom**: 
- `purchase.status: "paid"` ✅
- But `enrollment: null` ❌

**Root Cause**: Webhook created purchase but failed on enrollment

**Solution Steps**:

1. **Check application logs** for errors after "Updating purchase ... to paid status"
2. **Manually create the enrollment**:

```sql
INSERT INTO "Enrollment" (id, "userId", "courseId", "purchaseId", "grantedAt")
VALUES (gen_random_uuid(), 'USER_ID', 'COURSE_ID', 'PURCHASE_ID', NOW())
ON CONFLICT ("userId", "courseId") DO UPDATE SET "purchaseId" = 'PURCHASE_ID';
```

3. **Test user can now access**: Reload the page or use `/api/debug/access-check` again

### Issue 3: "Lessons Have No Content URLs"

**Symptom**:
- `purchase.status: "paid"` ✅
- `enrollment` exists ✅
- But `hasContentUrl: false` ❌

**Root Cause**: Content was never uploaded to Cloudinary or not linked to lessons

**Solution Steps**:

1. **Verify content was uploaded to Cloudinary**:
   - Log into Cloudinary Dashboard
   - Navigate to Media Library
   - Search for course assets
   - Verify public IDs match what's in the database

2. **Check database for missing content URLs**:

```sql
-- Find lessons with no content URLs
SELECT l.id, l.title, l."sectionId", COUNT(lc.id) as content_count
FROM "Lesson" l
LEFT JOIN "LessonContent" lc ON l.id = lc."lessonId" AND lc."contentUrl" IS NOT NULL
WHERE l."sectionId" IN (
  SELECT id FROM "Section" WHERE "courseId" = 'COURSE_ID'
)
GROUP BY l.id, l.title, l."sectionId"
HAVING COUNT(lc.id) = 0;
```

3. **Re-upload content via admin panel**:
   - Go to Admin > Courses > [Course] > Edit
   - For each lesson, upload/link content
   - Verify Cloudinary public IDs are saved to database

4. **Or update database directly** (if you have the Cloudinary public IDs):

```sql
UPDATE "LessonContent"
SET "contentUrl" = 'courses/lesson-123/video-1'
WHERE "lessonId" = 'LESSON_ID' AND "contentUrl" IS NULL;
```

### Issue 4: "Content Exists But Returns 404"

**Symptom**:
- All database records look correct
- But player shows "Content not found" error
- Browser console shows 404 from `/api/content/[lessonId]`

**Root Cause**: Cloudinary public ID format incorrect or content deleted

**Solution Steps**:

1. **Verify public ID format**:
   - Should NOT start with `/image/upload/` or `/video/upload/`
   - Should be like: `courses/lesson-123/video-main` or `cmk7t10a0002vktooa30assy-0`
   - Check against actual Cloudinary dashboard

2. **Clean up URLs if needed**:

```sql
-- Show current URLs
SELECT id, "contentUrl" FROM "LessonContent" WHERE "lessonId" = 'LESSON_ID';

-- URLs that need fixing (starting with upload paths)
SELECT id, "contentUrl" FROM "LessonContent" 
WHERE "contentUrl" LIKE '%/upload/%';
```

3. **Extract public ID manually** from full Cloudinary URLs:

```
Full URL: https://res.cloudinary.com/cloud/video/upload/v1234/courses/lesson/video.mp4
Public ID: courses/lesson/video
```

4. **Update database with corrected public IDs**:

```sql
UPDATE "LessonContent"
SET "contentUrl" = 'courses/lesson-123/main-video'
WHERE id = 'CONTENT_ID';
```

## Database Queries for Debugging

### Show purchase flow for a user:

```sql
SELECT 
  p.id as purchase_id,
  p.status,
  p.provider,
  p."createdAt",
  e.id as enrollment_id,
  e."grantedAt",
  py.id as payment_id,
  py.status as payment_status
FROM "Purchase" p
LEFT JOIN "Enrollment" e ON p.id = e."purchaseId"
LEFT JOIN "Payment" py ON p.id = py."purchaseId"
WHERE p."userId" = 'USER_ID'
ORDER BY p."createdAt" DESC;
```

### Show all purchases pending longer than 1 hour:

```sql
SELECT 
  p.id,
  p."userId",
  p.status,
  p.provider,
  p."createdAt",
  NOW() - p."createdAt" as age
FROM "Purchase" p
WHERE p.status = 'pending'
AND p."createdAt" < NOW() - INTERVAL '1 hour'
ORDER BY p."createdAt" DESC;
```

### Show orphaned purchases (paid but no enrollment):

```sql
SELECT 
  p.id,
  p."userId",
  p."courseId",
  p.status,
  e.id as has_enrollment
FROM "Purchase" p
LEFT JOIN "Enrollment" e ON p.id = e."purchaseId"
WHERE p.status = 'paid'
AND e.id IS NULL;
```

### Show lessons with no content:

```sql
SELECT 
  l.id,
  l.title,
  s."courseId",
  COUNT(lc.id) as content_count,
  COUNT(CASE WHEN lc."contentUrl" IS NOT NULL THEN 1 END) as with_url
FROM "Lesson" l
JOIN "Section" s ON l."sectionId" = s.id
LEFT JOIN "LessonContent" lc ON l.id = lc."lessonId"
GROUP BY l.id, l.title, s."courseId"
HAVING COUNT(lc.id) = 0 OR COUNT(CASE WHEN lc."contentUrl" IS NOT NULL THEN 1 END) = 0
ORDER BY s."courseId", l.title;
```

## Webhook Testing in Production

### Enable Webhook Logging

The webhook now includes extensive logging. To see all webhook activity:

```bash
# For Docker/PM2 logs
pm2 logs app

# Or if using Docker
docker logs -f container-name | grep "WEBHOOK"
```

### Test with Webhook.cool

1. Visit [Webhook.cool](https://webhook.cool)
2. Get a temporary webhook URL
3. Update PayPal webhook settings to point to that URL
4. Complete a test purchase
5. Check webhook.cool to see if PayPal is sending requests

### Manual Webhook Replay

If a webhook failed to process:

```bash
# Get purchase that failed
PURCHASE_ID="..."
PROVIDER_REF="..." # PayPal order ID

# Manually trigger webhook processing
curl -X POST http://localhost:3000/api/webhooks/paypal \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "PAYMENT.CAPTURE.COMPLETED",
    "resource": {
      "supplementary_data": {
        "related_ids": {
          "order_id": "'$PROVIDER_REF'"
        }
      }
    }
  }'
```

## Performance & Monitoring

### Add Monitoring Alerts

Set up alerts for:

1. **Pending purchases older than 1 hour**:
```sql
SELECT COUNT(*) as stale_purchases
FROM "Purchase"
WHERE status = 'pending'
AND "createdAt" < NOW() - INTERVAL '1 hour';
```

2. **Webhook failures** (by checking logs for `[WEBHOOK] Critical error`):
```bash
grep -c "[WEBHOOK] Critical error" app.log
```

3. **Content availability**:
```sql
SELECT COUNT(*) as missing_content
FROM "LessonContent"
WHERE "contentUrl" IS NULL;
```

### Sample Monitoring Script

```bash
#!/bin/bash
# Run every 5 minutes to check for issues

# Check for stale purchases
STALE=$(psql -t -c "SELECT COUNT(*) FROM \"Purchase\" WHERE status = 'pending' AND \"createdAt\" < NOW() - INTERVAL '1 hour';")
if [ "$STALE" -gt 0 ]; then
  echo "⚠️  Alert: $STALE stale purchases found"
fi

# Check for orphaned enrollments
ORPHANED=$(psql -t -c "SELECT COUNT(*) FROM \"Purchase\" p LEFT JOIN \"Enrollment\" e ON p.id = e.\"purchaseId\" WHERE p.status = 'paid' AND e.id IS NULL;")
if [ "$ORPHANED" -gt 0 ]; then
  echo "⚠️  Alert: $ORPHANED orphaned purchases found"
fi

# Check webhook logs
ERRORS=$(grep -c "[WEBHOOK] Critical error" /var/log/app.log || true)
if [ "$ERRORS" -gt 0 ]; then
  echo "⚠️  Alert: $ERRORS webhook errors found"
fi
```

## Support & Next Steps

If issues persist:

1. **Collect diagnostics**:
   - Run: `./scripts/diagnose-access.sh USER_ID COURSE_ID`
   - Save full JSON response
   - Save webhook logs from last 24 hours

2. **Check infrastructure**:
   - Database connectivity
   - Cloudinary API key/secret validity
   - PayPal API credentials
   - Network access to PayPal

3. **Contact support with**:
   - User ID and Course ID
   - Full diagnostic output
   - Webhook logs from payment time
   - Cloudinary public ID examples
