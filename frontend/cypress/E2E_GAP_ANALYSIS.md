# Frontend E2E gap analysis (Cypress)

This document tracks **critical user journeys** and the current Cypress E2E coverage.

Goals:
- Improve release confidence for high-value workflows.
- Keep tests **CI-deterministic** (flake-averse), favoring **API stubs** over live backend state.

Non-goals:
- Broad UI pixel validation.
- Full end-to-end (DB-backed) integration coverage for every page.

## Current coverage inventory (existing specs)

Located under `frontend/cypress/e2e/`:
- `clerk_login.cy.ts` — smoke sign-in via Clerk testing commands + reach a protected route.
- `organizations.cy.ts` — signed-out redirect + role-based invite permissions UI.
- `activity_smoke.cy.ts` — signed-out redirect for `/activity`.
- `activity_feed.cy.ts` — `/activity` happy/empty/error states; stubs SSE + bootstraps via `cy.intercept`.

## Coverage plan (critical flows)

Legend:
- **Priority**: P0 (must-have for release confidence), P1 (next most valuable)
- **Backend mode**: **Stubbed** = deterministic `cy.intercept` responses; **Live** = depends on real backend state
- **Runtime impact**: rough incremental CI time for the spec (order-of-magnitude)

| Flow | Priority | Coverage status | Backend mode | Expected runtime impact |
|---|---:|---|---|---:|
| Boards list renders + Create CTA for admin | P0 | ✅ Implemented (`boards_list.cy.ts`) | Stubbed | ~10–25s |
| Global approvals: render pending approval + approve/reject | P0 | ✅ Implemented (`global_approvals.cy.ts`) | Stubbed | ~15–35s |
| Skill packs: sync a pack + surface warnings | P1 | ✅ Implemented (`skill_packs_sync.cy.ts`) | Stubbed | ~15–35s |
| Board open + task status move (drag/drop) | P0 | ⏳ Planned | Mostly stubbed (may require DOM/drag stability work) | ~30–60s |
| Task CRUD (create/edit/delete) + error state | P0 | ⏳ Planned | Stubbed | ~30–60s |
| Skills marketplace: list + filters/pagination | P1 | ⏳ Planned | Stubbed | ~20–45s |
| Skills marketplace: install/uninstall dialog wiring | P1 | ⏳ Planned | Stubbed | ~25–50s |
| Gateways list/create (admin gating) | P1 | ⏳ Planned | Stubbed | ~20–45s |

Notes:
- All implemented flows still rely on **auth bootstrapping** (Clerk sign-in) before hitting protected routes.
- We intentionally keep the backend interactions **stubbed** for determinism and speed.

## CI determinism / flake-avoidance notes

Patterns used in these specs (and recommended for new ones):
- **Stub `/healthz`** and **org membership** (`/api/v1/organizations/me/member`) so sidebar/admin gating is stable.
- Prefer **API stubs** (`cy.intercept`) over seeding DB state.
- Stub or neutralize **SSE streams** (where applicable) to avoid race-y updates during assertions.
- Set a higher `defaultCommandTimeout` for auth flows (Clerk helpers can be slow in CI).
- Avoid fixed sleeps; prefer `cy.wait(@alias)` or UI assertions that naturally wait.
- Ignore known non-deterministic hydration errors on auth routes (`Hydration failed`).

## How to run locally

From repo root:
```bash
npm -C frontend ci
npm -C frontend run e2e
```

To run a single spec:
```bash
npm -C frontend run e2e -- --spec "cypress/e2e/boards_list.cy.ts"
```
