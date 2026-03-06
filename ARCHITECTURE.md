# Architecture choices

## Tech stack

- **TypeScript** – Type safety and better maintainability.
- **Express** – Simple, widely used HTTP server for REST APIs.
- **TypeORM** – ORM for MySQL with entities, migrations, and repository pattern.
- **MySQL** – Relational store for users and tasks as required.

## Project structure

- **`src/config`** – DataSource (DB connection) and app constants. All config from environment variables for cloud readiness.
- **`src/entities`** – TypeORM entities (User, Task). Single source of truth for schema; migrations generated from these when needed.
- **`src/dto`** – Request validation (class-validator) for auth and task bodies.
- **`src/services`** – Business logic (AuthService, TaskService). No HTTP here; controllers call services and send responses.
- **`src/controllers`** – HTTP handlers: parse request, call service, set status/body, pass errors to `next`.
- **`src/routes`** – Route definitions and middleware (auth, validation). Keeps app.ts thin.
- **`src/middleware`** – Auth (JWT verification, attach user), validation (body → DTO), global error handler.
- **`src/errors`** – `AppError` and helpers (Unauthorized, NotFound, etc.) for consistent status codes and JSON shape.

This keeps a clear flow: **Route → Middleware (auth/validate) → Controller → Service → Repository/DB**, with errors centralized in the error handler.

## Authentication and authorization

- **JWT** – Stateless; no server-side session store. Token issued on login/register, validated on each request via `Authorization: Bearer <token>`.
- **Password hashing** – bcrypt before storing; plain passwords never persisted.
- **RBAC** – `User` and `Admin` roles. Users see and act only on their own tasks; admins can list/update/soft-delete any task. Role stored on User; task service receives `{ id, role }` and branches on `role === 'admin'` for list/get/update/delete.

## Task ownership and soft delete

- Every task has an `ownerId` (FK to User). List/get/update/delete enforce ownership unless the caller is admin.
- **Soft delete** – `deletedAt` (TypeORM `@DeleteDateColumn`) and optional `is_deleted` flag. No physical deletes; list/get exclude soft-deleted tasks.

## Error handling and validation

- **AppError** – Custom error with `statusCode` and optional `code` (e.g. `UNAUTHORIZED`, `NOT_FOUND`). One global error middleware returns `{ success: false, message, code }` and logs to stdout.
- **Validation** – DTOs with class-validator; invalid body → 400 with constraint messages.

## Cloud readiness

- **Config** – PORT, DB_*, JWT_SECRET, CORS_ORIGIN from env; no hardcoded secrets.
- **Logging** – console.log/error (stdout/stderr) so platforms can capture logs.
- **Health** – `GET /health` returns 200 for liveness/readiness.

## Security (extra)

- **Helmet** – Security headers.
- **CORS** – Origin from env (e.g. frontend URL).
- **Rate limiting** – express-rate-limit per IP to reduce abuse.
- **Body size limit** – 100kb JSON to avoid large payloads.

## Testing

- **Jest + Supertest** – Integration tests against the real app and test DB. Setup sets `NODE_ENV=test` and test DB name; each suite initializes DataSource and imports app. Covers health, auth (register/login, validation, 409), and task CRUD (with and without token, validation, 404).

## Migrations

- TypeORM migrations for schema changes. In production, `synchronize` is off; schema is applied only via `migration:run`. In dev/test, `synchronize` can create/update tables for convenience.
