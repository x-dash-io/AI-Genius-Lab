# SYNAPZE MVP Build Plan

## Scope

- Greenfield build focused on MVP core: auth, courses, purchases, pay-gated access, learner library, and progress tracking.
- Payment provider: PayPal (implemented) - Note: Plan originally mentioned Stripe, but PayPal was implemented instead.
- Auth: Auth.js with Credentials (email/password) and JWT/session hybrid.

## Architecture Overview

- Next.js App Router with server components and server actions for protected data flows.
- Prisma + PostgreSQL (Neon recommended) with strict relational integrity.
- PayPal Checkout + webhook verification for granting access.
- Cloudinary for media URLs; signed URL generation behind server actions.
```mermaid
flowchart LR
  Guest[Guest] --> PublicPages[PublicPages]
  Learner[Learner] -->|auth| AppUI[AppUI]
  AppUI --> ServerActions[ServerActions_API]
  ServerActions --> Auth[Authjs]
  ServerActions --> Prisma[Prisma]
  Prisma --> Postgres[PostgreSQL]
  ServerActions --> Stripe[StripeAPI]
  Stripe --> Webhook[StripeWebhook]
  Webhook --> Prisma
  ServerActions --> Cloudinary[CloudinarySignedURL]
```


## Key Files/Dirs (Implemented)

- App: [`app`](app) with public pages and authenticated dashboard routes. ✅
- Auth: `[app/api/auth/[...nextauth]/route.ts](app/api/auth/[...nextauth]/route.ts)`, [`lib/auth.ts`](lib/auth.ts). ✅
- Payments: [`app/api/webhooks/paypal/route.ts`](app/api/webhooks/paypal/route.ts), [`lib/paypal.ts`](lib/paypal.ts). ✅
- Access control: [`lib/rbac.ts`](lib/rbac.ts), [`lib/access.ts`](lib/access.ts) for `hasPurchased()` checks on server actions. ✅
- Prisma: [`prisma/schema.prisma`](prisma/schema.prisma) and [`prisma/seed.ts`](prisma/seed.ts). ✅
- Core UI: `[app/(public)](app/\\\\(public))`, `[app/(app)](app/\\\\(app))` with shared layouts. ✅

## Implementation Status

1) ✅ Bootstrap Next.js app (App Router, Tailwind, shadcn/ui) and basic layouts for public vs authenticated routes.

2) ✅ Implement Auth.js credentials flow with secure password hashing, JWT/session config, and server-side role enforcement.

3) ✅ Define Prisma schema for users/roles/courses/sections/lessons/purchases/enrollments/progress and run initial migrations.

4) ✅ Implement course catalog and detail pages (public), course library (authenticated), and lesson viewer with progress tracking.

5) ✅ Add PayPal Checkout flow and webhook verification to grant purchases, then enforce `hasPurchased(courseId)` in server actions.

## Recent Fixes (2025-01-22)

- ✅ Fixed checkout page middleware blocking public access
- ✅ Improved checkout page UI to match design system
- ✅ Fixed PayPal return URL to point to capture route
- ✅ Fixed Server Component using framer-motion (split into client component)

## Access Control (Server-side)

- All lesson content and signed media URLs served from server actions/API routes after `hasPurchased()` + role checks.
- Public routes show previews only (no full media URLs).

## Testing/Verification

- Manual flows: sign up, buy course via PayPal sandbox mode, confirm webhook grant, access course, update progress.
- Verify unauthorized access cannot fetch lesson content or files.

## Remaining TODOs

### High Priority
- [ ] Test complete checkout flow end-to-end with PayPal sandbox
- [ ] Verify Cloudinary integration for signed media URLs
- [ ] Ensure lesson content access control is enforced on all routes
- [ ] Add error handling and user feedback for failed payments
- [ ] Test webhook verification and payment processing

### Medium Priority
- [ ] Add loading states for checkout process
- [ ] Implement progress tracking UI updates
- [ ] Add course purchase confirmation emails
- [ ] Verify all access control checks are in place

### Low Priority
- [ ] Update landing page to reflect PayPal instead of Stripe
- [ ] Add analytics/tracking for purchases
- [ ] Improve error messages and user feedback