# UI/UX Refactor Plan: Premium Enterprise LMS + Ecommerce

## Scope and Objective
This document defines the implementation plan for a full presentation-layer refactor of the existing Next.js LMS + ecommerce product into a premium enterprise UI. The backend contract, route topology, business logic, auth model, and commerce behavior remain unchanged.

## Current-State Audit (Repository Ground Truth)

### Runtime and Stack
- Framework: Next.js App Router (`app/`) with TypeScript.
- Styling: Tailwind CSS v4 + custom CSS in `app/globals.css`.
- UI primitives: Radix-based components in `components/ui/*`.
- Auth/session: NextAuth with role-based layout switching.
- Data: Prisma + PostgreSQL.
- Animations: Framer Motion in multiple layout and marketing surfaces.

### Layout and Routing Model
- Route groups:
- `app/(public)`
- `app/(app)`
- `app/(admin)`
- Total route pages discovered: `56` (`page.tsx` files).
- Server layout guards:
- `app/(public)/layout.tsx` routes session users to app/admin shells.
- `app/(app)/layout.tsx` requires auth and redirects unauthenticated users.
- `app/(admin)/layout.tsx` enforces `admin` role.

### Component Surface
- Total components in `components/`: 122 files.
- Existing primitives in `components/ui`: 34 files.
- Existing style state is mixed (premium gradient utilities, legacy glass classes, ad hoc color usage, duplicated layout logic in separate shells).

### Quality Baseline (Run on February 11, 2026)
- `npm run lint`: fails (508 issues, 307 errors, 201 warnings; mostly legacy typing/lint debt).
- `npm test -- --runInBand`: fails (database connectivity in integration suites + some transform/assertion failures).
- `npm run build`: passes.

## Route Map by Domain

### Public domain
- `/`
- `/courses`, `/courses/:courseId`, `/courses/category/:category`
- `/learning-paths`, `/learning-paths/:pathId`
- `/cart`, `/checkout`, `/checkout/subscription`
- `/pricing`
- `/blog`, `/blog/:slug`
- `/about`, `/contact`, `/faq`, `/testimonials`, `/instructors`
- `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`
- `/certificates/:certificateId`, `/certificates/verify/:certificateId`
- `/privacy`, `/terms`

### Authenticated learner domain
- `/dashboard`
- `/library`, `/library/:courseId`, `/library/:courseId/lesson/:lessonId`
- `/activity`
- `/profile`, `/profile/subscription`
- `/purchase/success`
- `/checkout/subscription/success`

### Admin domain
- `/admin`
- `/admin/courses*`
- `/admin/learning-paths*`
- `/admin/categories`
- `/admin/users*`
- `/admin/purchases`
- `/admin/coupons*`
- `/admin/subscriptions/plans`, `/admin/subscriptions/users`
- `/admin/blog*`
- `/admin/testimonials`
- `/admin/settings`
- `/admin/profile`

## Functional Flows to Preserve
1. Guest browse and discovery across courses/paths/blog.
2. Auth lifecycle: sign up, OTP verification, sign in, reset password.
3. Commerce: cart operations, coupon operations, checkout handoff, success states.
4. Subscription lifecycle: plan selection, interval toggle, success and profile management.
5. Learning lifecycle: library access, lesson consumption, progress tracking, activity updates.
6. Certificate lifecycle: generation checks, view/verify/download.
7. Admin CRUD lifecycle across catalog, subscriptions, users, coupons, content, settings.
8. Admin preview links (`?preview=true`) from admin shell.

## Design and IA Decisions

### Shell strategy
- Standardize three shells with shared primitives:
- `PublicShell`
- `AppShell`
- `AdminShell`
- Normalize layout anatomy across all shells:
- top navigation/header
- left navigation on desktop (app/admin)
- mobile drawer navigation
- consistent content container and footer

### Visual strategy
- Enterprise minimalist baseline (neutral grays, crisp hierarchy, low-noise surfaces).
- Optional glass mode via explicit UI preference (`solid` default, `glass` optional).
- Token-only approach for color, spacing, radius, elevation, blur, and motion.

### Accessibility strategy
- Keyboard-first navigation in shell and menus.
- Persistent visible focus style.
- Contrast-safe foreground/background pairs for both solid and glass modes.
- `prefers-reduced-motion` respected globally.

## Dependency Decisions
- Keep current stack: Tailwind + Radix + existing auth/context/data setup.
- Add only missing primitive dependencies when needed:
- `@radix-ui/react-dialog`
- `@radix-ui/react-checkbox`
- `@radix-ui/react-radio-group`
- No backend/schema/auth contract changes planned.

## Risks and Mitigations

### Risk: Broad visual regressions across 56 routes
- Mitigation: refactor shared shells + shared primitives first to maximize controlled impact.

### Risk: Existing lint/test debt obscures regressions
- Mitigation: compare against documented baseline and avoid unrelated behavior changes.

### Risk: Dark mode and glass contrast regressions
- Mitigation: tokenized contrast pairs and constrained glass application only on surface layers.

### Risk: Mobile navigation regressions
- Mitigation: single-source nav config per shell and explicit mobile drawer implementation.

## Phased Implementation Milestones

### Phase 0: Documentation and baseline capture
- Deliver this plan + design system + Playwright smoke-flow docs.
- Acceptance: docs committed and repo-grounded.

### Phase 1: Foundation tokens and preferences
- Introduce token architecture in `app/globals.css`.
- Add UI preferences provider (`solid|glass`, reduced-motion state).
- Acceptance: global theming and effects mode toggle work without route breakage.

### Phase 2: Primitive modernization
- Refactor core primitives (`Button`, `Input`, `Select`, `Card`, `Tabs`, `Dropdown`, `Toast`, `Alert`, etc.).
- Add missing primitives (`Checkbox`, `RadioGroup`, `Dialog`, `Drawer`, `Breadcrumbs`, `Pagination`, `Table`, `EmptyState`, `Stepper`).
- Add internal showcase route `app/(app)/ui-showcase/page.tsx` as the visual contract for foundation components.
- Acceptance: primitives render consistently and compile across app.

### Phase 3: Unified shell refactor
- Rewrite public/app/admin layout clients onto shared shell patterns.
- Preserve role gating, cart visibility, preview links, and sign out behavior.
- Acceptance: route group navigation and session-aware actions remain intact.

### Phase 4: Incremental page-level polish
- Normalize high-traffic surfaces first: auth, dashboard, catalog/detail, cart/checkout.
- Then admin data-heavy pages.
- Acceptance: no broken core user flow and responsive behavior maintained.

### Phase 5: QA hardening and smoke coverage
- Run lint/test/build and compare deltas against baseline.
- Run Playwright CLI smoke flows for critical paths.
- Acceptance: no new runtime breakages; no console errors in smoke runs.

## Acceptance Criteria (Project-Level)
1. Backend APIs, DB schema, and auth logic remain unchanged.
2. Route structure unchanged.
3. Shared visual system is token-driven with optional glass mode.
4. Shell experience is cohesive across public, learner, and admin contexts.
5. Core commerce and LMS flows remain functional.
6. Accessibility and responsive behavior meet baseline checks.

## Implementation Status
- Phase 0 complete (documentation authored).
- Phase 2 foundation implemented and compiled, including tokenized primitive set and `/ui-showcase`.
- Remaining phases executed incrementally in small reviewable diffs.
