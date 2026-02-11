# Route Refactor Tracker

Legend:
- `LEGACY`: old page composition still in use.
- `IN-PROGRESS`: route actively being refactored.
- `DONE`: route uses new layout primitives and standardized states, with visibly new hierarchy/layout.

| Route | Area | Status | Notes |
|---|---|---|---|
| `/` | public | DONE | Premium hero showpiece, product preview mock, section rhythm, reveal motion, trust strip, featured course redesign. |
| `/about` | public | LEGACY | Pending page composition refactor. |
| `/blog` | public | LEGACY | Pending page composition refactor. |
| `/blog/[slug]` | public | LEGACY | Pending page composition refactor. |
| `/cart` | public | DONE | Uses `PageContainer`, `PageHeader`, `ContentRegion`, `StatusRegion` with standardized empty/cart states. |
| `/certificates/[certificateId]` | public | LEGACY | Pending page composition refactor. |
| `/certificates/verify/[certificateId]` | public | LEGACY | Pending page composition refactor. |
| `/checkout` | public | DONE | New checkout composition with standardized alerts/sign-in states and order regions. |
| `/checkout/subscription` | public | IN-PROGRESS | Interval control updated, but page composition still legacy-style. |
| `/contact` | public | LEGACY | Pending page composition refactor. |
| `/courses` | public | DONE | Catalog refactored with `PageHeader`, dual `Toolbar`, structured `ContentRegion` + `StatusRegion`. |
| `/courses/[courseId]` | public | DONE | Course detail refactored with page primitives, curriculum and enrollment side panel. |
| `/courses/category/[category]` | public | LEGACY | Pending page composition refactor. |
| `/faq` | public | LEGACY | Pending page composition refactor. |
| `/forgot-password` | public | LEGACY | Pending page composition refactor. |
| `/instructors` | public | LEGACY | Pending page composition refactor. |
| `/learning-paths` | public | DONE | Fully rebuilt using `PageContainer`, `PageHeader`, `Toolbar`, `ContentRegion`, `StatusRegion`. |
| `/learning-paths/[pathId]` | public | DONE | Access gates + enrolled view moved to new composition and standardized cards/states. |
| `/pricing` | public | DONE | Refactored to premium subscription layout with segmented billing control and comparison patterns. |
| `/privacy` | public | LEGACY | Pending page composition refactor. |
| `/reset-password` | public | LEGACY | Pending page composition refactor. |
| `/sign-in` | public | LEGACY | Batch B target. |
| `/sign-up` | public | LEGACY | Batch B target. |
| `/terms` | public | LEGACY | Pending page composition refactor. |
| `/testimonials` | public | LEGACY | Pending page composition refactor. |
| `/activity` | app | LEGACY | Batch C target. |
| `/checkout/subscription/success` | app | LEGACY | Batch C target. |
| `/dashboard` | app | DONE | Learner dashboard already moved to page primitives with standardized section regions. |
| `/library` | app | LEGACY | Batch C target. |
| `/library/[courseId]` | app | LEGACY | Batch C target. |
| `/library/[courseId]/lesson/[lessonId]` | app | LEGACY | Batch C target. |
| `/profile` | app | LEGACY | Batch C target. |
| `/profile/subscription` | app | LEGACY | Batch C target. |
| `/purchase/success` | app | LEGACY | Batch C target. |
| `/ui-showcase` | app | DONE | Internal visual contract route for primitives and patterns. |
| `/admin` | admin | LEGACY | Batch D target. |
| `/admin/blog` | admin | LEGACY | Batch D target. |
| `/admin/blog/new` | admin | LEGACY | Batch D target. |
| `/admin/blog/[postId]/edit` | admin | LEGACY | Batch D target. |
| `/admin/categories` | admin | LEGACY | Batch D target. |
| `/admin/coupons` | admin | LEGACY | Batch D target. |
| `/admin/coupons/new` | admin | LEGACY | Batch D target. |
| `/admin/coupons/[id]` | admin | LEGACY | Batch D target. |
| `/admin/courses` | admin | LEGACY | Batch D target. |
| `/admin/courses/new` | admin | LEGACY | Batch D target. |
| `/admin/courses/[courseId]/edit` | admin | LEGACY | Batch D target. |
| `/admin/learning-paths` | admin | LEGACY | Batch D target. |
| `/admin/learning-paths/new` | admin | LEGACY | Batch D target. |
| `/admin/learning-paths/[pathId]/edit` | admin | LEGACY | Batch D target. |
| `/admin/profile` | admin | LEGACY | Batch D target. |
| `/admin/purchases` | admin | LEGACY | Batch D target. |
| `/admin/settings` | admin | LEGACY | Batch D target. |
| `/admin/subscriptions/plans` | admin | LEGACY | Batch D target. |
| `/admin/subscriptions/users` | admin | LEGACY | Batch D target. |
| `/admin/testimonials` | admin | LEGACY | Batch D target. |
| `/admin/users` | admin | LEGACY | Batch D target. |
| `/admin/users/[userId]` | admin | LEGACY | Batch D target. |
