# AI Genius Lab - Codebase Overview

## Project Summary

**AI Genius Lab** is a full-stack Learning Management System (LMS) built with modern web technologies. It allows administrators to create and manage courses, while students can purchase, consume content, track progress, and earn certificates.

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Database** | PostgreSQL via Prisma ORM 6.4 |
| **Auth** | NextAuth.js 4 (JWT strategy) |
| **Styling** | Tailwind CSS 4 + Radix UI |
| **Payments** | PayPal (sandbox/live) |
| **Media Storage** | Cloudinary |
| **Email** | Resend / Nodemailer |
| **Caching** | Upstash Redis (optional) |
| **Analytics** | Vercel Analytics |

---

## Project Structure

```
ai-genius-lab/
├── app/
│   ├── (admin)/          # Admin dashboard (protected)
│   │   └── admin/
│   │       ├── categories/
│   │       ├── courses/
│   │       ├── learning-paths/
│   │       ├── purchases/
│   │       └── users/
│   ├── (app)/            # Authenticated user routes
│   │   ├── dashboard/
│   │   ├── library/
│   │   ├── profile/
│   │   ├── activity/
│   │   └── purchase/
│   ├── (public)/         # Public pages
│   │   ├── courses/
│   │   ├── learning-paths/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   └── api/              # API endpoints
│       ├── auth/
│       ├── cart/
│       ├── certificates/
│       ├── checkout/
│       ├── courses/
│       ├── payments/
│       ├── progress/
│       ├── reviews/
│       └── webhooks/
├── components/
│   ├── admin/            # Admin-specific components
│   ├── auth/             # Auth forms
│   ├── cart/             # Shopping cart components
│   ├── checkout/         # Checkout flow
│   ├── courses/          # Course display components
│   ├── layout/           # Navigation, footer, sidebar
│   ├── profile/          # User profile components
│   ├── reviews/          # Review system
│   └── ui/               # Reusable UI primitives
├── lib/                  # Core business logic
│   ├── admin/            # Admin utilities
│   ├── cart/             # Cart logic
│   ├── seo/              # SEO utilities
│   └── *.ts              # Domain modules
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/
└── __tests__/            # Jest test suites
```

---

## Database Schema (Key Models)

### User Management
- **User** - Core user entity with roles (`admin`, `customer`)
- **Account** - OAuth provider accounts
- **Session** - User sessions
- **VerificationToken** - Email verification tokens

### Course Content
- **Course** - Main course entity with title, description, price
- **Section** - Course sections (sortable)
- **Lesson** - Individual lessons within sections
- **LessonContent** - Lesson materials (video, pdf, audio, link, file)
- **Category** - Course categorization

### Learning Paths
- **LearningPath** - Grouped courses as a curriculum
- **LearningPathCourse** - Junction table with sort order

### Commerce
- **Purchase** - Course purchase records (pending/paid/refunded)
- **Payment** - Payment transaction records
- **Enrollment** - User enrollment in courses (linked to purchase)

### Progress & Achievements
- **Progress** - Lesson progress (start, completion, position)
- **Certificate** - Issued certificates (course or learning_path)
- **Review** - User reviews with ratings

### Audit
- **ActivityLog** - User activity tracking

---

## Authentication Flow

1. **Credentials Login**: Email/password via `bcryptjs` hashing
2. **Google OAuth**: Via NextAuth Google provider
3. **JWT Strategy**: 30-day session tokens
4. **Role-Based Access**: `admin` and `customer` roles

### Middleware Protection (`middleware.ts`)
- `/admin/*` routes require admin role
- `/dashboard`, `/library`, `/profile`, `/activity` require authentication
- Admins are blocked from `/library` and `/activity` (redirected to `/admin`)
- Security headers applied (CSP, HSTS, XSS protection)

---

## Key Business Logic

### Access Control (`lib/access.ts`)
- `requireUser()` - Throws if not authenticated
- `requireRole(role)` - Throws if user lacks required role
- `hasPurchasedCourse(userId, courseId)` - Check purchase status
- `hasCourseAccess(userId, role, courseId)` - Admins have full access

### Course Progress (`lib/progress.ts`)
- `updateLessonProgress()` - Upsert progress with validation
- `getCourseProgress()` - Calculate completion percentage
- Progress includes: `startedAt`, `completedAt`, `lastPosition`, `completionPercent`

### Certificate Generation (`lib/certificates.ts`)
- `hasCompletedCourse()` - Checks all lessons are completed
- `generateCourseCertificate()` - Creates certificate + PDF + email
- `verifyCertificate()` - Public verification endpoint
- Certificates have unique IDs: `CERT-{timestamp}-{random}`

### Payment Processing (`lib/paypal.ts`)
- `createPayPalOrder()` - Creates checkout order
- `capturePayPalOrder()` - Captures payment after approval
- `verifyPayPalWebhook()` - Validates webhook signatures

### Learning Paths (`lib/learning-paths.ts`)
- `calculateLearningPathPrice()` - Adjusts price for already-purchased courses
- `hasEnrolledInLearningPath()` - Checks all path courses are purchased
- `createLearningPathPurchases()` - Creates pending purchases for unpurchased courses

---

## Issues Fixed (Session: Jan 26, 2026)

### ✅ 1. **Learning Path Slug Added**
- Added `slug` field to `LearningPath` model in `prisma/schema.prisma`
- Updated `getLearningPathBySlug()` in `lib/learning-paths.ts` to use proper slug lookup

### ✅ 2. **Certificate Generation Race Condition Fixed**
- Both `generateCourseCertificate()` and `generatePathCertificate()` now use `prisma.$transaction()` 
- Check-then-create pattern is now atomic to prevent duplicate certificates

### ✅ 3. **Session Callback Optimized**
- JWT callback now caches user data (name, email, image, role) in the token
- DB refresh only happens every 5 minutes instead of on every request
- Session callback reads from cached JWT data instead of querying DB

### ✅ 4. **Review Completion Check Added**
- `createReview()` now requires minimum 50% course completion
- Defined constant `MIN_COMPLETION_FOR_REVIEW = 50`

### ✅ 5. **Refund Re-purchase Already Handled**
- Existing `upsert` pattern in checkout already handles re-purchases after refunds
- No additional changes needed

### ✅ 6. **Error Handling Enhanced**
- `lib/errors.ts` now has typed `ErrorCode` enum
- `AppError` class has static factory methods: `.unauthorized()`, `.forbidden()`, `.notFound()`, etc.
- `handleServerError()` parses prefixed messages like `"FORBIDDEN: custom message"`
- Handles validation-like messages (containing "must", "required", "invalid", etc.)

---

## Remaining Areas for Review

### 1. **Database Connection Handling**
- `lib/prisma.ts` has retry logic for connection pool timeouts
- Consider reviewing connection pool settings for serverless deployment

### 2. **Dev Indicator Removal**
- `app/layout.tsx` has extensive CSS/JS to hide Next.js dev indicators
- This is a workaround rather than a proper solution

### 3. **Cart Implementation**
- Cart is stored client-side (context provider)
- No server-side cart persistence for logged-in users

---

## Configuration Files

| File | Purpose |
|------|---------|
| `.env.local` | Environment variables (secrets) |
| `prisma/schema.prisma` | Database schema |
| `middleware.ts` | Route protection & security headers |
| `next.config.ts` | Next.js configuration |
| `tailwind.config.ts` | Tailwind CSS configuration |
| `tsconfig.json` | TypeScript configuration |

---

## Default Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@aigeniuslab.com | password123 |
| Customer | customer@aigeniuslab.com | password123 |

---

## Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run db:push      # Push schema changes
npm run db:seed      # Seed database
npx prisma studio    # Open database GUI
```

---

## Next Steps for Bug Fixing

Ready to review and fix:
1. Logic issues in business rules
2. Race conditions
3. Missing validations
4. Error handling improvements
5. Performance optimizations

Let me know which areas you'd like to focus on!
