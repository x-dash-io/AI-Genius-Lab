# Manual QA - Batch A (Conversion-Critical Public Routes)

## Routes to Visit
- `/`
- `/pricing`
- `/courses`
- `/courses/launch-ai-agency` (or any existing course slug)
- `/learning-paths`
- `/learning-paths/[pathId]` (open any existing path)
- `/cart`
- `/checkout?course=launch-ai-agency` (or any existing course slug)
- Optional interval-control regression check: `/checkout/subscription?planId=<validPlanId>&interval=monthly`

## What to Verify

### 1) Layout and hierarchy
- Every route has clear header hierarchy and spacing rhythm.
- `PageContainer` width and padding look consistent across desktop and mobile.
- Conversion pages use `PageHeader` + `Toolbar`/`ContentRegion`/`StatusRegion` where applicable.
- No page appears to be the old stacked “legacy” composition at a glance.

### 2) Homepage premium behavior
- Hero is 2-column on desktop and stacks cleanly on mobile.
- Right-side “Product Preview” appears as an in-app mock (not image-based).
- Trust strip shows credibility bullets (no fake company names).
- Featured course cards show richer metadata row and quick-action reveal on hover/focus.
- “How it works” and spotlight sections are visually distinct from adjacent sections.
- Final CTA section is visually distinct and includes working buttons.

### 3) Pricing and interval control
- Monthly/Yearly segmented control supports mouse and keyboard.
- Keyboard behavior: Tab focuses control, arrow keys switch options, selected state updates clearly.
- Interval switch updates pricing values in cards and plan links.
- Desktop feature comparison renders as table.
- Mobile comparison renders as collapsible details blocks.
- Billing disclaimer copy is visible and readable.

### 4) Learning paths
- `/learning-paths` search and sort form submits and updates list.
- Empty-state appears when no matching path is found.
- Path cards retain navigation behavior.
- `/learning-paths/[pathId]`:
  - Signed-out view shows access gate with sign-in and pricing actions.
  - Signed-in non-Founder view shows upgrade gate.
  - Founder/enrolled view shows overview, curriculum, and enrollment/progress cards.

### 5) Cart and checkout
- Cart renders empty-state and populated-state correctly.
- Checkout signed-out state shows sign-in CTA with callback.
- Checkout signed-in state shows purchase form and summary.
- Query-based statuses (`checkout=cancelled|failed`) render alert banners.

### 6) Accessibility and interaction
- Keyboard tab order is logical on all listed routes.
- Focus-visible rings are clearly visible on links, inputs, and buttons.
- Hover-only actions are also reachable via keyboard focus (featured courses).
- No obvious contrast failures on glass surfaces (if glass mode is enabled).

### 7) Responsive checks
- Verify at ~375px, ~768px, and ~1280px widths.
- No clipped content, overlapping cards, or horizontal scroll on main content.
- Comparison table on pricing only appears on desktop; mobile uses collapsible blocks.

## Known Risks (Current)
- Full production build currently passes (`npm run build`), but repository-wide lint still has substantial pre-existing debt unrelated to Batch A.
- `/checkout/subscription` has the upgraded interval control but still uses legacy page composition (tracked as `IN-PROGRESS`).
- Learning-path detail depends on seeded auth/subscription data to fully validate all access branches.
