# AI Genius Lab - System Architecture & Technical Documentation

**Last Updated:** January 27, 2026  
**Version:** 0.1.0  
**Status:** Development/Pre-Production

---

## Executive Summary

AI Genius Lab is a full-stack Learning Management System (LMS) built with Next.js 16, TypeScript, PostgreSQL, and modern web technologies. The platform enables course creation, student enrollment, progress tracking, certificate generation, and payment processing through PayPal. It features role-based access control, subscription management, and a comprehensive admin dashboard.

**Key Metrics:**
- **Tech Stack:** Next.js 16 (App Router), TypeScript 5, PostgreSQL, Prisma ORM 6.4
- **Authentication:** NextAuth.js with JWT strategy (credentials + Google OAuth)
- **Payment:** PayPal integration (sandbox/live)
- **Media:** Cloudinary for video/audio/PDF storage
- **Email:** Resend/Nodemailer for transactional emails
- **Caching:** Optional Upstash Redis

---

## System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (Browser)                   │
│  Next.js 16 App Router + React 19 + Tailwind CSS + Radix UI │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Middleware Layer                           │
│  - Route Protection (Admin/Customer)                         │
│  - Security Headers (CSP, HSTS, XSS)                        │
│  - Session Validation (JWT)                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Public     │  │   Customer   │  │    Admin     │      │
│  │   Routes     │  │   Routes     │  │   Routes     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Layer (Serverless)                   │
│  /api/auth/* | /api/courses/* | /api/progress/*            │
│  /api/payments/* | /api/certificates/* | /api/admin/*      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                       │
│  lib/access.ts | lib/courses.ts | lib/progress.ts          │
│  lib/certificates.ts | lib/subscription.ts | lib/paypal.ts │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Access Layer                          │
│              Prisma ORM + Connection Pooling                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer                             │
│              PostgreSQL (Neon/Vercel/Supabase)              │
└─────────────────────────────────────────────────────────────┘
```


### External Services Integration

```
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
├─────────────────────────────────────────────────────────────┤
│  PayPal API          → Payment processing & webhooks         │
│  Cloudinary          → Media storage & CDN                   │
│  Resend/Nodemailer   → Transactional emails                 │
│  Upstash Redis       → Rate limiting & caching (optional)    │
│  Google OAuth        → Social authentication                 │
│  Vercel Analytics    → Usage tracking                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema Architecture

### Core Entity Relationships

**User Management:**
- `User` (1) ←→ (N) `Account` (OAuth providers)
- `User` (1) ←→ (N) `Session` (JWT sessions)
- `User` (1) ←→ (N) `Purchase` (course purchases)
- `User` (1) ←→ (N) `Enrollment` (course access)
- `User` (1) ←→ (N) `Progress` (lesson progress)
- `User` (1) ←→ (N) `Certificate` (earned certificates)
- `User` (1) ←→ (N) `Review` (course reviews)
- `User` (1) ←→ (N) `Subscription` (premium subscriptions)
- `User` (1) ←→ (N) `ActivityLog` (audit trail)

**Course Structure:**
- `Course` (1) ←→ (N) `Section` (course sections)
- `Section` (1) ←→ (N) `Lesson` (section lessons)
- `Lesson` (1) ←→ (N) `LessonContent` (video/pdf/audio/link/file)
- `Course` (N) ←→ (1) `Category` (course categorization)

**Learning Paths:**
- `LearningPath` (1) ←→ (N) `LearningPathCourse` (path courses)
- `LearningPathCourse` (N) ←→ (1) `Course`

**Commerce:**
- `Purchase` (1) ←→ (N) `Payment` (payment transactions)
- `Purchase` (1) ←→ (1) `Enrollment` (course access grant)
- `Subscription` (1) ←→ (N) `Enrollment` (subscription access)
- `Subscription` (1) ←→ (N) `Payment` (recurring payments)

**Blog System:**
- `BlogPost` (1) ←→ (N) `BlogImage` (post images)
- `BlogPost` (1) ←→ (N) `BlogReview` (post reviews)
- `BlogReview` (N) ←→ (1) `User`

### Key Database Models

#### User Model
```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  image         String?
  bio           String?
  emailVerified DateTime?
  passwordHash  String?
  role          Role     @default(customer)  // customer | admin
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

#### Course Model
```prisma
model Course {
  id          String   @id
  slug        String   @unique
  title       String
  description String?
  category    String?
  categoryId  String?
  priceCents  Int
  inventory   Int?
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime
}
```

#### Enrollment Model (Access Control)
```prisma
model Enrollment {
  id             String     @id
  userId         String
  courseId       String
  purchaseId     String?    @unique
  subscriptionId String?    @unique
  accessType     AccessType @default(purchased)  // purchased | subscription
  grantedAt      DateTime   @default(now())
  expiresAt      DateTime?
  
  @@unique([userId, courseId])
}
```

#### Progress Model
```prisma
model Progress {
  id                String    @id
  userId            String
  lessonId          String
  startedAt         DateTime?
  completedAt       DateTime?
  lastPosition      Int       @default(0)
  completionPercent Int       @default(0)
  updatedAt         DateTime
  
  @@unique([userId, lessonId])
}
```


---

## Application Structure

### Route Organization

```
app/
├── (admin)/                    # Admin-only routes (requires admin role)
│   ├── admin/
│   │   ├── page.tsx           # Admin dashboard with analytics
│   │   ├── courses/           # Course management (CRUD)
│   │   ├── learning-paths/    # Learning path management
│   │   ├── categories/        # Category management
│   │   ├── users/             # User management
│   │   ├── purchases/         # Purchase tracking
│   │   ├── subscriptions/     # Subscription management
│   │   ├── blog/              # Blog post management
│   │   └── profile/           # Admin profile
│   └── layout.tsx             # Admin layout wrapper
│
├── (app)/                      # Customer-only routes (requires authentication)
│   ├── dashboard/             # User dashboard
│   ├── library/               # Purchased courses library
│   │   └── [courseId]/        # Course viewer
│   │       ├── page.tsx       # Course overview
│   │       └── lesson/[lessonId]/  # Lesson viewer
│   ├── profile/               # User profile management
│   ├── activity/              # Activity log
│   └── purchase/              # Purchase history
│       └── success/           # Purchase confirmation
│
├── (public)/                   # Public routes (no auth required)
│   ├── page.tsx               # Homepage
│   ├── courses/               # Course catalog
│   │   ├── page.tsx           # All courses
│   │   ├── [courseId]/        # Course details
│   │   └── category/[category]/  # Category filter
│   ├── learning-paths/        # Learning paths catalog
│   │   └── [pathId]/          # Path details
│   ├── blog/                  # Blog posts
│   │   └── [slug]/            # Blog post detail
│   ├── cart/                  # Shopping cart
│   ├── checkout/              # Checkout flow
│   ├── subscription/          # Subscription plans
│   ├── sign-in/               # Login page
│   ├── sign-up/               # Registration page
│   ├── forgot-password/       # Password reset request
│   ├── reset-password/        # Password reset form
│   ├── contact/               # Contact form
│   ├── faq/                   # FAQ page
│   ├── instructors/           # Instructors page
│   ├── privacy/               # Privacy policy
│   └── terms/                 # Terms of service
│
└── api/                        # API routes (serverless functions)
    ├── auth/                  # Authentication endpoints
    │   ├── [...nextauth]/     # NextAuth.js handler
    │   ├── session/           # Get current session
    │   ├── signup/            # User registration
    │   ├── send-otp/          # Send OTP for 2FA
    │   ├── verify-otp/        # Verify OTP
    │   ├── forgot-password/   # Request password reset
    │   ├── verify-reset-code/ # Verify reset code
    │   └── reset-password/    # Reset password
    ├── courses/               # Course endpoints
    │   └── [courseId]/
    │       └── ownership/     # Check course ownership
    ├── progress/              # Progress tracking
    ├── certificates/          # Certificate generation & verification
    │   ├── generate/          # Generate certificate
    │   └── [certificateId]/verify/  # Verify certificate
    ├── reviews/               # Review system
    ├── cart/                  # Cart management
    ├── checkout/              # Checkout processing
    ├── payments/              # Payment processing
    │   └── paypal/
    │       └── capture/       # Capture PayPal payment
    ├── subscription/          # Subscription management
    │   ├── plans/             # Get subscription plans
    │   ├── subscribe/         # Create subscription
    │   ├── cancel/            # Cancel subscription
    │   └── reactivate/        # Reactivate subscription
    ├── webhooks/              # Webhook handlers
    │   └── paypal/            # PayPal webhooks
    ├── admin/                 # Admin-only endpoints
    │   ├── categories/        # Category CRUD
    │   ├── subscriptions/     # Subscription management
    │   ├── upload/            # File upload
    │   └── upload-url/        # Generate signed upload URL
    ├── contact/               # Contact form submission
    ├── activity/              # Activity log
    └── debug/                 # Debug endpoints (admin-only)
        ├── access-check/      # Verify user access
        └── content-check/     # Verify content exists
```


### Component Organization

```
components/
├── admin/                      # Admin-specific components
│   ├── AnalyticsCharts.tsx    # Revenue/enrollment charts
│   ├── AnalyticsSection.tsx   # Dashboard analytics
│   ├── BlogForm.tsx           # Blog post editor
│   ├── BlogList.tsx           # Blog post management
│   ├── CategoryFormDialog.tsx # Category CRUD dialog
│   ├── CategoryList.tsx       # Category management
│   ├── ContentUpload.tsx      # Media upload component
│   ├── CourseCreationForm.tsx # Course creation wizard
│   ├── CourseEditForm.tsx     # Course editor
│   ├── CourseFilters.tsx      # Course filtering
│   ├── LearningPathEditForm.tsx  # Learning path editor
│   ├── PurchaseFilters.tsx    # Purchase filtering
│   ├── SubscriptionsTable.tsx # Subscription list
│   ├── SubscriptionStats.tsx  # Subscription metrics
│   └── UserFilters.tsx        # User filtering
│
├── auth/                       # Authentication components
│   ├── AdminModeWarning.tsx   # Admin mode indicator
│   ├── OTPInput.tsx           # OTP input field
│   └── SignOutButton.tsx      # Sign out button
│
├── blog/                       # Blog components
│   ├── BlogContent.tsx        # Blog post renderer
│   ├── BlogFilters.tsx        # Blog filtering
│   ├── BlogPageClient.tsx     # Blog list client
│   └── BlogReview.tsx         # Blog review system
│
├── cart/                       # Shopping cart components
│   ├── AddToCartButton.tsx    # Add to cart action
│   ├── CartClient.tsx         # Cart UI
│   ├── CartIcon.tsx           # Cart icon with badge
│   └── CartProvider.tsx       # Cart context provider
│
├── courses/                    # Course components
│   ├── CourseActions.tsx      # Course action buttons
│   ├── CourseFilters.tsx      # Course filtering
│   └── CourseList.tsx         # Course grid/list
│
├── lessons/                    # Lesson viewer components
│   ├── LessonViewer.tsx       # Lesson content viewer
│   └── VideoPlayer.tsx        # Video player with progress
│
├── profile/                    # Profile components
│   ├── EmailChangeForm.tsx    # Email change with verification
│   ├── PasswordChangeForm.tsx # Password change
│   ├── ProfileAvatar.tsx      # Avatar upload
│   ├── ProfileForm.tsx        # Profile editor
│   └── ProfileSubscription.tsx # Subscription status
│
├── reviews/                    # Review system components
│   ├── ReviewForm.tsx         # Review submission
│   ├── ReviewList.tsx         # Review display
│   └── ReviewSection.tsx      # Review section wrapper
│
├── subscription/               # Subscription components
│   ├── PremiumBadge.tsx       # Premium indicator
│   ├── SubscriptionCard.tsx   # Plan card
│   └── SubscriptionStatus.tsx # Status display
│
└── ui/                         # Reusable UI primitives (Radix UI)
    ├── alert.tsx
    ├── avatar.tsx
    ├── badge.tsx
    ├── button.tsx
    ├── card.tsx
    ├── dropdown-menu.tsx
    ├── input.tsx
    ├── select.tsx
    ├── table.tsx
    ├── tabs.tsx
    └── ... (30+ components)
```

### Business Logic Layer

```
lib/
├── access.ts                   # Access control & authorization
├── admin/                      # Admin utilities
│   ├── analytics.ts           # Analytics calculations
│   ├── categories.ts          # Category management
│   ├── courses.ts             # Course management
│   ├── learning-paths.ts      # Learning path management
│   ├── purchases.ts           # Purchase tracking
│   ├── stats.ts               # Statistics
│   ├── subscriptions.ts       # Subscription management
│   └── users.ts               # User management
├── analytics.ts                # Analytics tracking
├── auth.ts                     # NextAuth configuration
├── auth-fallback.ts            # Auth fallback utilities
├── blog.ts                     # Blog logic
├── cache.ts                    # Caching utilities
├── cart/                       # Cart logic
│   ├── types.ts               # Cart types
│   ├── utils.ts               # Cart utilities
│   └── validation.ts          # Cart validation
├── categories.ts               # Category utilities
├── certificate-pdf.ts          # PDF generation
├── certificates.ts             # Certificate logic
├── cloudinary.ts               # Media upload
├── config.ts                   # Centralized configuration
├── courses.ts                  # Course utilities
├── email.ts                    # Email sending
├── email-verification.ts       # Email verification
├── env.ts                      # Environment validation
├── errors.ts                   # Error handling
├── homepage-stats.ts           # Homepage statistics
├── invoice-pdf.ts              # Invoice PDF generation
├── learning-paths.ts           # Learning path logic
├── lessons.ts                  # Lesson utilities
├── password.ts                 # Password hashing
├── paypal.ts                   # PayPal integration
├── prisma.ts                   # Database client
├── profile.ts                  # Profile management
├── progress.ts                 # Progress tracking
├── rate-limit.ts               # Rate limiting
├── rbac.ts                     # Role-based access control
├── reviews.ts                  # Review logic
├── seo/                        # SEO utilities
│   └── schemas.ts             # Structured data schemas
├── seo.ts                      # SEO metadata
├── subscription.ts             # Subscription logic
├── toast.ts                    # Toast notifications
├── utils.ts                    # General utilities
└── validation.ts               # Input validation
```


---

## Core System Flows

### 1. Authentication Flow

**Credentials Login:**
```
User → Sign In Page → POST /api/auth/callback/credentials
  → NextAuth validates credentials
  → bcrypt.compare(password, passwordHash)
  → Generate JWT token (30-day expiry)
  → Set session cookie
  → Redirect to dashboard/admin
```

**Google OAuth:**
```
User → Sign In Page → Click "Sign in with Google"
  → Redirect to Google OAuth consent
  → Google callback → POST /api/auth/callback/google
  → NextAuth creates/links account
  → Check existing user by email
  → Link OAuth account to existing user
  → Generate JWT token
  → Redirect to dashboard/admin
```

**JWT Token Structure:**
```typescript
{
  id: string,              // User ID
  email: string,           // User email
  name: string,            // User name
  picture: string,         // Avatar URL
  role: "customer" | "admin",
  lastRefresh: number      // Timestamp for periodic refresh
}
```

**Session Refresh Strategy:**
- JWT callback caches user data in token
- Session callback reads from cached JWT (no DB query)
- Periodic refresh every 5 minutes to sync DB changes
- Reduces DB load from N queries per request to 1 query per 5 minutes

### 2. Course Purchase Flow

**Single Course Purchase:**
```
1. User adds course to cart (client-side state)
2. User proceeds to checkout
3. POST /api/checkout → Creates PayPal order
   - Validates course availability
   - Checks inventory
   - Creates pending Purchase record
4. User redirected to PayPal
5. User approves payment on PayPal
6. PayPal redirects back with orderId
7. POST /api/payments/paypal/capture
   - Captures payment
   - Updates Purchase status to "paid"
   - Creates Enrollment record (grants access)
   - Sends invoice email
8. User redirected to /purchase/success
9. User can access course in /library
```

**Learning Path Purchase:**
```
1. User views learning path details
2. System calculates adjusted price (excludes owned courses)
3. User clicks "Enroll in Path"
4. POST /api/checkout (pathId)
   - Creates pending Purchase for each unpurchased course
   - Creates PayPal order with total price
5. Payment flow same as single course
6. On success:
   - All course purchases marked "paid"
   - Enrollments created for all courses
   - User gets access to entire path
```

### 3. Progress Tracking Flow

**Lesson Progress Update:**
```
User watches video → VideoPlayer component tracks progress
  → Debounced POST /api/progress
  → Validates user has course access
  → Upserts Progress record
  → Updates: lastPosition, completionPercent, completedAt
  → If lesson completed:
      → Check if all course lessons completed
      → If yes: Generate certificate (async)
```

**Course Completion Check:**
```
hasCompletedCourse(userId, courseId)
  → Get all lessons in course
  → Get all progress records for user
  → Check if all lessons have completedAt != null
  → Return boolean
```

### 4. Certificate Generation Flow

**Course Certificate:**
```
User completes last lesson → POST /api/progress (completed: true)
  → hasCompletedCourse() returns true
  → generateCourseCertificate() called asynchronously
  → Transaction:
      1. Check if certificate already exists
      2. If not, create Certificate record
      3. Generate unique certificateId (CERT-{timestamp}-{random})
      4. Log activity
  → Generate PDF with pdf-lib
  → Upload PDF to Cloudinary
  → Update Certificate with pdfUrl
  → Send certificate email with PDF attachment
```

**Learning Path Certificate:**
```
User completes all courses in path
  → hasCompletedLearningPath() returns true
  → generatePathCertificate() called
  → Same flow as course certificate
  → Metadata includes all course titles
```

**Certificate Verification (Public):**
```
Anyone → /certificates/[certificateId]/verify
  → GET /api/certificates/[certificateId]/verify
  → Lookup certificate by certificateId
  → Check expiration (if applicable)
  → Return: valid, studentName, courseName, issuedAt
```


### 5. Subscription Flow

**Subscription Purchase:**
```
User → /subscription → Selects plan (monthly/annual)
  → POST /api/subscription/subscribe
  → Creates PayPal subscription
  → Creates Subscription record (status: pending)
  → User redirected to PayPal
  → User approves subscription
  → PayPal webhook → POST /api/webhooks/paypal/subscription
  → Updates Subscription status to "active"
  → enrollUserInAllCourses() grants access to all courses
  → Creates Enrollment records (accessType: subscription)
```

**Subscription Cancellation:**
```
User → Profile → Cancel Subscription
  → POST /api/subscription/cancel
  → Updates Subscription status to "cancelled"
  → Sets cancelledAt timestamp
  → Access continues until endDate
  → On endDate: Cron job removes subscription enrollments
```

**Subscription vs Purchase Access:**
```
hasCourseAccess(userId, courseId)
  → Check Enrollment with accessType: "purchased" (lifetime)
  → If not found, check accessType: "subscription" (expires)
  → Return: { hasAccess: boolean, type: "purchased" | "subscription" }
```

### 6. Review System Flow

**Submit Review:**
```
User → Course page → Submit review
  → POST /api/reviews
  → Validates user has purchased course
  → Checks minimum 50% course completion
  → Creates Review record (rating 1-5, text)
  → Updates course rating average
  → Returns review
```

**Review Validation:**
```
MIN_COMPLETION_FOR_REVIEW = 50

createReview(courseId, rating, text)
  → requireCustomer() (admins cannot review)
  → hasPurchasedCourse() must be true
  → getCourseProgress() must be >= 50%
  → Upsert Review (unique: userId + courseId)
```

### 7. Admin Course Management Flow

**Create Course:**
```
Admin → /admin/courses/new
  → Fills CourseCreationForm
  → POST /api/admin/courses
  → Creates Course record (isPublished: false)
  → Creates Sections with sortOrder
  → Creates Lessons with sortOrder
  → Uploads content to Cloudinary
  → Creates LessonContent records
  → Redirects to /admin/courses/[courseId]/edit
```

**Publish Course:**
```
Admin → Edit course → Toggle "Published"
  → PATCH /api/admin/courses/[courseId]
  → Updates isPublished: true
  → Course appears in public catalog
```

**Drag-and-Drop Reordering:**
```
Admin → Edit course → Drag sections/lessons
  → Uses @dnd-kit/sortable
  → On drop: PATCH /api/admin/courses/[courseId]/reorder
  → Updates sortOrder for affected items
  → Re-renders in new order
```

---

## Security Architecture

### Authentication & Authorization

**Role-Based Access Control (RBAC):**
```typescript
enum Role {
  customer = "customer",
  admin = "admin"
}

// Middleware protection
middleware.ts:
  - /admin/* → requireRole("admin")
  - /dashboard, /library, /profile → requireUser()
  - Admins blocked from customer routes (redirect to /admin)
```

**Access Control Functions:**
```typescript
requireUser()           // Throws if not authenticated
requireRole(role)       // Throws if user lacks role
requireCustomer()       // Throws if admin (customers only)
hasPurchasedCourse()    // Check purchase status
hasCourseAccess()       // Check purchase OR subscription access
requireCourseAccess()   // Redirect if no access
```

### Security Headers (middleware.ts)

```typescript
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: (production only)
Strict-Transport-Security: max-age=31536000 (production only)
```

### Password Security

```typescript
// lib/password.ts
hashPassword(password)
  → bcrypt.hash(password, 12)  // 12 rounds

verifyPassword(password, hash)
  → bcrypt.compare(password, hash)
```

### Rate Limiting

```typescript
// lib/rate-limit.ts (Upstash Redis)
rateLimitConfig:
  - Auth endpoints: 5 attempts / 15 minutes
  - General endpoints: 100 requests / 15 minutes
  - Upload endpoints: 10 uploads / 15 minutes
```

### SQL Injection Prevention

- All database queries use Prisma ORM (parameterized queries)
- No raw SQL queries in application code
- Input validation with Zod schemas

### XSS Prevention

- React automatically escapes output
- Content-Security-Policy header in production
- Sanitize user-generated content (reviews, blog posts)

### CSRF Protection

- NextAuth.js built-in CSRF protection
- SameSite cookie attribute
- Origin validation on state-changing requests


---

## Data Flow & State Management

### Client-Side State

**Cart State (Context API):**
```typescript
// components/cart/CartProvider.tsx
CartContext:
  - items: CartItem[]
  - addItem(courseId, title, price)
  - removeItem(courseId)
  - clearCart()
  - totalItems: number
  - totalPrice: number

Storage: localStorage (persisted across sessions)
```

**Session State (NextAuth):**
```typescript
// components/providers/SessionProvider.tsx
SessionProvider wraps app
  → useSession() hook available in all components
  → session.user: { id, email, name, image, role }
  → status: "loading" | "authenticated" | "unauthenticated"
```

**Theme State (next-themes):**
```typescript
// components/providers/ThemeProvider.tsx
ThemeProvider:
  - theme: "light" | "dark" | "system"
  - setTheme(theme)
  - resolvedTheme: actual theme applied
```

### Server-Side State

**Database as Source of Truth:**
- All persistent data stored in PostgreSQL
- Prisma ORM for type-safe queries
- Connection pooling for serverless environments

**Caching Strategy:**
```typescript
// lib/cache.ts
getCached(key, fetcher, ttl)
  → Check Redis cache (if configured)
  → If miss: Call fetcher()
  → Store in cache with TTL
  → Return data

Cache Keys:
  - courses: 1 hour TTL
  - categories: 24 hours TTL
  - user progress: 5 minutes TTL
  - analytics: 30 minutes TTL
```

### Data Validation

**Input Validation (Zod):**
```typescript
// lib/validation.ts
courseSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  priceCents: z.number().int().min(0),
  categoryId: z.string().optional(),
})

// Usage in API routes
const body = courseSchema.parse(await request.json())
```

**Environment Validation:**
```typescript
// lib/env.ts
envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(32),
  PAYPAL_CLIENT_ID: z.string().optional(),
  // ... all env vars
})

validateEnv() → Throws if invalid
```

---

## Performance Optimizations

### Database Optimizations

**Connection Pooling:**
```typescript
// lib/prisma.ts
- Singleton pattern (global.prisma)
- Reuse connections in serverless
- Connection pool timeout handling
- Automatic retry on connection errors
```

**Query Optimization:**
```typescript
// Selective field selection
prisma.course.findMany({
  select: {
    id: true,
    title: true,
    priceCents: true,
    // Only fetch needed fields
  }
})

// Eager loading with include
prisma.course.findUnique({
  include: {
    Section: {
      include: {
        Lesson: true
      }
    }
  }
})

// Indexed fields
@@index([slug])
@@index([categoryId])
@@index([userId, courseId])
```

**Batch Operations:**
```typescript
// Bulk enrollments
Promise.all(
  courses.map(course =>
    prisma.enrollment.create({ ... })
  )
)
```

### Frontend Optimizations

**Code Splitting:**
```typescript
// Dynamic imports
const AdminDashboard = dynamic(() => import("@/components/admin/Dashboard"))

// Route-based splitting (automatic with App Router)
app/admin/courses/page.tsx → separate chunk
```

**Image Optimization:**
```typescript
// next/image component
<Image
  src={course.imageUrl}
  width={400}
  height={300}
  alt={course.title}
  loading="lazy"
  placeholder="blur"
/>

// Cloudinary transformations
cloudinary.url(publicId, {
  width: 400,
  height: 300,
  crop: "fill",
  quality: "auto",
  fetch_format: "auto"
})
```

**React Optimizations:**
```typescript
// Memoization
const MemoizedCourseCard = React.memo(CourseCard)

// useMemo for expensive calculations
const sortedCourses = useMemo(
  () => courses.sort((a, b) => a.title.localeCompare(b.title)),
  [courses]
)

// useCallback for stable function references
const handleAddToCart = useCallback(
  (courseId) => addItem(courseId),
  [addItem]
)
```

### Caching Strategy

**Server-Side Caching:**
```typescript
// Redis caching (optional)
- Course catalog: 1 hour
- Categories: 24 hours
- User progress: 5 minutes
- Analytics: 30 minutes

// Next.js caching
export const revalidate = 3600 // 1 hour
```

**Client-Side Caching:**
```typescript
// SWR or React Query (not currently implemented)
// Could be added for better UX

// Browser caching
Cache-Control: public, max-age=3600
```


---

## External Service Integrations

### PayPal Integration

**Configuration:**
```typescript
// lib/paypal.ts
PAYPAL_API_BASE = {
  sandbox: "https://api-m.sandbox.paypal.com",
  live: "https://api-m.paypal.com"
}

Authentication: OAuth 2.0 (client_credentials)
  → POST /v1/oauth2/token
  → Returns access_token (expires in 9 hours)
```

**Order Flow:**
```typescript
1. createPayPalOrder(items, totalCents)
   → POST /v2/checkout/orders
   → Returns orderId
   → User redirected to PayPal

2. capturePayPalOrder(orderId)
   → POST /v2/checkout/orders/{orderId}/capture
   → Returns capture details
   → Update Purchase status to "paid"
```

**Webhook Handling:**
```typescript
POST /api/webhooks/paypal
  → Verify webhook signature (HMAC-SHA256)
  → Parse event type:
      - PAYMENT.CAPTURE.COMPLETED → Mark purchase paid
      - PAYMENT.CAPTURE.REFUNDED → Mark purchase refunded
      - BILLING.SUBSCRIPTION.ACTIVATED → Activate subscription
      - BILLING.SUBSCRIPTION.CANCELLED → Cancel subscription
```

### Cloudinary Integration

**Configuration:**
```typescript
// lib/cloudinary.ts
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})
```

**Upload Flow:**
```typescript
1. Admin uploads file → POST /api/admin/upload
2. File validated (type, size)
3. Upload to Cloudinary:
   cloudinary.uploader.upload(file, {
     folder: "ai-genius-lab/courses",
     resource_type: "video" | "raw",
     eager: "sp" // Streaming profile
   })
4. Returns secure_url
5. Store URL in LessonContent
```

**Supported Content Types:**
```typescript
video: .mp4, .webm, .mov (max 500MB)
audio: .mp3, .wav, .ogg (max 100MB)
pdf: .pdf (max 50MB)
document: .doc, .docx, .txt (max 20MB)
```

### Email Service (Resend)

**Configuration:**
```typescript
// lib/email.ts
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
```

**Email Templates:**
```typescript
1. Welcome Email (on signup)
2. Purchase Confirmation (with invoice PDF)
3. Certificate Email (with certificate PDF)
4. Password Reset (with reset link)
5. Email Verification (with OTP code)
6. Subscription Confirmation
7. Subscription Cancellation
```

**Email Sending:**
```typescript
await resend.emails.send({
  from: process.env.FROM_EMAIL,
  to: user.email,
  subject: "Your Certificate",
  html: emailTemplate,
  attachments: [
    {
      filename: "certificate.pdf",
      content: pdfBuffer
    }
  ]
})
```

### Redis (Upstash) - Optional

**Configuration:**
```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
})

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m")
})
```

**Usage:**
```typescript
// In API routes
const { success } = await ratelimit.limit(identifier)
if (!success) {
  return NextResponse.json(
    { error: "Too many requests" },
    { status: 429 }
  )
}
```

---

## Error Handling

### Error Types

```typescript
// lib/errors.ts
enum ErrorCode {
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  PAYMENT_ERROR = "PAYMENT_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR"
}

class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number
  ) {
    super(message)
  }

  static unauthorized(message = "Unauthorized") {
    return new AppError(ErrorCode.UNAUTHORIZED, message, 401)
  }

  static forbidden(message = "Forbidden") {
    return new AppError(ErrorCode.FORBIDDEN, message, 403)
  }

  static notFound(message = "Not found") {
    return new AppError(ErrorCode.NOT_FOUND, message, 404)
  }
}
```

### Error Handling Pattern

```typescript
// API route pattern
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser()
    // ... business logic
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleServerError(error)
  }
}

// handleServerError function
function handleServerError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    )
  }

  if (error instanceof Error) {
    // Parse prefixed messages
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    if (error.message.startsWith("FORBIDDEN:")) {
      return NextResponse.json(
        { error: error.message.replace("FORBIDDEN: ", "") },
        { status: 403 }
      )
    }
  }

  console.error("Unhandled error:", error)
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  )
}
```

### Client-Side Error Handling

```typescript
// Toast notifications
import { toast } from "@/lib/toast"

try {
  const response = await fetch("/api/courses", { method: "POST" })
  if (!response.ok) {
    const error = await response.json()
    toast.error(error.message || "Something went wrong")
    return
  }
  toast.success("Course created successfully")
} catch (error) {
  toast.error("Network error")
}
```


---

## Known Issues & Technical Debt

### Critical Issues

1. **Race Conditions (FIXED)**
   - ✅ Certificate generation now uses `prisma.$transaction()`
   - ✅ Check-then-create pattern is atomic
   - ✅ Prevents duplicate certificates

2. **Session Performance (FIXED)**
   - ✅ JWT callback now caches user data
   - ✅ Session callback reads from cache (no DB query)
   - ✅ Periodic refresh every 5 minutes
   - ✅ Reduced DB load significantly

3. **Review Validation (FIXED)**
   - ✅ Requires minimum 50% course completion
   - ✅ Prevents spam reviews from non-engaged users

### Medium Priority Issues

4. **Cart Persistence**
   - ❌ Cart stored client-side only (localStorage)
   - ❌ No server-side cart for logged-in users
   - ❌ Cart lost if user switches devices
   - **Recommendation:** Implement server-side cart storage

5. **Database Connection Handling**
   - ⚠️ Retry logic exists but may need tuning
   - ⚠️ Connection pool settings not optimized for serverless
   - **Recommendation:** Review connection pool configuration

6. **Content Delivery**
   - ⚠️ Video streaming relies on Cloudinary
   - ⚠️ No adaptive bitrate streaming
   - ⚠️ No offline download support
   - **Recommendation:** Implement HLS/DASH streaming

7. **Search Functionality**
   - ❌ No full-text search for courses
   - ❌ Basic filtering only (category, price)
   - **Recommendation:** Implement Algolia or PostgreSQL full-text search

8. **Analytics**
   - ⚠️ Basic analytics only (revenue, enrollments)
   - ⚠️ No user behavior tracking
   - ⚠️ No A/B testing framework
   - **Recommendation:** Integrate PostHog or Mixpanel

### Low Priority Issues

9. **Dev Indicator Removal**
   - ⚠️ Extensive CSS/JS to hide Next.js dev indicators
   - ⚠️ Workaround rather than proper solution
   - **Recommendation:** Remove in production build

10. **Email Verification**
    - ⚠️ OTP-based verification implemented
    - ⚠️ No email link verification option
    - **Recommendation:** Add magic link option

11. **Internationalization**
    - ❌ No i18n support
    - ❌ Hardcoded English strings
    - **Recommendation:** Implement next-intl

12. **Accessibility**
    - ⚠️ Basic ARIA labels
    - ⚠️ No comprehensive accessibility audit
    - **Recommendation:** Run axe-core audit

### Security Considerations

13. **API Rate Limiting**
    - ⚠️ Requires Upstash Redis (optional)
    - ⚠️ No fallback rate limiting
    - **Recommendation:** Implement in-memory rate limiting

14. **Content Security**
    - ⚠️ Cloudinary URLs are public
    - ⚠️ No signed URLs for premium content
    - **Recommendation:** Implement signed URLs

15. **Audit Logging**
    - ⚠️ Basic ActivityLog model exists
    - ⚠️ Not comprehensively used
    - **Recommendation:** Log all sensitive operations

---

## Testing Strategy

### Current Test Coverage

```
__tests__/
├── components/
│   └── ui/
│       └── Button.test.tsx
├── lib/
│   ├── password.test.ts
│   ├── rbac.test.ts
│   └── utils.test.ts
├── integration/
│   └── user-flow.test.ts
└── utils/
    └── test-helpers.ts
```

### Test Types

**Unit Tests:**
```typescript
// lib/password.test.ts
describe("Password hashing", () => {
  it("should hash password correctly", async () => {
    const password = "test123"
    const hash = await hashPassword(password)
    expect(hash).not.toBe(password)
    expect(await verifyPassword(password, hash)).toBe(true)
  })
})
```

**Integration Tests:**
```typescript
// __tests__/integration/user-flow.test.ts
describe("User purchase flow", () => {
  it("should complete course purchase", async () => {
    // 1. Sign in
    // 2. Add to cart
    // 3. Checkout
    // 4. Verify enrollment
    // 5. Access course
  })
})
```

**Component Tests:**
```typescript
// __tests__/components/ui/Button.test.tsx
describe("Button component", () => {
  it("should render correctly", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText("Click me")).toBeInTheDocument()
  })
})
```

### Test Commands

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Recommended Additional Tests

1. **API Route Tests**
   - Test all API endpoints
   - Mock database calls
   - Test error handling

2. **E2E Tests (Playwright/Cypress)**
   - Complete user flows
   - Payment integration
   - Admin workflows

3. **Load Tests**
   - Database query performance
   - API endpoint throughput
   - Concurrent user handling


---

## Deployment Architecture

### Recommended Deployment Stack

**Hosting:** Vercel (optimized for Next.js)
- Automatic deployments from Git
- Edge network (CDN)
- Serverless functions
- Environment variable management
- Preview deployments for PRs

**Database:** Neon (Serverless PostgreSQL)
- Connection pooling built-in
- Automatic scaling
- Branching for development
- Point-in-time recovery
- Free tier available

**Media Storage:** Cloudinary
- CDN delivery
- Image/video optimization
- Transformation API
- Streaming support

**Email:** Resend
- Transactional emails
- High deliverability
- Email analytics
- Template management

**Caching (Optional):** Upstash Redis
- Serverless Redis
- Rate limiting
- Session storage
- Cache layer

### Environment Variables

**Required:**
```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="<32+ character secret>"
```

**Payment (Required for checkout):**
```bash
PAYPAL_ENV="sandbox" | "live"
PAYPAL_CLIENT_ID="..."
PAYPAL_CLIENT_SECRET="..."
PAYPAL_WEBHOOK_ID="..."
```

**Media (Required for uploads):**
```bash
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

**Email (Required for notifications):**
```bash
RESEND_API_KEY="..."
FROM_EMAIL="noreply@yourdomain.com"
SUPPORT_EMAIL="support@yourdomain.com"
```

**OAuth (Optional):**
```bash
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

**Caching (Optional):**
```bash
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."
```

### Deployment Checklist

**Pre-Deployment:**
- [ ] Run `npm run build` locally
- [ ] Run `npm test` (all tests pass)
- [ ] Run `npm run lint` (no errors)
- [ ] Review environment variables
- [ ] Test database migrations
- [ ] Verify PayPal webhook configuration
- [ ] Test email delivery
- [ ] Review security headers

**Production Configuration:**
- [ ] Set `NODE_ENV=production`
- [ ] Use production database
- [ ] Use live PayPal credentials
- [ ] Configure custom domain
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Set up monitoring (Vercel Analytics)
- [ ] Configure error tracking (Sentry recommended)
- [ ] Set up backup strategy
- [ ] Configure CDN caching
- [ ] Review rate limiting

**Post-Deployment:**
- [ ] Verify homepage loads
- [ ] Test authentication flow
- [ ] Test course purchase (small amount)
- [ ] Verify email delivery
- [ ] Test admin dashboard
- [ ] Monitor error logs
- [ ] Check database connections
- [ ] Verify webhook delivery

### Scaling Considerations

**Database Scaling:**
```
Current: Single PostgreSQL instance
Recommended:
  - Read replicas for analytics queries
  - Connection pooling (PgBouncer)
  - Query optimization
  - Indexing strategy review
```

**API Scaling:**
```
Current: Serverless functions (auto-scale)
Considerations:
  - Cold start optimization
  - Function timeout limits (10s on Vercel)
  - Memory allocation tuning
  - Edge function migration for auth
```

**Media Scaling:**
```
Current: Cloudinary CDN
Considerations:
  - Bandwidth limits
  - Storage limits
  - Transformation quotas
  - Video streaming optimization
```

**Caching Strategy:**
```
Current: Optional Redis caching
Recommended:
  - Implement Redis for high-traffic routes
  - Cache course catalog
  - Cache user sessions
  - Cache analytics data
```

---

## Monitoring & Observability

### Recommended Tools

**Application Monitoring:**
- Vercel Analytics (built-in)
- Sentry (error tracking)
- LogRocket (session replay)

**Database Monitoring:**
- Neon dashboard (query performance)
- Prisma Studio (data inspection)
- Custom analytics queries

**Performance Monitoring:**
- Vercel Speed Insights
- Lighthouse CI
- Web Vitals tracking

**Uptime Monitoring:**
- Vercel status page
- UptimeRobot
- Pingdom

### Key Metrics to Track

**Business Metrics:**
- Daily/Monthly Active Users (DAU/MAU)
- Course purchase conversion rate
- Average order value
- Subscription churn rate
- Customer lifetime value (LTV)
- Revenue (MRR/ARR)

**Technical Metrics:**
- API response times (p50, p95, p99)
- Database query performance
- Error rates by endpoint
- Cache hit rates
- CDN bandwidth usage
- Function execution time

**User Experience Metrics:**
- Page load time (LCP, FID, CLS)
- Time to interactive (TTI)
- Video buffering rate
- Checkout abandonment rate
- Course completion rate

### Logging Strategy

**Application Logs:**
```typescript
// Structured logging
console.log({
  level: "info",
  message: "Course purchased",
  userId: user.id,
  courseId: course.id,
  amount: purchase.amountCents,
  timestamp: new Date().toISOString()
})
```

**Error Logs:**
```typescript
// Error tracking
try {
  // ... operation
} catch (error) {
  console.error({
    level: "error",
    message: error.message,
    stack: error.stack,
    context: { userId, courseId },
    timestamp: new Date().toISOString()
  })
  // Send to Sentry
}
```

**Audit Logs:**
```typescript
// ActivityLog model
await prisma.activityLog.create({
  data: {
    id: generateId(),
    userId: user.id,
    type: "course_purchased",
    metadata: {
      courseId,
      amount,
      paymentProvider: "paypal"
    }
  }
})
```


---

## Development Workflow

### Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/SingasonSimon/AI-Genius-Lab.git
cd ai-genius-lab

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Set up database
npx prisma migrate dev
npm run db:seed

# 5. Start development server
npm run dev
```

### Development Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report

# Database
npm run db:push          # Push schema changes (dev)
npm run db:seed          # Seed database
npm run db:seed:simple   # Seed with minimal data
npm run db:seed:2026     # Seed with 2026 data
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Create migration
npx prisma migrate deploy # Deploy migrations (prod)
npx prisma generate      # Regenerate Prisma Client

# Cleanup
npm run clean            # Remove .next directory
```

### Git Workflow

**Branch Strategy:**
```
main              → Production branch
develop           → Development branch
feature/*         → Feature branches
bugfix/*          → Bug fix branches
hotfix/*          → Hotfix branches
```

**Commit Convention:**
```
feat: Add subscription management
fix: Resolve certificate generation race condition
docs: Update API documentation
style: Format code with Prettier
refactor: Simplify progress tracking logic
test: Add integration tests for checkout
chore: Update dependencies
```

### Code Review Checklist

**Functionality:**
- [ ] Code works as intended
- [ ] Edge cases handled
- [ ] Error handling implemented
- [ ] Input validation present

**Security:**
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Authentication/authorization checked
- [ ] Sensitive data not logged

**Performance:**
- [ ] No N+1 queries
- [ ] Appropriate indexes used
- [ ] Caching implemented where needed
- [ ] No unnecessary re-renders

**Code Quality:**
- [ ] TypeScript types correct
- [ ] No `any` types
- [ ] Code is readable
- [ ] Functions are small and focused
- [ ] DRY principle followed

**Testing:**
- [ ] Unit tests added
- [ ] Integration tests added (if applicable)
- [ ] Tests pass locally
- [ ] Coverage maintained/improved

---

## API Documentation

### Authentication Endpoints

**POST /api/auth/signup**
```typescript
Request:
{
  email: string,
  password: string,
  name?: string
}

Response:
{
  user: {
    id: string,
    email: string,
    name: string,
    role: "customer"
  }
}

Errors:
- 400: Invalid input
- 409: Email already exists
```

**POST /api/auth/callback/credentials**
```typescript
Request:
{
  email: string,
  password: string
}

Response:
{
  session: {
    user: {
      id: string,
      email: string,
      name: string,
      role: "customer" | "admin"
    }
  }
}

Errors:
- 401: Invalid credentials
```

**GET /api/auth/session**
```typescript
Response:
{
  user: {
    id: string,
    email: string,
    name: string,
    image: string,
    role: "customer" | "admin",
    emailVerified: Date | null
  }
}

Errors:
- 401: Not authenticated
```

### Course Endpoints

**GET /api/courses**
```typescript
Query Params:
- category?: string
- search?: string
- limit?: number
- offset?: number

Response:
{
  courses: [
    {
      id: string,
      slug: string,
      title: string,
      description: string,
      priceCents: number,
      category: string,
      isPublished: boolean
    }
  ],
  total: number
}
```

**GET /api/courses/[courseId]/ownership**
```typescript
Response:
{
  owned: boolean
}

Requires: Authentication
```

### Progress Endpoints

**POST /api/progress**
```typescript
Request:
{
  lessonId: string,
  lastPosition?: number,
  completionPercent?: number,
  completed?: boolean
}

Response:
{
  progress: {
    id: string,
    userId: string,
    lessonId: string,
    startedAt: Date,
    completedAt: Date | null,
    lastPosition: number,
    completionPercent: number
  }
}

Requires: Authentication, Course access
Errors:
- 401: Not authenticated
- 403: No course access
- 404: Lesson not found
```

**GET /api/progress?lessonId={lessonId}**
```typescript
Response:
{
  progress: {
    id: string,
    lastPosition: number,
    completionPercent: number,
    completedAt: Date | null
  } | null
}

Requires: Authentication
```

### Certificate Endpoints

**POST /api/certificates/generate**
```typescript
Request:
{
  courseId?: string,
  pathId?: string
}

Response:
{
  certificate: {
    id: string,
    certificateId: string,
    type: "course" | "learning_path",
    issuedAt: Date,
    pdfUrl: string
  }
}

Requires: Authentication, Course completion
Errors:
- 400: Course not completed
- 403: Course not purchased
```

**GET /api/certificates/[certificateId]/verify**
```typescript
Response:
{
  valid: boolean,
  certificate?: {
    type: "course" | "learning_path",
    studentName: string,
    courseName?: string,
    pathName?: string,
    issuedAt: Date,
    expiresAt: Date | null
  },
  error?: string
}

Public endpoint (no auth required)
```

### Payment Endpoints

**POST /api/checkout**
```typescript
Request:
{
  items: [
    {
      courseId: string,
      priceCents: number
    }
  ],
  pathId?: string
}

Response:
{
  orderId: string,
  approvalUrl: string
}

Requires: Authentication
Errors:
- 400: Invalid items
- 404: Course not found
- 409: Already purchased
```

**POST /api/payments/paypal/capture**
```typescript
Request:
{
  orderId: string
}

Response:
{
  success: boolean,
  purchases: [
    {
      id: string,
      courseId: string,
      status: "paid"
    }
  ]
}

Requires: Authentication
Errors:
- 400: Invalid order
- 402: Payment failed
```

### Subscription Endpoints

**GET /api/subscription/plans**
```typescript
Response:
{
  plans: [
    {
      id: "monthly" | "annual",
      name: string,
      priceCents: number,
      interval: "month" | "year",
      features: string[],
      popular?: boolean
    }
  ]
}

Public endpoint
```

**POST /api/subscription/subscribe**
```typescript
Request:
{
  planType: "monthly" | "annual"
}

Response:
{
  subscriptionId: string,
  approvalUrl: string
}

Requires: Authentication
Errors:
- 409: Already subscribed
```

**POST /api/subscription/cancel**
```typescript
Request:
{
  subscriptionId: string
}

Response:
{
  success: boolean,
  subscription: {
    id: string,
    status: "cancelled",
    cancelledAt: Date,
    endDate: Date
  }
}

Requires: Authentication
Errors:
- 404: Subscription not found
- 403: Not your subscription
```


---

## Configuration Management

### Centralized Configuration (lib/config.ts)

All hardcoded data and configuration is centralized in `lib/config.ts`:

**Site Configuration:**
```typescript
siteConfig: {
  name: "AI Genius Lab",
  description: "...",
  url: process.env.NEXTAUTH_URL,
  keywords: [...],
  links: { email, github, docs }
}
```

**Business Information:**
```typescript
contactInfo: {
  email: process.env.SUPPORT_EMAIL,
  phone: process.env.SUPPORT_PHONE,
  address: { line1, line2, city, state, zip, country }
}

businessHours: {
  weekdays: "9:00 AM - 6:00 PM",
  saturday: "10:00 AM - 4:00 PM",
  sunday: "Closed",
  timezone: "UTC"
}
```

**Default Categories:**
```typescript
defaultCategories: [
  {
    id: "cat_business_001",
    name: "Make Money & Business",
    slug: "business",
    icon: "DollarSign",
    color: "#10B981"
  },
  // ... more categories
]
```

**Payment Configuration:**
```typescript
paymentConfig: {
  paypal: {
    sandbox: { clientId, clientSecret, webhookId },
    currency: "USD"
  },
  invoice: {
    prefix: "INV-",
    taxRate: 0
  }
}
```

**Content Configuration:**
```typescript
contentConfig: {
  supportedTypes: {
    video: { extensions: ['.mp4', '.webm'], maxSize: '500MB' },
    audio: { extensions: ['.mp3', '.wav'], maxSize: '100MB' },
    pdf: { extensions: ['.pdf'], maxSize: '50MB' }
  }
}
```

**Rate Limiting:**
```typescript
rateLimitConfig: {
  windowMs: 15 * 60 * 1000,
  max: {
    auth: 5,
    general: 100,
    upload: 10
  }
}
```

**Caching:**
```typescript
cacheConfig: {
  ttl: {
    courses: 3600,
    categories: 86400,
    userProgress: 300,
    analytics: 1800
  }
}
```

### Environment-Based Configuration

Configuration values can be overridden via environment variables:

```bash
# Site
NEXTAUTH_URL="https://yourdomain.com"

# Contact
SUPPORT_EMAIL="support@yourdomain.com"
SUPPORT_PHONE="+1 (555) 123-4567"

# Address
ADDRESS_LINE_1="123 Learning Street"
ADDRESS_CITY="San Francisco"
ADDRESS_STATE="CA"
ADDRESS_ZIP="94102"
ADDRESS_COUNTRY="United States"

# Default Users
DEFAULT_ADMIN_EMAIL="admin@aigeniuslab.com"
DEFAULT_ADMIN_PASSWORD="password123"
DEFAULT_CUSTOMER_EMAIL="customer@aigeniuslab.com"
DEFAULT_CUSTOMER_PASSWORD="password123"
```

---

## Future Enhancements

### Short-Term (1-3 months)

1. **Enhanced Search**
   - Full-text search with PostgreSQL
   - Filters: price range, difficulty, duration
   - Sort: popularity, rating, newest

2. **Course Recommendations**
   - Based on purchase history
   - Based on progress
   - Collaborative filtering

3. **Mobile App**
   - React Native app
   - Offline course downloads
   - Push notifications

4. **Advanced Analytics**
   - Student engagement metrics
   - Course completion funnels
   - Revenue attribution

5. **Email Campaigns**
   - Welcome series
   - Course recommendations
   - Re-engagement campaigns

### Medium-Term (3-6 months)

6. **Live Classes**
   - WebRTC integration
   - Scheduled sessions
   - Recording and replay

7. **Discussion Forums**
   - Course-specific forums
   - Q&A system
   - Instructor responses

8. **Gamification**
   - Points and badges
   - Leaderboards
   - Achievements

9. **Affiliate Program**
   - Referral tracking
   - Commission management
   - Affiliate dashboard

10. **Multi-Language Support**
    - i18n implementation
    - Translated content
    - RTL support

### Long-Term (6-12 months)

11. **AI-Powered Features**
    - Personalized learning paths
    - Automated content recommendations
    - Chatbot support

12. **Enterprise Features**
    - Team accounts
    - Bulk licensing
    - Custom branding
    - SSO integration

13. **Advanced Content Types**
    - Interactive coding exercises
    - Quizzes and assessments
    - Virtual labs
    - AR/VR experiences

14. **Marketplace**
    - Instructor onboarding
    - Revenue sharing
    - Content moderation
    - Instructor analytics

15. **Advanced Certifications**
    - Proctored exams
    - Industry-recognized certificates
    - Blockchain verification
    - LinkedIn integration

---

## Troubleshooting Guide

### Common Issues

**Issue: Database connection timeout**
```
Error: P2024: Timed out fetching a new connection from the pool
```
Solution:
- Check DATABASE_URL includes connection pooling params
- Verify database is accessible
- Review connection pool settings
- Use `withRetry()` wrapper for resilience

**Issue: NextAuth session not persisting**
```
Error: Session is null after sign in
```
Solution:
- Verify NEXTAUTH_SECRET is set (32+ characters)
- Check NEXTAUTH_URL matches your domain
- Clear browser cookies
- Check database Session table

**Issue: PayPal payment not capturing**
```
Error: PAYMENT_CAPTURE_FAILED
```
Solution:
- Verify PayPal credentials (sandbox vs live)
- Check webhook configuration
- Review PayPal dashboard for errors
- Ensure order is in APPROVED state

**Issue: Cloudinary upload failing**
```
Error: Upload failed with status 401
```
Solution:
- Verify Cloudinary credentials
- Check file size limits
- Verify resource_type matches content
- Review Cloudinary dashboard quotas

**Issue: Email not sending**
```
Error: Failed to send email
```
Solution:
- Verify Resend API key
- Check FROM_EMAIL is verified domain
- Review Resend dashboard for errors
- Check email template syntax

**Issue: Certificate not generating**
```
Error: Course not completed
```
Solution:
- Verify all lessons have completedAt timestamp
- Check Progress records for user
- Review course structure (sections/lessons)
- Check certificate generation logs

### Debug Endpoints (Admin Only)

**POST /api/debug/access-check**
```typescript
Request:
{
  userId: string,
  courseId: string
}

Response:
{
  hasPurchase: boolean,
  hasEnrollment: boolean,
  hasSubscription: boolean,
  hasAccess: boolean
}
```

**POST /api/debug/content-check**
```typescript
Request:
{
  lessonId: string
}

Response:
{
  lesson: { ... },
  content: [ ... ],
  cloudinaryStatus: "exists" | "missing"
}
```

⚠️ **Important:** Remove debug endpoints in production!

---

## Glossary

**Terms:**

- **Course:** A collection of sections and lessons on a specific topic
- **Section:** A group of related lessons within a course
- **Lesson:** Individual learning unit (video, PDF, etc.)
- **Learning Path:** Curated sequence of courses
- **Enrollment:** User's access to a course (purchased or subscription)
- **Progress:** User's completion status for lessons
- **Certificate:** Proof of course/path completion
- **Purchase:** One-time course purchase transaction
- **Subscription:** Recurring payment for all-access
- **Review:** User rating and feedback for a course

**Acronyms:**

- **LMS:** Learning Management System
- **RBAC:** Role-Based Access Control
- **JWT:** JSON Web Token
- **ORM:** Object-Relational Mapping
- **CDN:** Content Delivery Network
- **SSR:** Server-Side Rendering
- **CSR:** Client-Side Rendering
- **API:** Application Programming Interface
- **CRUD:** Create, Read, Update, Delete
- **TTL:** Time To Live (cache duration)
- **MRR:** Monthly Recurring Revenue
- **ARR:** Annual Recurring Revenue
- **LTV:** Lifetime Value
- **DAU:** Daily Active Users
- **MAU:** Monthly Active Users

---

## Conclusion

AI Genius Lab is a comprehensive, production-ready LMS built with modern technologies and best practices. The system is designed for scalability, security, and maintainability.

**Key Strengths:**
- ✅ Type-safe with TypeScript
- ✅ Secure authentication and authorization
- ✅ Comprehensive course management
- ✅ Automated certificate generation
- ✅ Payment processing with PayPal
- ✅ Subscription management
- ✅ Progress tracking
- ✅ Admin dashboard with analytics
- ✅ Responsive design
- ✅ SEO optimized

**Areas for Improvement:**
- Server-side cart persistence
- Full-text search
- Advanced analytics
- Mobile app
- Internationalization
- Enhanced content delivery

**Next Steps:**
1. Review and fix identified issues
2. Implement recommended enhancements
3. Conduct security audit
4. Perform load testing
5. Deploy to production

For questions or support, contact: support@aigeniuslab.com

---

**Document Version:** 1.0  
**Last Updated:** January 27, 2026  
**Maintained By:** AI Genius Lab Development Team
