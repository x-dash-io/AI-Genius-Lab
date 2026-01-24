# Quick Reference: Content Access Troubleshooting

## 🚀 Quick Start (30 seconds)

```bash
# Step 1: Get user ID and course ID
USER_ID="..."  # From database or user email
COURSE_ID="..."

# Step 2: Run diagnostic
./scripts/diagnose-access.sh $USER_ID $COURSE_ID

# Step 3: Read output → Follow recommendations
```

## 🔍 Common Issues & Fixes (1 minute)

| Issue | Check | Fix |
|-------|-------|-----|
| **"Limited Access"** | `purchase.status` | Check webhook logs |
| **Purchase pending** | PayPal webhook | Verify endpoint URL in PayPal dashboard |
| **No enrollment** | Database logs | Run fix script or manual SQL |
| **Content missing** | Cloudinary | Re-upload via admin panel |
| **Wrong URL format** | Database URL | Fix public ID format |

## 📊 Debug Endpoints

```bash
# Check access
curl -X POST http://localhost:3000/api/debug/access-check \
  -d '{"userId":"USER_ID","courseId":"COURSE_ID"}'

# Check content
curl -X POST http://localhost:3000/api/debug/content-check \
  -d '{"courseId":"COURSE_ID"}'
```

## 🛠️ Emergency Fixes

### Fix 1: Create missing enrollment
```sql
INSERT INTO "Enrollment" (id, "userId", "courseId", "purchaseId", "grantedAt")
VALUES (gen_random_uuid(), 'USER_ID', 'COURSE_ID', 'PURCHASE_ID', NOW())
ON CONFLICT ("userId", "courseId") DO UPDATE SET "purchaseId" = 'PURCHASE_ID';
```

### Fix 2: Mark pending as paid (if webhook failed)
```sql
UPDATE "Purchase" SET status = 'paid' WHERE id = 'PURCHASE_ID' AND status = 'pending';
```

### Fix 3: Update content URL
```sql
UPDATE "LessonContent" SET "contentUrl" = 'correct-cloudinary-id' WHERE id = 'CONTENT_ID';
```

## 📋 Checklist

When user says "can't access":
- [ ] Run: `./scripts/diagnose-access.sh`
- [ ] Check: `purchase.status === "paid"`
- [ ] Check: `enrollment` exists
- [ ] Check: `lessonsWithContent[0].hasContentUrl === true`
- [ ] Monitor: Webhook logs for `[WEBHOOK]` entries
- [ ] Fix: Based on diagnosis

## 🔗 Documentation

- **📖 Full Guide**: `docs/BUYER_ACCESS_FIX_GUIDE.md`
- **🆘 Troubleshooting**: `docs/TROUBLESHOOTING_CONTENT_ACCESS.md`
- **📊 Implementation**: `docs/IMPLEMENTATION_CONTENT_ACCESS.md`
- **📈 Flowcharts**: `docs/CONTENT_ACCESS_FLOWCHARTS.md`

## 📈 Monitoring (Production)

```bash
# Check for issues
./scripts/fix-access-issues.sh

# Monitor webhook
tail -f app.log | grep "WEBHOOK"

# Check stale purchases (SQL)
SELECT COUNT(*) FROM "Purchase" 
WHERE status = 'pending' 
AND "createdAt" < NOW() - INTERVAL '1 hour';
```

## 🎯 Success Indicators

✅ User can access course after purchase
✅ `./scripts/diagnose-access.sh` shows access granted
✅ Webhook logs show `[WEBHOOK] ... successfully`
✅ No stale pending purchases
✅ Content loads and video plays

## 🆘 When Stuck

1. **Read full output** of diagnostic script
2. **Check logs** for `[WEBHOOK]` errors
3. **Review documentation** for your specific issue
4. **Run manual queries** from troubleshooting guide
5. **Check Cloudinary** for content existence

---

**Save this as a bookmark for quick reference!**
