# Steakz MIS System Architecture

## Overview
Steakz MIS is a multi-role restaurant management system built with a modern web stack. It uses a decoupled architecture with an Express/Prisma backend and a React frontend.

## Tech Stack
- **Backend**: Node.js (v24), Express (v5), Prisma ORM (v6), PostgreSQL.
- **Frontend**: React (v19), Vite, Tailwind CSS, Axios.
- **Authentication**: JWT (JSON Web Tokens) with Role-Based Access Control (RBAC).

## Component Architecture

### Backend (MVC Pattern)
- **Routes**: Define endpoints and apply `authenticateJWT` and `authorize` middlewares.
- **Controllers**: Handle HTTP request/response logic and call services.
- **Services**: Contain business logic and interact with the database via Prisma.
- **Lib**: Singletons like the Prisma Client.

### Frontend
- **Context**: `AuthContext` manages global authentication state.
- **API**: Centralized Axios configuration with interceptors for JWT injection.
- **Components**: Reusable UI elements (MainLayout, ProtectedRoute).
- **Pages**: Role-specific dashboards and management screens.

## Data Model
The system uses a relational database with the following core entities:
- **User**: Authentication and Role-based identity.
- **Branch**: Physical restaurant locations.
- **Menu**: Branch-specific food/drink items.
- **Table**: Seating within a branch.
- **Order**: Customer transactions and status tracking.

## Role-Based Access Control (RBAC)
Strict isolation is maintained via middleware:
- `ADMIN`: Global CRUD.
- `HQ_MANAGER`: Strategic reports and branch oversight.
- `BRANCH_MANAGER`: Operational control over their specific branch.
- `Waiter`: Daily operational tasks (orders).
- `Customer`: Profile and order history.
