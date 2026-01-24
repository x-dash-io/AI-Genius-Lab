# Content Access Flow Diagrams

## Happy Path: Successful Purchase & Content Access

```
┌─────────────────────────────────────────────────────────────────┐
│ USER EXPERIENCE: Successful Content Access                      │
└─────────────────────────────────────────────────────────────────┘

1. PURCHASE INITIATION
┌──────────────┐
│ User clicks  │
│  "Buy Now"   │
└──────────────┘
       ↓
   [Cart added]
       ↓
[PayPal checkout page]
       ↓

2. PAYMENT PROCESSING
┌──────────────────────┐
│ PayPal processes     │
│ payment securely     │
└──────────────────────┘
       ↓
 [Payment accepted]
       ↓

3. WEBHOOK CALLBACK
┌──────────────────────────────────────────┐
│ PayPal sends webhook:                     │
│ POST /api/webhooks/paypal                 │
│ event_type: PAYMENT.CAPTURE.COMPLETED     │
└──────────────────────────────────────────┘
       ↓
[Webhook received and logged]
       ↓
[Signature verified]
       ↓

4. DATABASE UPDATES (ATOMIC)
┌────────────────────────────────────────┐
│ UPDATE Purchase                         │
│ SET status = 'paid'                     │
│ WHERE providerRef = orderId             │
└────────────────────────────────────────┘
       ↓
[Purchase.status: pending → paid] ✅
       ↓
┌────────────────────────────────────────┐
│ INSERT INTO Enrollment                  │
│ userId, courseId, purchaseId            │
└────────────────────────────────────────┘
       ↓
[Enrollment.id created] ✅
       ↓

5. USER ACCESSES COURSE
┌──────────────────────┐
│ User navigates to    │
│ /library             │
└──────────────────────┘
       ↓
[hasCourseAccess check]
       ↓
┌──────────────────────────────┐
│ Query: Enrollment exists?    │
│ Purchase.status == 'paid'?   │
└──────────────────────────────┘
       ↓
[Access granted] ✅
       ↓

6. CONTENT DELIVERY
┌──────────────────────┐
│ User clicks lesson   │
└──────────────────────┘
       ↓
[GET /library/[courseId]/lesson/[lessonId]]
       ↓
┌──────────────────────────────┐
│ hasCourseAccess check        │
│ getAuthorizedLessonContent   │
└──────────────────────────────┘
       ↓
[Access verified] ✅
       ↓
[Fetch LessonContent from DB]
       ↓
┌──────────────────────────────┐
│ contentUrl → Cloudinary ID   │
│ Build signed URL             │
│ Expiry: 10 minutes           │
│ User ID embedded in sig       │
└──────────────────────────────┘
       ↓
[Signed URL generated] ✅
       ↓
┌──────────────────────────────┐
│ Redirect to signed URL       │
│ https://res.cloudinary.com/  │
│ ...?signed_download=true     │
└──────────────────────────────┘
       ↓
[VideoPlayer loads]
       ↓
[Cloudinary serves video] ✅
       ↓
┌──────────────────────┐
│ User watches content │
│ Video plays!         │
└──────────────────────┘
```

## Issue Detection: Diagnosis Flowchart

```
┌───────────────────────────────────────────┐
│ User reports: "Can't access content"      │
└───────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│ Run: ./scripts/diagnose-access.sh USER_ID COURSE_ID        │
│ POST: /api/debug/access-check                              │
└─────────────────────────────────────────────────────────────┘
           ↓
    ┌──────────────┴──────────────┐
    ↓                            ↓
[Has Purchase?]            [Has Enrollment?]
    │                            │
    ├─ NO ──→ ❌ USER NEVER BOUGHT
    │
    ├─ YES ──→ Check status
         │
         ├─ PENDING ──→ ❌ WEBHOOK NOT RUN
         │              Fix: Check PayPal webhook config
         │
         └─ PAID ──→ ✅ Purchase OK
                     │
                     └─→ Has enrollment? ──→ NO ──→ ❌ ENROLLMENT FAILED
                                                      Fix: Create manually or retry webhook
                                          │
                                          └─ YES ──→ ✅ Access should work
                                                     Check content URLs


         ┌──────────────────────────────────┐
         │ Does content have URL?           │
         └──────────────────────────────────┘
                    ↓
         ┌──────────┴──────────┐
         ↓                    ↓
       NO                    YES
        │                     │
    ❌ Content missing   POST: /api/debug/content-check
       Fix: Re-upload        Check Cloudinary
    to Cloudinary
                             ├─ Exists ✅  → URL parsing issue
                             │               Fix: Extract correct public ID
                             │
                             └─ Missing ❌  → File not in Cloudinary
                                            Fix: Re-upload
```

## Database State Diagram

```
VALID STATE (User has access):
┌─────────────────────────────────────────────────┐
│ Purchase (id: P1)                               │
│ ├─ userId: USER_123                            │
│ ├─ courseId: COURSE_456                        │
│ ├─ status: "paid" ✅                           │
│ └─ providerRef: "PP_ORDER_789"                 │
│                                                 │
│ Enrollment (id: E1)                            │
│ ├─ userId: USER_123                            │
│ ├─ courseId: COURSE_456                        │
│ ├─ purchaseId: P1 ✅ (Links to Purchase)      │
│ └─ grantedAt: 2024-01-24 15:02:30Z             │
│                                                 │
│ LessonContent (id: LC1)                        │
│ ├─ lessonId: LESSON_001                        │
│ ├─ contentType: "video"                        │
│ ├─ contentUrl: "courses/lesson-001/main" ✅   │
│ └─ exists in Cloudinary ✅                     │
└─────────────────────────────────────────────────┘


BROKEN STATE 1: Purchase not updated
┌─────────────────────────────────────────────────┐
│ Purchase (id: P1)                               │
│ ├─ userId: USER_123                            │
│ ├─ courseId: COURSE_456                        │
│ ├─ status: "pending" ❌ (Should be "paid")     │
│ └─ providerRef: "PP_ORDER_789"                 │
│                                                 │
│ → No Enrollment created yet                    │
│ → Access check FAILS: no paid purchase         │
│ → hasCourseAccess returns FALSE                │
│                                                 │
│ Root Cause: PayPal webhook didn't run          │
│ Fix: Check webhook configuration & logs        │
└─────────────────────────────────────────────────┘


BROKEN STATE 2: Orphaned purchase
┌─────────────────────────────────────────────────┐
│ Purchase (id: P1)                               │
│ ├─ userId: USER_123                            │
│ ├─ courseId: COURSE_456                        │
│ ├─ status: "paid" ✅                           │
│ └─ providerRef: "PP_ORDER_789"                 │
│                                                 │
│ Enrollment: MISSING ❌                         │
│ → Access check partially passes                │
│ → But enrollment lookup FAILS                  │
│ → User sees "limited access"                   │
│                                                 │
│ Root Cause: Webhook ran but enrollment failed  │
│ Fix: Create enrollment manually                │
└─────────────────────────────────────────────────┘


BROKEN STATE 3: No content URL
┌─────────────────────────────────────────────────┐
│ Purchase: PAID ✅                              │
│ Enrollment: EXISTS ✅                          │
│                                                 │
│ LessonContent (id: LC1)                        │
│ ├─ lessonId: LESSON_001                        │
│ ├─ contentType: "video"                        │
│ ├─ contentUrl: NULL ❌ (Missing!)              │
│                                                 │
│ → Access check passes                          │
│ → But content endpoint returns 404             │
│ → User sees "Content not available"            │
│                                                 │
│ Root Cause: Content never uploaded             │
│ Fix: Re-upload to Cloudinary & link to lesson  │
└─────────────────────────────────────────────────┘
```

## Webhook Processing Sequence

```
EXPECTED WORKFLOW:

1. Payment Completed
   ├─ PayPal processes charge
   ├─ Funds captured
   └─ Webhook prepared

2. Webhook Sent by PayPal
   ├─ Headers sent (transmission-id, transmission-sig, etc.)
   ├─ POST body with event data
   ├─ Target: https://yourdomain.com/api/webhooks/paypal
   └─ [WEBHOOK] Event received logged

3. Webhook Processing
   ├─ [WEBHOOK] Verifying webhook signature...
   ├─ Signature verification
   │  ├─ Uses PayPal cert URL
   │  ├─ Validates transmission data
   │  └─ [WEBHOOK] Signature verified successfully
   │
   ├─ Extract order ID from event
   │  └─ [WEBHOOK] Looking up purchase for order: PP_ORDER_789
   │
   ├─ Find matching purchase
   │  └─ [WEBHOOK] Purchase found: P1
   │
   ├─ UPDATE Purchase status
   │  ├─ Set status = 'paid'
   │  └─ [WEBHOOK] Purchase P1 status updated to paid
   │
   ├─ CREATE Enrollment
   │  ├─ Link user to course
   │  └─ [WEBHOOK] Enrollment E1 created/updated successfully
   │
   ├─ Send Emails
   │  ├─ Purchase confirmation email
   │  ├─ Enrollment email
   │  └─ [WEBHOOK] Emails sent successfully
   │
   └─ Create Records
      ├─ Payment record
      ├─ Activity log entry
      └─ [WEBHOOK] Purchase P1 processing completed successfully

4. Response to PayPal
   └─ { "received": true }


IF WEBHOOK FAILS:

1. Signature Verification Fails
   ├─ [WEBHOOK] Invalid signature verification failed
   ├─ Response: { "error": "Invalid signature" } ← HTTP 400
   ├─ Reason: PayPal webhook signing cert mismatch
   └─ Fix: Verify PayPal API credentials

2. Purchase Not Found
   ├─ [WEBHOOK] Purchase not found for orderId: PP_ORDER_789
   ├─ Response: { "received": true } ← Still success (idempotent)
   ├─ Reason: Database might be slow or order ID format wrong
   └─ Fix: Check order ID is saved to Purchase.providerRef

3. Enrollment Creation Fails
   ├─ [WEBHOOK] Enrollment failed: [error details]
   ├─ Processing continues (doesn't fail webhook)
   ├─ Reason: Database connection issue or constraint violation
   └─ Fix: Check database logs and create enrollment manually

4. Critical Error During Processing
   ├─ [WEBHOOK] Critical error processing webhook: [error]
   ├─ Response: { "received": true } ← Still success (retry logic)
   ├─ Reason: Unexpected error in processing
   └─ Fix: Check logs, diagnose, manual fix if needed
```

## Access Control Matrix

```
┌─────────────────────────────────────────────────────────────┐
│               ACCESS CONTROL DECISION TREE                  │
└─────────────────────────────────────────────────────────────┘

User requests lesson content:
  GET /library/[courseId]/lesson/[lessonId]

                    ↓

           Is user authenticated?
              /              \
            NO               YES
            │                 │
        401 Unauthorized    Check role
                              │
                    ┌─────────┴──────────┐
                    ↓                    ↓
                  Admin              Customer
                    │                    │
            Has all access    Check purchase status
                    │                    │
               ALLOW all         ┌───────┴─────────┐
                                 │                 │
                          Has "paid"          Otherwise
                         purchase?              │
                           │                    │
                          YES                  NO
                           │                    │
                   ┌────────┘          403 Forbidden
                   │
              Fetch lesson content
                   │
           ┌───────┴───────┐
           ↓               ↓
     Has content?      No content?
           │               │
          YES             NULL
           │               │
    Generate signed    404 Not Found
    Cloudinary URL    (Content missing)
           │
    Redirect to
    signed URL
           │
    Cloudinary
    validates sig
           │
    ┌──────┴──────┐
    ↓             ↓
 Valid       Invalid/Expired
   │             │
 Serve        403 Forbidden
content       (Sig expired)


User role matrix:

┌────────────┬──────────────────┬──────────────────┬──────────┐
│ User Role  │ See Own Courses  │ See All Content  │ Admin    │
├────────────┼──────────────────┼──────────────────┼──────────┤
│ Admin      │ N/A              │ ✅ YES           │ ✅ YES   │
│ Customer   │ ✅ If purchased  │ ❌ NO            │ ❌ NO    │
│ Guest      │ ❌ NO            │ ❌ NO            │ ❌ NO    │
└────────────┴──────────────────┴──────────────────┴──────────┘
```

## Troubleshooting Decision Tree

```
USER: "I can't access my course content"

    ↓
[Run diagnostic]
./scripts/diagnose-access.sh USER_ID COURSE_ID

    ↓
    ├─ Purchase missing?
    │  └─ ❌ User never purchased
    │     Fix: Buy the course
    │
    ├─ Purchase pending?
    │  └─ ⏱️  Waiting for payment processing
    │     ├─ Check: Did payment complete on PayPal?
    │     ├─ Check: PayPal webhook endpoint configured?
    │     ├─ Check: Webhook signature verification passing?
    │     └─ Wait: 5 minutes for webhook delivery
    │
    ├─ Purchase paid but no enrollment?
    │  └─ ⚠️  Webhook partially failed
    │     ├─ Check: Webhook error logs
    │     ├─ Check: Database connection at webhook time
    │     └─ Fix: Manual SQL to create enrollment
    │
    ├─ Enrollment exists but no content access?
    │  └─ 🎬 Check lesson content
    │     ├─ Content has URL?
    │     │  ├─ YES → Check URL format
    │     │  │  ├─ Wrong format? → Fix URL in DB
    │     │  │  └─ Correct? → Check Cloudinary
    │     │  │     ├─ File exists? → Signed URL issue
    │     │  │     └─ File missing? → Re-upload
    │     │  │
    │     │  └─ NO → Content never uploaded
    │     │     Fix: Upload via admin panel
    │
    └─ Still not working?
       └─ 🔧 Deep Dive
          ├─ Check browser console for errors
          ├─ Review full webhook logs
          ├─ Verify Cloudinary API keys
          ├─ Check database connectivity
          └─ Contact support with diagnostic output
```

---

These diagrams show the complete flow from purchase through content access, making it easy to visualize where issues might occur.
