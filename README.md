# Task Manager API

REST API for a Task Management system (Backend Interview Assignment). Built with **TypeScript**, **Express**, **TypeORM**, and **MySQL**.

## Setup

### Prerequisites

- Node.js 18+
- MySQL 8 (or use Docker Compose below)

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy the example env file and edit as needed:

```bash
cp .env.example .env
```

Edit `.env` and set at least:

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` for MySQL
- `JWT_SECRET` for auth (use a strong secret in production)

### 3. Run the app

**Development (with ts-node-dev):**

```bash
npm run dev
```

**Production build:**

```bash
npm run build
npm start
```

### 4. Run with Docker (app + MySQL)

```bash
docker-compose up --build
```

The API will be at `http://localhost:3000`. MySQL will create the database on first run (see `docker-compose.yml`).

## Endpoints

| Method | Endpoint        | Description        |
|--------|-----------------|--------------------|
| GET    | /health         | Liveness check     |
| POST   | /auth/register  | Register user      |
| POST   | /auth/login     | Login, get JWT     |
| GET    | /tasks          | List my tasks      |
| GET    | /tasks/:id      | Get one task       |
| POST   | /tasks          | Create task        |
| PATCH  | /tasks/:id      | Update task        |
| DELETE | /tasks/:id      | Soft delete task   |

Auth and task routes are to be fully implemented per `ASSIGNMENT_DOCUMENTATION.md`.

## RBAC (roles)

- **User** (default): Can create tasks and manage only their own tasks (list, get, update, soft delete).
- **Admin**: Can do everything a user can, plus view all tasks, update any task, and soft delete any task.

New registrations get the `user` role. To create an admin, set the role in the database after the user exists, for example:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

## Project structure

```
src/
  config/       # Database and app config
  entities/     # TypeORM entities (User, Task)
  migrations/   # TypeORM migrations (run with npm run migration:run)
  middleware/   # Error handling, auth
  routes/       # Auth and task routes
  app.ts        # Express app
  index.ts      # Entry point
```

## Documentation

- **Architecture choices:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **API (OpenAPI 3):** [openapi.yaml](./openapi.yaml)

## Migrations

- **Run pending migrations:** `npm run migration:run` (uses `.env` for DB connection)
- **Generate a new migration** (after changing entities):  
  `npm run migration:generate -- src/migrations/YourMigrationName`
- **Revert last migration:** `npm run migration:revert`
- **Show migration status:** `npm run migration:show`

In development, `synchronize: true` still creates/updates tables from entities. In production, set `NODE_ENV=production` and use migrations only (no synchronize).

## Scripts

- `npm run dev` – run with hot reload
- `npm run build` – compile TypeScript to `dist/`
- `npm start` – run compiled app
- `npm test` – run tests (when added)
- `npm run migration:run` – run pending migrations
- `npm run migration:generate -- src/migrations/Name` – generate migration from entity changes
- `npm run migration:revert` – revert last migration

## Tests

Tests use Jest and Supertest and hit the real API (with a test DB).

1. Use a separate test database, e.g. create `task_manager_test` and set in `.env`:
   - `DB_NAME=task_manager_test` for tests, or
   - `DB_NAME_TEST=task_manager_test` (overrides `DB_NAME` in tests only).
2. Run: `npm test`

Covered routes: `GET /health`, `POST /auth/register`, `POST /auth/login`, and all task CRUD (`GET/POST/PATCH/DELETE /tasks`) including 401 without token and validation/404 cases.
