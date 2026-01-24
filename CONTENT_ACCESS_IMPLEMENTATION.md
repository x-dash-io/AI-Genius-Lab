# 🚀 Content Access Fix - Complete Implementation Guide

## Overview
I've implemented a comprehensive solution to diagnose and fix buyer content access issues. The problem occurs when the purchase-to-access flow breaks at one of several points.

## What Was Fixed

### 1. Enhanced Webhook with Comprehensive Logging ✅
- Added `[WEBHOOK]` prefixed logging to track every step
- Better error handling and diagnostics
- Can now see exactly where payment processing breaks

**File**: `app/api/webhooks/paypal/route.ts`

### 2. New Debug Endpoints ✅

#### Access Check Endpoint
Check if a user can access a course:
```bash
curl -X POST http://localhost:3000/api/debug/access-check \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID","courseId":"COURSE_ID"}'
```

**File**: `app/api/debug/access-check/route.ts`

#### Content Check Endpoint
Verify content exists in Cloudinary:
```bash
curl -X POST http://localhost:3000/api/debug/content-check \
  -H "Content-Type: application/json" \
  -d '{"courseId":"COURSE_ID"}'
```

**File**: `app/api/debug/content-check/route.ts`

### 3. Diagnostic Scripts ✅

#### Automated Diagnosis
```bash
./scripts/diagnose-access.sh USER_ID COURSE_ID
```

Automatically:
- Checks purchase status
- Verifies enrollment exists
- Validates content URLs
- Provides interpretation & next steps

**File**: `scripts/diagnose-access.sh`

#### Batch Fix Tool
```bash
./scripts/fix-access-issues.sh
```

Identifies and optionally fixes:
- Orphaned purchases (paid but no enrollment)
- Stale pending purchases (never webhook'd)
- Lessons without content
- Generates detailed report

**File**: `scripts/fix-access-issues.sh`

### 4. Complete Documentation ✅

#### Root Cause Analysis & Fixes
**File**: `docs/BUYER_ACCESS_FIX_GUIDE.md`
- Detailed root cause analysis
- 4 potential issues with solutions
- Step-by-step fix procedures
- Database queries for investigation

#### User-Friendly Troubleshooting
**File**: `docs/TROUBLESHOOTING_CONTENT_ACCESS.md`
- Quick diagnosis methods
- Common issues & fixes
- Performance monitoring
- Production setup guide

#### Implementation Summary
**File**: `docs/IMPLEMENTATION_CONTENT_ACCESS.md`
- What was implemented
- How to use the tools
- Expected results
- Testing procedures

#### Visual Flowcharts
**File**: `docs/CONTENT_ACCESS_FLOWCHARTS.md`
- Happy path diagram
- Issue detection tree
- Database state examples
- Access control matrix

## The Root Cause: 4 Possible Issues

### 1. Purchase Status Never Updated (Most Common ⚠️)
```
Purchase.status = "pending" ← Should be "paid"
│
└─→ PayPal webhook hasn't run
    └─→ Check: Webhook URL, signature verification, network
```

### 2. No Enrollment Record
```
Purchase.status = "paid" ✅
Enrollment = NULL ❌
│
└─→ Webhook ran but enrollment creation failed
    └─→ Check: Database connection, constraint violations
```

### 3. No Content URL in Database
```
Purchase: PAID ✅
Enrollment: EXISTS ✅
LessonContent.contentUrl = NULL ❌
│
└─→ Content uploaded to Cloudinary but not linked
    └─→ Check: Admin uploaded content properly
```

### 4. Invalid Content URL Format
```
Purchase: PAID ✅
Enrollment: EXISTS ✅
LessonContent.contentUrl exists but wrong format ❌
│
└─→ URL parsing error when building signed URL
    └─→ Check: URL format matches Cloudinary public ID
```

## How to Diagnose

### Quick Check
```bash
# For any specific user/course
curl -X POST http://localhost:3000/api/debug/access-check \
  -d '{"userId":"USER_ID","courseId":"COURSE_ID"}' | jq '.'
```

Look for:
- ✅ `purchase.status: "paid"` - Should be "paid", not "pending"
- ✅ `enrollment` - Should exist
- ✅ `lessonsWithContent[*].hasContentUrl: true` - Content should be linked

### Automated Diagnosis
```bash
./scripts/diagnose-access.sh USER_ID COURSE_ID
```

Script will:
1. Connect to API
2. Check purchase status
3. Check enrollment
4. Check content availability
5. Show interpretation
6. Suggest fixes

## Common Fixes

### Fix 1: Webhook Not Running (Purchase Status = Pending)

**Check PayPal webhook configuration**:
1. Log into PayPal Dashboard
2. Settings → Notifications → Webhooks
3. Verify endpoint: `https://yourdomain.com/api/webhooks/paypal`
4. Verify event type: `PAYMENT.CAPTURE.COMPLETED`

**Check webhook logs**:
```bash
# Docker
docker logs -f container | grep "WEBHOOK"

# PM2
pm2 logs app | grep "WEBHOOK"
```

**Manual test**:
```bash
curl -X POST http://localhost:3000/api/webhooks/paypal \
  -H "paypal-transmission-id: test-1" \
  -H "paypal-transmission-time: 2024-01-24T15:00:00Z" \
  -H "paypal-transmission-sig: test" \
  -H "paypal-cert-url: test" \
  -H "paypal-auth-algo: SHA256withRSA" \
  -d '{
    "event_type":"PAYMENT.CAPTURE.COMPLETED",
    "resource":{"supplementary_data":{"related_ids":{"order_id":"ORDER_ID"}}}
  }'
```

### Fix 2: Orphaned Purchase (No Enrollment)

**Automated fix**:
```bash
./scripts/fix-access-issues.sh
```

Select option to create missing enrollments.

**Manual fix**:
```sql
INSERT INTO "Enrollment" (id, "userId", "courseId", "purchaseId", "grantedAt")
SELECT 
  gen_random_uuid(),
  p."userId",
  p."courseId",
  p.id,
  NOW()
FROM "Purchase" p
LEFT JOIN "Enrollment" e ON p.id = e."purchaseId"
WHERE p.status = 'paid' AND e.id IS NULL
ON CONFLICT ("userId", "courseId") DO UPDATE 
SET "purchaseId" = EXCLUDED."purchaseId";
```

### Fix 3: Missing Content URL

**Via Admin Panel**:
1. Go to Admin → Courses → [Course] → Edit
2. For each lesson, upload/link content to Cloudinary
3. Verify Cloudinary public ID is saved

**Check database**:
```sql
SELECT l.id, l.title, COUNT(lc.id) as content_count
FROM "Lesson" l
LEFT JOIN "LessonContent" lc ON l.id = lc."lessonId" AND lc."contentUrl" IS NOT NULL
GROUP BY l.id
HAVING COUNT(lc.id) = 0;
```

### Fix 4: Invalid URL Format

**Check current URLs**:
```sql
SELECT id, "contentUrl" FROM "LessonContent" WHERE "lessonId" = 'LESSON_ID';
```

**Should be**: `courses/lesson-123/video-main` (not a full URL)

**Extract from Cloudinary**:
```
Full URL: https://res.cloudinary.com/cloud/video/upload/v1234/courses/lesson/video.mp4
Public ID: courses/lesson/video
```

## Production Monitoring

Add these alerts to your monitoring system:

### Alert: Stale Pending Purchases
```sql
SELECT COUNT(*) as stale_purchases
FROM "Purchase"
WHERE status = 'pending'
AND "createdAt" < NOW() - INTERVAL '1 hour';
-- Alert if > 0
```

### Alert: Orphaned Purchases
```sql
SELECT COUNT(*) as orphaned
FROM "Purchase" p
LEFT JOIN "Enrollment" e ON p.id = e."purchaseId"
WHERE p.status = 'paid' AND e.id IS NULL;
-- Alert if > 0
```

### Alert: Webhook Errors
```bash
grep -c "[WEBHOOK] Critical error" /var/log/app.log
# Alert if > 0
```

## Testing

### Manual Test Purchase Flow

1. **Create test purchase**:
   - Add course to cart
   - Complete PayPal payment in sandbox

2. **Check database**:
   ```sql
   SELECT * FROM "Purchase" ORDER BY "createdAt" DESC LIMIT 1;
   ```
   - Should show `status: "paid"` within 30 seconds

3. **Run diagnostic**:
   ```bash
   ./scripts/diagnose-access.sh USER_ID COURSE_ID
   ```
   - Should show purchase paid and enrollment created

4. **Access content**:
   - Navigate to library
   - Click lesson
   - Video should load

### Test Debug Endpoints

```bash
# Test 1: Check access
curl -X POST http://localhost:3000/api/debug/access-check \
  -d '{"userId":"test-user","courseId":"test-course"}'

# Test 2: Check content
curl -X POST http://localhost:3000/api/debug/content-check \
  -d '{"courseId":"test-course"}'
```

## File Summary

| File | Purpose |
|------|---------|
| `app/api/webhooks/paypal/route.ts` | Enhanced webhook with logging |
| `app/api/debug/access-check/route.ts` | Access verification endpoint |
| `app/api/debug/content-check/route.ts` | Content verification endpoint |
| `scripts/diagnose-access.sh` | Automated diagnostic tool |
| `scripts/fix-access-issues.sh` | Batch fix tool |
| `docs/BUYER_ACCESS_FIX_GUIDE.md` | Detailed fix guide |
| `docs/TROUBLESHOOTING_CONTENT_ACCESS.md` | User guide |
| `docs/IMPLEMENTATION_CONTENT_ACCESS.md` | Implementation docs |
| `docs/CONTENT_ACCESS_FLOWCHARTS.md` | Visual diagrams |

## Next Steps

### 1. Deploy
```bash
git add .
git commit -m "Add content access diagnostics and fix tools"
git push
```

### 2. Test in Staging
- Complete test purchase
- Run `./scripts/diagnose-access.sh`
- Verify content loads

### 3. Monitor in Production
- Watch webhook logs for `[WEBHOOK]` entries
- Run diagnostic script on user complaints
- Monitor stale purchases alert

### 4. Train Support Team
- Share troubleshooting docs
- Teach them to use diagnostic script
- Set up monitoring alerts

## Support Commands

```bash
# Quick diagnosis
./scripts/diagnose-access.sh USER_ID COURSE_ID

# Batch fixes
./scripts/fix-access-issues.sh

# Check specific issue
curl -X POST /api/debug/access-check -d '{"userId":"...","courseId":"..."}'

# Monitor webhook
tail -f app.log | grep "WEBHOOK"
```

## Expected Results

### ✅ Working System
```
[User purchases course]
  ↓
[PayPal webhook triggers]
  ↓
[Purchase.status = "paid"]
  ↓
[Enrollment created]
  ↓
[User accesses library]
  ↓
[Content loads with signed URL]
  ↓
[User watches video] 🎬
```

### ❌ What We Fixed
```
BEFORE: [User can't see content] - No diagnostics available
AFTER:  [User can't see content] → Run diagnostic → Identify issue → Apply fix
```

---

**All documentation is in `docs/` folder**
**All scripts are in `scripts/` folder**
**Start with: `./scripts/diagnose-access.sh`**
