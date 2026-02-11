# Risk Mitigation Implementation Plan

This document converts the identified architectural risks into a phased, test-driven implementation roadmap.

## Goals

1. Remove role/access drift across middleware, layout guards, and API boundaries.
2. Make subscription lifecycle transitions explicit, idempotent, and auditable.
3. Make checkout finalization resilient under concurrency and retries.
4. Eliminate unsafe global dev-overlay suppression behavior.

## Delivery Strategy

- **Approach**: incremental, low-risk slices with regression tests per phase.
- **Definition of done per phase**:
  - shared abstractions added,
  - all touched paths migrated,
  - tests added/updated,
  - lint and targeted tests pass.

---

## Phase 1 — Route and Access Policy Centralization (In Progress)

### Objective
Create one source of truth for route classification and default auth redirects.

### Scope
- Add `lib/route-policy.ts` containing:
  - admin route prefixes
  - auth-required route prefixes
  - customer-only route prefixes
  - default redirect targets
  - helper match functions
- Refactor `proxy.ts` to consume shared policy instead of duplicating route arrays.

### Validation
- Unit tests for route helper matching.
- Quick middleware behavior checks through policy helper tests.

### Exit Criteria
- `proxy.ts` has no inline duplicated route-policy arrays.
- All route checks use shared helpers.

---

## Phase 2 — Subscription State Machine + Idempotent Webhooks

### Objective
Make subscription transitions deterministic and replay-safe.

### Scope
- Add allowed transition map in `lib/subscriptions.ts` or new `lib/subscription-state.ts`.
- Add transition function enforcing legal transitions.
- Add webhook idempotency persistence (`WebhookEvent` table or equivalent).
- Wrap subscription update + cleanup operations in transaction.
- Add scheduled reconciliation job entrypoint for stale pending subscriptions.

### Validation
- Unit tests for valid/invalid state transitions.
- Integration tests for duplicate webhook event processing.

### Exit Criteria
- Duplicate webhook events do not create duplicate effects.
- Invalid transitions are blocked and logged.

---

## Phase 3 — Checkout Finalization Integrity and Concurrency Safety

### Objective
Guarantee financially and inventory-consistent purchase finalization.

### Scope
- Extend purchase data model with pricing snapshot fields.
- Persist coupon/discount/original/final amount snapshot at checkout creation.
- Move webhook purchase finalization into DB transaction.
- Add guarded inventory decrement to avoid negative inventory.
- Increment coupon usage only after paid transition.

### Validation
- Integration tests:
  - concurrent capture simulation,
  - inventory floor handling,
  - coupon usage increments only once.

### Exit Criteria
- No negative inventory under concurrent finalization.
- Replayed webhook does not duplicate payment/enrollment side effects.

---

## Phase 4 — Dev Overlay Suppression Safety

### Objective
Stop global unsafe DOM stripping while preserving intentional UX behavior.

### Scope
- Gate behavior behind `HIDE_NEXT_DEV_OVERLAY` flag.
- Remove broad wildcard selectors and interval-based DOM removal.
- Keep only narrow, explicit selectors if still needed.

### Validation
- Manual dev sanity check (errors visible when flag disabled).
- Ensure no unintended UI elements are hidden.

### Exit Criteria
- No wildcard `id*`/`class*` removal patterns in root layout.
- Overlay suppression can be toggled explicitly via env.

---

## Cross-Cutting Enhancements

- Structured audit logging for auth denials and webhook processing.
- Error taxonomy alignment (`UNAUTHORIZED`, `FORBIDDEN`, `INVALID_STATE`, `IDEMPOTENT_REPLAY`).
- Expand integration coverage for critical customer/admin journeys.

## Current Status

- [x] Plan documented.
- [x] Phase 1 scaffolding added (`lib/route-policy.ts`).
- [x] Phase 1 proxy migration started.
- [x] Phase 1 layout redirect constants aligned with shared policy.
- [x] Phase 1 test coverage complete.
- [x] Phase 2 completed (state transition guards enforced + webhook events registered atomically for idempotency).
- [x] Phase 3 completed (pricing snapshot persisted, transactional purchase finalization, guarded inventory decrement, coupon increment conditioned in SQL on successful paid flow).
- [x] Phase 4 completed (dev overlay suppression gated behind env flag, narrowed selectors, and removed aggressive scanning/interval stripping).
