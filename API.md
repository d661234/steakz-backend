# Steakz MIS API Documentation

## Authentication

### POST `/api/auth/register`
Register a new user.
- **Roles Allowed**: Open Access
- **Body**: `{ email, password, role, branch_id? }`

### POST `/api/auth/login`
Login and receive a JWT token.
- **Roles Allowed**: Open Access
- **Body**: `{ email, password }`
- **Response**: `{ user, token }`

---

## Admin (SYSTEM_ADMIN only)

### GET `/api/admin/users`
List all users.

### GET `/api/admin/users/:id`
Get user by ID.

### PUT `/api/admin/users/:id`
Update user.

### DELETE `/api/admin/users/:id`
Delete user.

---

## Branches & Menus

### GET `/api/branches`
List all branches.
- **Roles**: SYSTEM_ADMIN, HQ_MANAGER

### POST `/api/branches`
Create a branch.
- **Roles**: SYSTEM_ADMIN

### GET `/api/branches/:id`
Get branch details.
- **Roles**: SYSTEM_ADMIN, BRANCH_MANAGER (if same branch)

### GET `/api/branches/:branchId/menu`
Get menu for a branch.
- **Roles**: ALL

### POST `/api/branches/:branchId/menu`
Add menu item.
- **Roles**: SYSTEM_ADMIN, BRANCH_MANAGER

---

## Orders

### GET `/api/orders`
List orders (filtered by branch for staff).
- **Roles**: Staff and Managers

### POST `/api/orders`
Create an order.
- **Roles**: CUSTOMER, WAITER, CASHIER

### PATCH `/api/orders/:id/status`
Update order status.
- **Roles**: WAITER, CASHIER, BRANCH_MANAGER

---

## HQ Analytics

### GET `/api/hq/sales-report`
Sales report per branch.
- **Roles**: HQ_MANAGER, SYSTEM_ADMIN

### GET `/api/hq/global-stats`
Global system statistics.
- **Roles**: HQ_MANAGER, SYSTEM_ADMIN
