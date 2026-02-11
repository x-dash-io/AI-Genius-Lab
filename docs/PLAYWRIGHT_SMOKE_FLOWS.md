# Playwright CLI Smoke Flows

## Purpose
CLI smoke flows to validate high-priority LMS + ecommerce behavior after UI refactor while preserving existing business logic.

## Prerequisites
1. `npx` must be available.
2. App must be running locally (`npm run dev`).
3. Playwright skill wrapper path:

```bash
export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
export PWCLI="$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh"
```

4. Base URL:

```bash
export APP_URL="http://localhost:3000"
```

## Basic Workflow Pattern
1. Open page.
2. Snapshot.
3. Interact by `eX` refs from latest snapshot.
4. Snapshot again after navigation/state changes.

## Flow 1: Guest browsing and discovery
```bash
"$PWCLI" open "$APP_URL"
"$PWCLI" snapshot
"$PWCLI" open "$APP_URL/courses"
"$PWCLI" snapshot
"$PWCLI" open "$APP_URL/learning-paths"
"$PWCLI" snapshot
"$PWCLI" open "$APP_URL/pricing"
"$PWCLI" snapshot
```
Expected: pages load, navigation visible, no blocking layout collapse.

## Flow 2: Auth entry points
```bash
"$PWCLI" open "$APP_URL/sign-up"
"$PWCLI" snapshot
"$PWCLI" open "$APP_URL/sign-in"
"$PWCLI" snapshot
"$PWCLI" open "$APP_URL/forgot-password"
"$PWCLI" snapshot
```
Expected: forms render, inputs focusable, submit controls enabled states visible.

## Flow 3: Cart and coupon surface
```bash
"$PWCLI" open "$APP_URL/cart"
"$PWCLI" snapshot
```
Expected: empty or populated cart state renders without console errors.

## Flow 4: Checkout entry surfaces
```bash
"$PWCLI" open "$APP_URL/checkout"
"$PWCLI" snapshot
"$PWCLI" open "$APP_URL/checkout/subscription"
"$PWCLI" snapshot
```
Expected: checkout states and CTA hierarchy render; no fatal errors.

## Flow 5: Learner shell navigation (authenticated)
```bash
"$PWCLI" open "$APP_URL/dashboard"
"$PWCLI" snapshot
"$PWCLI" open "$APP_URL/library"
"$PWCLI" snapshot
"$PWCLI" open "$APP_URL/activity"
"$PWCLI" snapshot
"$PWCLI" open "$APP_URL/profile"
"$PWCLI" snapshot
"$PWCLI" open "$APP_URL/ui-showcase"
"$PWCLI" snapshot
```
Expected: app shell loads, navigation active states work, content region stable, showcase primitives render.

## Flow 6: Admin shell navigation (admin session)
```bash
"$PWCLI" open "$APP_URL/admin"
"$PWCLI" snapshot
"$PWCLI" open "$APP_URL/admin/courses"
"$PWCLI" snapshot
"$PWCLI" open "$APP_URL/admin/users"
"$PWCLI" snapshot
"$PWCLI" open "$APP_URL/admin/purchases"
"$PWCLI" snapshot
```
Expected: admin shell/menu visible, table/list pages render, no broken navigation.

## Optional Artifacts
Use headed mode and capture screenshots for visual diffs:

```bash
"$PWCLI" open "$APP_URL" --headed
"$PWCLI" screenshot output/playwright/home.png
```

Store artifacts under `output/playwright/`.

## Failure Triage Checklist
1. Re-run `snapshot` after each major DOM change to avoid stale refs.
2. Check browser console/network from Playwright CLI tooling.
3. Verify auth state assumptions before learner/admin flows.
4. Re-check server logs for API/auth/data errors.
5. Validate with `npm run build` when runtime route behavior differs from dev.
