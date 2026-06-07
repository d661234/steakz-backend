# Steakz MIS Implementation Plan

## Overview
This implementation plan splits the project into incremental phases. Each phase is designed to be completed, validated, and committed before moving to the next phase. The app must remain functioning between commits.

Each phase includes:
- Goals
- Key tasks
- Validation criteria
- Suggested commit message

---

## Phase 1: Backend stabilization and schema alignment

### Goals
- Align backend Prisma schema, RBAC definitions, and route permissions
- Fix root backend mismatches that prevent compilation or route wiring
- Preserve existing functionality while cleaning up broken type and role mappings

### Key tasks
- Update `backend/prisma/schema.prisma` to match actual roles used by the app
- Align `backend/src/middleware/rbac.ts` with schema roles and remove unused roles or permissions
- Fix backend service and controller code that references invalid Prisma relations/types
- Validate that all backend routes compile and startup successfully

### Validation
- `npx tsc --noEmit` passes in `backend`
- `npm run dev` in backend starts without route/controller import errors
- All existing backend tests run successfully where feasible
- No regressions in currently implemented routes

### Commit message
`chore(backend): stabilize schema and RBAC roles, fix backend route type mismatches`

---

## Phase 2: API completion and endpoint wiring

### Goals
- Complete missing backend endpoints required by the MIS requirements
- Expose all core domain APIs for admin, HQ, customer, waiter, and branch managers
- Ensure backend routes are backed by service logic and ready for frontend integration

### Key tasks
- Add missing public/open-access branch and menu browsing routes
- Wire recommendation and reorder APIs if present in the service layer
- Add admin audit/role-change and soft-delete user support
- Add HQ analytics endpoints for peak times, customer frequency, and most viewed menu items
- Ensure customer order/payment confirmation endpoints are present
- Add inventory alert endpoints if required

### Validation
- Backend API routes respond correctly to integration test cases
- `npx tsc --noEmit` still passes after endpoint additions
- Existing endpoints remain functional
- Any new tests for added APIs pass

### Commit message
`feat(backend): add missing MIS API endpoints and complete core route wiring`

---

## Phase 3: Frontend integration and user flows

### Goals
- Replace mock-only frontend pages with real API-driven pages
- Build the customer, admin, manager, waiter, and branch manager workflows
- Add open-access browsing, login, registration, and protected route enforcement

### Key tasks
- Connect `frontend/src/pages/Login.tsx` to `/api/auth/login`
- Add a new `Register` page and route
- Replace static admin user, branch, menu, and order tables with API data
- Build customer order placement and favourites flow backed by the API
- Build branch manager menu CRUD in real integration mode
- Add role-specific navigation and dashboard elements

### Validation
- Frontend successfully authenticates against backend auth
- Pages load data from backend APIs instead of local mock state
- UI navigation does not break and role-based routes behave correctly
- No console runtime errors in browser from React app for core pages

### Commit message
`feat(frontend): integrate pages with backend APIs and implement user workflows`

---

## Phase 4: Reports, analytics, and MIS polish

### Goals
- Complete the reporting and analytics experience expected for HQ and admin
- Add advanced MIS features from the requirements document
- Polish the app for stable demonstration and evidence capture

### Key tasks
- Implement `Reports` page with sales analytics, branch comparison, peak times, and item popularity
- Add recommendations UI and one-click reorder support
- Add inventory alert display if inventory is supported
- Add admin overview dashboard or system activity summary
- Ensure role access proof is visible through UI restrictions and return paths

### Validation
- Reports page displays backend report data correctly
- Recommendation/reorder flows work end-to-end for customers
- Admin and HQ dashboards show the correct restricted data
- The app remains stable across all major routes and roles

### Commit message
`feat(app): add analytics, recommendations, reorder, and MIS reporting polish`

---

## Phase 5: Testing, cleanup, and delivery readiness

### Goals
- Finalize tests, remove any remaining mocks, and prepare the app for delivery
- Ensure the application is robust and stable

### Key tasks
- Add or update backend Jest/Supertest tests for new endpoints
- Add frontend tests or manual test documentation for critical pages
- Clean up stale mock data and unused code
- Update documentation if needed, including `gemini.md`, `SCHEMA.md`, or `ARCHITECTURE.md`

### Validation
- Test suite passes for backend (`npm run test`)
- No broken import or runtime errors after cleanup
- App remains runnable and stable in both backend and frontend

### Commit message
`test: add coverage for MIS features and clean up implementation`
