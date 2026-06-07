# Steakz Management Information System (MIS) — Gemini CLI Master Prompt

**Single Source of Truth for the Steakz MIS Project**

---

## Quick Start

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev --name init

# Run tests BEFORE starting the app
npm run test

# Start development server
npm run dev
```

---

## 1. Project Overview

**Application:** Steakz Management Information System (MIS) Web Portal

**Purpose:** Multi-role, multi-branch restaurant management system integrating operational, tactical, and strategic functions.

**Core Principle:** Role-based access control (RBAC) with strict data isolation.

---

## 2. Tech Stack (EXACT VERSIONS)

| Layer | Package | Version |
|-------|---------|---------|
| Runtime | Node.js | v24+ |
| Language | TypeScript | 6.0.2 |
| Framework | Express | 5.2.1 |
| ORM | Prisma CLI + Client | 6.19.3 |
| Database | PostgreSQL | 15+ |
| Frontend | React (Vite) | 19+ |
| Frontend Lang | TypeScript | 6.0.2 |
| Auth | bcryptjs | 3.0.3 |
| Auth | jsonwebtoken | 9.0.2 |
| Testing | Jest | 29+ |
| Testing | Supertest | 7+ |
| Testing | ts-jest | 29+ |
| Dev Server | tsx | 4.21.0 |
| Dev Server | nodemon | 3.1.14 |

### Critical Constraints

- ❌ Do **NOT** create `prisma.config.ts`
- ✅ Use `"prisma-client-js"` in schema generator
- ✅ Use `"type": "module"` in package.json (ESM)
- ✅ Module resolution: `"NodeNext"`, Target: `"ES2022"`
- ✅ Use `process.cwd()` instead of `__dirname`
- ✅ `DATABASE_URL` in `.env`, referenced in `schema.prisma`
- ❌ **NO** `any` type (strict TypeScript)
- ❌ **NO** `.then()` chains (use `async/await`)
- ✅ All errors caught and handled elegantly

---

## 3. User Roles & Permissions

| Role | Can Do | Cannot Do |
|------|--------|-----------|
| **Open Access** | Browse branches, menu items | Access dashboards, place orders |
| **Customer** | Profile mgmt, place orders, view history, flag favorites | View other customers' data |
| **Waiter** | View branch orders, update status (`Pending` → `Approved` → `Completed`) | Edit order items, view analytics |
| **Branch Manager** | Full CRUD on menu items & pricing (branch-specific) | View system-wide analytics, manage other branches |
| **HQ Manager** | Strategic analytics, sales reports, staff assignment | Manipulate menu items, manage orders |
| **Admin** | Full CRUD on users, roles, branches | Interfere with daily restaurant operations |

---

## 4. Project Structure (MVC Architecture)

```
steakz-mis/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── index.ts                      ← Express entry point
│   ├── middleware/
│   │   ├── auth.ts                   ← JWT verification
│   │   └── rbac.ts                   ← Role-based access factory
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── adminRoutes.ts
│   │   ├── hqRoutes.ts
│   │   ├── branchRoutes.ts
│   │   ├── orderRoutes.ts
│   │   └── customerRoutes.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── adminController.ts
│   │   ├── hqController.ts
│   │   ├── branchController.ts
│   │   ├── orderController.ts
│   │   └── customerController.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── branchService.ts
│   │   ├── menuService.ts
│   │   ├── orderService.ts
│   │   └── reportService.ts
│   ├── types/
│   │   └── index.ts                  ← Shared interfaces & enums
│   └── lib/
│       └── prisma.ts                 ← Prisma singleton
├── client/                           ← React + Vite frontend
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── api/                      ← Axios API config
│   │   ├── components/               ← Reusable UI elements
│   │   ├── pages/                    ← Dashboards & views
│   │   ├── context/                  ← Auth provider
│   │   └── types/
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── tests/
│   ├── auth.test.ts
│   ├── admin.test.ts
│   ├── hq.test.ts
│   ├── branch.test.ts
│   └── customer.test.ts
├── .env
├── .env.example
├── gemini.md                         ← THIS FILE
├── ARCHITECTURE.md
├── SCHEMA.md
├── RBAC.md
├── API.md
├── TEST-PLAN.md
└── PROGRESS.md
```

---

## 5. Testing Workflow (BEFORE Running App)

### Test Structure

All tests are colocated in `/tests` directory and use:
- **Jest** as test runner
- **Supertest** for HTTP assertions
- **ts-jest** for TypeScript support

### Test Checklist

```bash
# 1. Unit tests (authentication, validation)
npm run test -- auth.test.ts

# 2. Integration tests (endpoints, RBAC)
npm run test -- --testPathPattern=routes

# 3. Full test suite
npm run test

# 4. Coverage report
npm run test -- --coverage

# 5. Watch mode (during development)
npm run test -- --watch
```

### Test Naming Convention

```
✅ auth.test.ts       → authService, middleware/auth
✅ admin.test.ts      → adminController, adminRoutes
✅ hq.test.ts         → hqController, reportService
✅ branch.test.ts     → branchController, menuService
✅ customer.test.ts   → customerController, orderService
```

### Pre-Launch Checklist

- [ ] All unit tests pass (`npm run test`)
- [ ] Coverage ≥ 80% for controllers and services
- [ ] No TypeScript errors (`npm run build`)
- [ ] Linting passes (if configured)
- [ ] Database migrations applied (`npx prisma migrate deploy`)
- [ ] `.env` configured correctly
- [ ] Seed data loaded (if needed)

---

## 6. Development Workflow

### Starting Fresh

```bash
# 1. Install dependencies
npm install && cd client && npm install && cd ..

# 2. Setup .env
cp .env.example .env
# → Edit .env with correct DATABASE_URL

# 3. Initialize database
npx prisma migrate dev --name init

# 4. Run tests
npm run test

# 5. Start app
npm run dev
```

### During Development

```bash
# Watch mode for backend + tests
npm run dev

# Frontend development (separate terminal)
cd client && npm run dev

# Generate new migrations
npx prisma migrate dev --name <feature_name>

# View database
npx prisma studio
```

---

## 7. Common Commands

```bash
# Backend
npm run dev                    # Start dev server with hot reload
npm run build                  # Build TypeScript
npm run start                  # Run production build
npm run test                   # Run all tests
npm run test -- --watch       # Watch mode
npm run lint                   # Lint code

# Database
npx prisma migrate dev         # Create & apply migration
npx prisma migrate deploy      # Apply migrations (production)
npx prisma generate           # Regenerate Prisma client
npx prisma studio             # Open DB GUI

# Frontend (from /client)
npm run dev                    # Start Vite dev server
npm run build                  # Build for production
npm run preview               # Preview production build
```

---

## 8. Key Rules for Gemini CLI

✅ **DO:**
- Run tests **before** every app start
- Maintain strict TypeScript types
- Use `async/await` exclusively
- Keep RBAC rules isolated in middleware
- Document all schema changes in `SCHEMA.md`
- Update `PROGRESS.md` after each feature

❌ **DO NOT:**
- Override rules in this `gemini.md` file
- Use `any` type or loose typing
- Create `prisma.config.ts`
- Use `.then()` chains
- Leave unhandled promise rejections
- Skip test coverage

---

## 9. Useful Gemini CLI Commands

```bash
# Verify project setup
gemini: Check project structure and constraints

# Add new endpoint with tests
gemini: Add endpoint [ROUTE] with RBAC and tests

# Audit RBAC compliance
gemini: Audit all routes for RBAC violations

# Generate documentation
gemini: Generate API docs from routes

# Test and commit
gemini: Run tests and commit changes

# Sync Prisma schema
gemini: Update Prisma schema and migrate
```

---

## 10. Quick Reference

**Database:** PostgreSQL 15+ (set `DATABASE_URL` in `.env`)

**Auth:** JWT tokens + bcryptjs hashing

**Frontend:** React 19 via Vite with TypeScript

**Testing:** Jest + Supertest for route testing

**Code Style:** Strict TypeScript, ESM modules, async/await

---

---

## 11. Custom Command Definitions

The following custom commands are available for Gemini CLI to automate common tasks in the Steakz MIS project.

### 1. `add-endpoint`
**Purpose:** Automate the creation of a new Express endpoint with RBAC and corresponding tests.
**File:** `.gemini/commands/add-endpoint.md`

### 2. `audit-rbac`
**Purpose:** Perform a comprehensive audit of all routes to ensure strict RBAC compliance.
**File:** `.gemini/commands/audit-rbac.md`

### 3. `test-and-commit`
**Purpose:** Run the full test suite and, if successful, propose a commit with a descriptive message.
**File:** `.gemini/commands/test-and-commit.md`

### 4. `sync-schema`
**Purpose:** Sync the Prisma schema, generate the client, and apply migrations.
**File:** `.gemini/commands/sync-schema.md`

### 5. `generate-api-docs`
**Purpose:** Extract route information to generate or update API documentation.
**File:** `.gemini/commands/generate-api-docs.md`

---

**Last Updated:** June 2, 2026


**Next Steps:**
1. Clone/initialize repo
2. Install dependencies
3. Copy `.env.example` → `.env`
4. Run `npx prisma migrate dev`
5. Run `npm run test`
6. Run `npm run dev`
7. Open browser to `http://localhost:3000`
