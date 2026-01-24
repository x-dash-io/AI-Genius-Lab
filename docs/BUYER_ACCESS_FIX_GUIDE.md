# Buyer Content Access Issue - Root Cause Analysis & Fix Guide

## Problem Summary
Buyers are showing "Limited Access" even though they have purchased courses and the content files exist in Cloudinary. The invoices appear correctly, but content access is blocked.

## Root Cause Analysis

After reviewing the codebase, the access flow is:

```
1. Purchase Created (pending) → Purchase.status = "pending"
   ↓
2. PayPal Checkout Created (cart/route.ts)
   - Creates Purchase with status: "pending"
   - Creates PayPal Order
   ↓
3. Buyer Completes Payment (external PayPal)
   ↓
4. PayPal Webhook (webhooks/paypal/route.ts)
   - Updates Purchase.status = "paid"
   - Creates Enrollment
   - Creates Payment record
   ✓ This is where access is granted
   ↓
5. Access Check (lib/access.ts → hasCourseAccess)
   - Admin: Always has access
   - User: Must have Purchase with status = "paid"
   ↓
6. Lesson Access (lib/lessons.ts → getAuthorizedLessonContent)
   - Checks hasCourseAccess
   - Validates lesson.contents has contentUrl
   - Generates signed Cloudinary URL
   ✓ This is where content URL is prepared
```

## Potential Issues (in order of likelihood)

### Issue 1: Purchase Status Never Updated to "paid"
**Symptom**: Webhook not being triggered or purchase status not updating

**Check**:
```bash
# Connect to database and check purchase status
SELECT id, userId, courseId, status, provider, providerRef, createdAt FROM "Purchase" 
WHERE userId = 'USER_ID' ORDER BY createdAt DESC LIMIT 5;

# Should show status = 'paid' for recent purchases
```

**Common Causes**:
- PayPal webhook not configured correctly
- Webhook endpoint not receiving requests
- Webhook signature verification failing
- Network/firewall blocking webhook calls

**Fix**:
1. Check PayPal Sandbox/Live webhook configuration
2. Verify webhook endpoint is `https://yourdomain.com/api/webhooks/paypal`
3. Check logs for webhook failures: `console.error("Content proxy error:", error);`
4. Test webhook manually:
```bash
curl -X POST http://localhost:3000/api/webhooks/paypal \
  -H "Content-Type: application/json" \
  -H "paypal-transmission-id: test" \
  -H "paypal-transmission-time: 2024-01-24T15:00:00Z" \
  -H "paypal-transmission-sig: test" \
  -H "paypal-cert-url: test" \
  -H "paypal-auth-algo: SHA256withRSA" \
  -d '{"event_type":"PAYMENT.CAPTURE.COMPLETED"}'
```

### Issue 2: Enrollment Record Not Created
**Symptom**: Purchase.status is "paid" but Enrollment doesn't exist

**Check**:
```bash
SELECT e.id, e.userId, e.courseId, e.purchaseId, p.status 
FROM "Enrollment" e 
RIGHT JOIN "Purchase" p ON e."purchaseId" = p.id 
WHERE p."userId" = 'USER_ID' 
ORDER BY p."createdAt" DESC LIMIT 5;

# Should show enrollment records matching purchases
```

**Common Cause**: Webhook processing failed after updating purchase status

**Fix**: Update the webhook handler to catch errors better (see implementation below)

### Issue 3: Content Has No contentUrl
**Symptom**: `Purchase.status = "paid"` but lesson shows "Content not available"

**Check**:
```bash
SELECT lc.id, lc.lessonId, lc.contentType, lc.contentUrl, lc.title, l.title as lesson_title
FROM "LessonContent" lc
JOIN "Lesson" l ON lc."lessonId" = l.id
WHERE lc."contentUrl" IS NULL OR lc."contentUrl" = ''
LIMIT 10;

# Should show no results - content should have URLs
```

**Common Cause**: 
- Content uploaded to Cloudinary but publicId not saved to database
- Content uploaded but never linked to lesson
- Migration issue with old contentUrl field

**Fix**: 
1. Verify uploads are storing the public ID
2. Check ContentUpload component is updating the database
3. Run migration if needed

### Issue 4: Signed URL Generation Failing
**Symptom**: Purchase is paid, enrollment exists, content has URL, but Cloudinary returns 404

**Check**:
```javascript
// In browser console when loading lesson
fetch('/api/content/[LESSON_ID]')
  .then(r => r.json())
  .then(console.log);

# Should redirect to signed URL, not error
```

**Common Causes**:
- Cloudinary public ID format incorrect
- Resource type mismatch (video vs raw vs image)
- URL parsing issues in lib/lessons.ts

**Fix**: See implementation below

## Implementation Fixes

### Fix 1: Add Comprehensive Logging to Webhook

Update [app/api/webhooks/paypal/route.ts](app/api/webhooks/paypal/route.ts):

```typescript
export async function POST(request: Request) {
  const bodyText = await request.text();
  const event = JSON.parse(bodyText) as PayPalEvent;

  // ... verification code ...

  const orderId = getOrderId(event);
  if (!orderId) {
    return NextResponse.json({ error: "Missing order id" }, { status: 400 });
  }

  const purchase = await prisma.purchase.findFirst({
    where: { providerRef: orderId },
  });

  if (!purchase) {
    console.error(`[WEBHOOK] Purchase not found for orderId: ${orderId}`);
    return NextResponse.json({ received: true });
  }

  if (purchase.status === "paid") {
    console.warn(`[WEBHOOK] Purchase already paid: ${purchase.id}`);
    return NextResponse.json({ received: true });
  }

  console.log(`[WEBHOOK] Updating purchase ${purchase.id} to paid status`);

  // Update purchase status
  await prisma.purchase.update({
    where: { id: purchase.id },
    data: { status: "paid" },
  });
  console.log(`[WEBHOOK] Purchase ${purchase.id} status updated to paid`);

  // Enrollment creation
  try {
    const enrollment = await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: purchase.userId,
          courseId: purchase.courseId,
        },
      },
      update: { purchaseId: purchase.id },
      create: {
        userId: purchase.userId,
        courseId: purchase.courseId,
        purchaseId: purchase.id,
      },
    });
    console.log(`[WEBHOOK] Enrollment created/updated: ${enrollment.id}`);
  } catch (enrollmentError) {
    console.error(`[WEBHOOK] Enrollment failed:`, enrollmentError);
    // Don't throw - let the rest process
  }

  // ... rest of code ...
}
```

### Fix 2: Verify Access Check Logic

The access verification chain should be:

```typescript
// lib/access.ts - hasCourseAccess function
export async function hasCourseAccess(
  userId: string,
  role: Role,
  courseId: string
) {
  // Admins always have access
  if (isAdmin(role)) {
    console.log(`[ACCESS] Admin ${userId} has access to course ${courseId}`);
    return true;
  }

  // For regular users, check purchase status
  const purchase = await withRetry(async () => {
    return prisma.purchase.findFirst({
      where: {
        userId,
        courseId,
        status: "paid", // ⚠️ MUST BE "paid", not "pending"
      },
      select: { id: true },
    });
  });

  const hasAccess = Boolean(purchase);
  console.log(`[ACCESS] User ${userId} access to course ${courseId}: ${hasAccess}`);
  return hasAccess;
}
```

### Fix 3: Add Debug Endpoint to Check User Access

Create [app/api/debug/access-check/route.ts](app/api/debug/access-check/route.ts):

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Only admins can use this
    await requireRole("admin");

    const body = await request.json();
    const { userId, courseId } = body;

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: "userId and courseId required" },
        { status: 400 }
      );
    }

    // Check purchase
    const purchase = await prisma.purchase.findFirst({
      where: { userId, courseId },
    });

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    // Check lesson content
    const lessons = await prisma.lesson.findMany({
      where: { section: { courseId } },
      include: { contents: true },
    });

    return NextResponse.json({
      purchase: purchase ? {
        id: purchase.id,
        status: purchase.status,
        provider: purchase.provider,
        providerRef: purchase.providerRef,
        createdAt: purchase.createdAt,
      } : null,
      enrollment: enrollment ? {
        id: enrollment.id,
        grantedAt: enrollment.grantedAt,
        purchaseId: enrollment.purchaseId,
      } : null,
      lessonsWithContent: lessons.map(l => ({
        id: l.id,
        title: l.title,
        contentCount: l.contents.length,
        hasContentUrl: l.contents.some(c => !!c.contentUrl),
      })),
    });
  } catch (error) {
    console.error("Debug access check error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error checking access" },
      { status: 500 }
    );
  }
}
```

### Fix 4: Content URL Validation Endpoint

Create [app/api/debug/content-check/route.ts](app/api/debug/content-check/route.ts):

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { checkCloudinaryResourceExists } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    // Only admins can use this
    await requireRole("admin");

    const body = await request.json();
    const { lessonId } = body;

    if (!lessonId) {
      return NextResponse.json(
        { error: "lessonId required" },
        { status: 400 }
      );
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { contents: true },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    const contentChecks = await Promise.all(
      lesson.contents.map(async (content) => {
        let exists = false;
        let error = null;

        if (content.contentUrl) {
          try {
            exists = await checkCloudinaryResourceExists(
              content.contentUrl
            );
          } catch (e) {
            error = e instanceof Error ? e.message : String(e);
          }
        }

        return {
          id: content.id,
          contentType: content.contentType,
          contentUrl: content.contentUrl,
          title: content.title,
          existsInCloudinary: exists,
          error,
        };
      })
    );

    return NextResponse.json({
      lesson: {
        id: lesson.id,
        title: lesson.title,
        contentCount: lesson.contents.length,
      },
      contents: contentChecks,
    });
  } catch (error) {
    console.error("Debug content check error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error checking content" },
      { status: 500 }
    );
  }
}
```

## Diagnostic Workflow

### Step 1: Check Purchase Status
```bash
# Get a specific buyer's purchases
curl -X POST http://localhost:3000/api/debug/access-check \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID","courseId":"COURSE_ID"}'
```

Expected output:
```json
{
  "purchase": {
    "id": "...",
    "status": "paid",  // ⚠️ If this is "pending", webhook didn't run
    "provider": "paypal",
    "createdAt": "2024-01-24T15:02:00Z"
  },
  "enrollment": {
    "id": "...",      // ⚠️ If this is null, enrollment wasn't created
    "grantedAt": "2024-01-24T15:02:30Z"
  },
  "lessonsWithContent": [...]
}
```

### Step 2: Check Content URLs
```bash
curl -X POST http://localhost:3000/api/debug/content-check \
  -H "Content-Type: application/json" \
  -d '{"lessonId":"LESSON_ID"}'
```

Expected output:
```json
{
  "lesson": {...},
  "contents": [
    {
      "contentUrl": "courses/...",
      "existsInCloudinary": true  // ⚠️ If false, content needs to be re-uploaded
    }
  ]
}
```

### Step 3: Check Webhook Logs
In your application logs, look for:
- `[WEBHOOK]` prefixed logs (from our fix)
- PayPal webhook signature validation failures
- Any network errors

### Step 4: Manual Webhook Test
If webhooks aren't working:

```bash
# SSH into your server and check PayPal webhook configuration
# In PayPal Dashboard: Settings > Notifications > Webhooks

# Manual test in development:
curl -X POST http://localhost:3000/api/webhooks/paypal \
  -H "Content-Type: application/json" \
  -H "paypal-transmission-id: test-$(date +%s)" \
  -H "paypal-transmission-time: $(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
  -H "paypal-transmission-sig: test" \
  -H "paypal-cert-url: test" \
  -H "paypal-auth-algo: SHA256withRSA" \
  -d '{
    "event_type":"PAYMENT.CAPTURE.COMPLETED",
    "resource":{
      "id":"test-order-id",
      "supplementary_data":{
        "related_ids":{"order_id":"test-order-id"}
      }
    }
  }'
```

## Quick Fix Checklist

- [ ] **Verify PayPal Webhook URL**: Settings > Notifications > Webhooks
  - Production: `https://yourdomain.com/api/webhooks/paypal`
  - Sandbox: `https://yourdomain-sandbox.com/api/webhooks/paypal`

- [ ] **Check Webhook Logs**: Look for any webhook processing errors

- [ ] **Test Manual Purchase**: 
  1. Create a test purchase
  2. Monitor database to see if Purchase.status changes to "paid"
  3. Check if Enrollment is created

- [ ] **Verify Cloudinary**: 
  - Assets exist in Cloudinary dashboard
  - Public IDs match what's in database

- [ ] **Check Browser Console**: 
  - Any 403/404 errors when loading lessons
  - Check `/api/content/[lessonId]` response

- [ ] **Run Database Queries**:
```sql
-- Show recent purchases and enrollments
SELECT 
  p.id, p.userId, p.courseId, p.status, 
  e.id as enrollment_id, e.grantedAt
FROM "Purchase" p
LEFT JOIN "Enrollment" e ON p.id = e."purchaseId"
WHERE p."createdAt" > NOW() - INTERVAL '24 hours'
ORDER BY p."createdAt" DESC
LIMIT 10;
```

## Production Monitoring

Add monitoring to track this issue:

1. **Alert on pending purchases older than 1 hour**:
```sql
SELECT COUNT(*) FROM "Purchase" 
WHERE status = 'pending' 
AND "createdAt" < NOW() - INTERVAL '1 hour'
```

2. **Alert on mismatched enrollments**:
```sql
SELECT p.id, p.status, e.id 
FROM "Purchase" p 
LEFT JOIN "Enrollment" e ON p.id = e."purchaseId"
WHERE p.status = 'paid' AND e.id IS NULL
```

3. **Alert on missing content**:
```sql
SELECT COUNT(*) FROM "Lesson" l
WHERE NOT EXISTS (
  SELECT 1 FROM "LessonContent" lc 
  WHERE lc."lessonId" = l.id AND lc."contentUrl" IS NOT NULL
)
```

## Next Steps

1. **Apply the fixes above** to add logging and debug endpoints
2. **Test with a paid purchase** and monitor logs
3. **Identify which step is failing** using the diagnostic workflow
4. **Fix that specific issue** based on root cause
5. **Monitor production** for recurrence

The most likely issue is the webhook not running or not updating the purchase status. The debug endpoints will help pinpoint exactly where the flow breaks.
