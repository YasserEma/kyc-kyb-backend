# KYC/KYB Backend API (NestJS + TypeORM)

Robust backend for KYC/KYB workflows built with NestJS, TypeORM, and PostgreSQL. It exposes authenticated APIs for subscriber onboarding, user management, risk/screening analysis, and more. This document covers architecture, setup, project structure, and API reference.

## Overview

- Framework: NestJS (`@nestjs/*`), TypeScript
- Database: PostgreSQL via TypeORM (migrations + seeders)
- Auth: JWT access/refresh tokens, optional Google OAuth2
- Security: Role-based access control, throttling, CORS, security headers
- Docs: Swagger at `http://localhost:<PORT>/api/docs`
- Global prefix: `api/v1` (e.g., `POST /api/v1/auth/login`)

## System Architecture

- Application module (`src/app.module.ts`)
  - Loads env via `ConfigModule`
  - Optional DB init controlled by `SKIP_DB` (set `SKIP_DB=true` to start app without DB)
  - Throttler: short (3 req/s), medium (20 req/10s), long (100 req/min)
  - Imports `AuthModule` (additional modules can be added similarly)
- Server bootstrap (`src/main.ts`)
  - Global prefix: `api/v1`
  - Global `ValidationPipe` with strict whitelist and custom 400 error shape
  - CORS enabled for `FRONTEND_URL` (default `http://localhost:3000`)
  - Security headers middleware (HSTS, CSP, Referrer-Policy, etc.)
  - Swagger at `/api/docs`
  - Port from `PORT` or defaults to `3001`
- Database (`src/config/data-source.ts`)
  - Entities: `src/**/**.entity.ts`
  - Migrations: `src/database/migrations/*`
  - `synchronize=false`, `logging` from env, `ssl` in production
- Common base model & repository
  - `BaseEntity`: `id`, `created_at`, `updated_at`, `deleted_at`, `is_active`
  - `BaseRepository`: `softDeleteById`, `restoreById`, `findActive`
- Security & RBAC
  - `JwtAuthGuard`: protects routes, respects `@Public()` (via metadata `isPublic`)
  - `RolesGuard`: enforces `@Roles('admin'|'manager'|'analyst'|'viewer')`

## Project Structure

```
backend-kyc/
├── docker-compose.yml
├── .env.example
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/
│   │   ├── app.config.ts
│   │   ├── data-source.ts
│   │   ├── database.config.ts
│   │   └── validation.schema.ts
│   ├── database/
│   │   ├── migrations/...
│   │   ├── seeders/...
│   │   └── seeds.ts
│   ├── modules/
│   │   ├── auth/ (controllers, services, DTOs, guards)
│   │   ├── subscriber-users/ (controller, service, DTOs, repositories)
│   │   ├── common/ (base entities/repositories)
│   │   └── ... other domain modules (entities + repositories)
│   └── utils/ (db helpers, query helpers, encryption)
└── package.json
```

## Environment Configuration

Copy `.env.example` to `.env` and adjust:

```
# Database
DB_HOST=localhost
DB_PORT=5432        # Use 5433 if using the provided Docker compose
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=kyc_kyb_system
DB_SYNCHRONIZE=false
DB_LOGGING=true

# Application
NODE_ENV=development
PORT=3000           # Server defaults to 3001 if not set
API_VERSION=v1

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key
ENCRYPTION_ALGORITHM=aes-256-cbc

# File Storage
MAX_FILE_SIZE_MB=10
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-jwt-access-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key-min-32-chars
JWT_ACCESS_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# Google OAuth2
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/v1/auth/google/callback

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

Env validation rules (`validation.schema.ts`):
- Required: `DB_*`, `NODE_ENV`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRATION`, `JWT_REFRESH_EXPIRATION`
- Secrets must be at least 32 characters
- Optional: Google OAuth, Email, `FRONTEND_URL`

## Local Development

Prerequisites:
- Node.js 18+
- PostgreSQL 14+ (or Docker)

Database via Docker:
- `DB_PORT` should be `5433` to match compose
- Start DB: `npm run db:docker:up` (maps `5433:5432`, container `kyc-postgres`)

Database setup:
- Create database (if needed): `npm run db:create`
- Run migrations: `npm run migration:run`
- Seed demo data: `npm run seed`

Start the server:
- Development: `npm run dev`
- Build: `npm run build`

Swagger:
- Visit `http://localhost:<PORT>/api/docs`

Notes:
- You can set `SKIP_DB=true` to start the app without connecting to the database for troubleshooting.
- CORS is enabled for `FRONTEND_URL` with security headers and throttling.

## NPM Scripts

- `dev`: run Nest app via `ts-node`
- `build`: compile TypeScript
- `migration:run` / `migration:revert`: apply/revert TypeORM migrations
- `seed`: run all seeders
- `db:create`: create DB if not present
- `db:docker:up` / `db:docker:down`: manage Postgres container
- `test:api` / `test:api:verbose`: run API tests (requires `test-api-suite.js` — provide if/when available)

## Security & Rate Limiting

- Auth: Bearer JWT (`Authorization: Bearer <access_token>`) on protected routes
- Refresh token flow for session extension
- Role-based guard using `@Roles('admin'|'manager'|'analyst'|'viewer')`
- Throttling buckets: short (3 req/s), medium (20 req/10s), long (100 req/min)
- Security headers: HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy

## API Reference

Base URL: `http://localhost:<PORT>/api/v1`

### Auth

- `GET /auth/health`
  - Purpose: service health check
  - Response: `{ status: 'ok' }` (implementation-specific)

- `POST /auth/register`
  - Body (RegisterSubscriberDto):
    - `companyName`, `companyType`, `jurisdiction`, `companyContactPhone?`
    - `adminName`, `adminEmail`, `adminPassword`, `adminPhoneNumber?`
  - Response (RegisterResponseDto): `{ subscriberId, adminUserId }`

- `POST /auth/login`
  - Body (LoginDto): `{ username: string /* email */, password: string }`
  - Response (LoginResponseDto): `{ access_token, refresh_token, expires_in, token_type, user }`

- `POST /auth/refresh`
  - Body (RefreshTokenDto): `{ refresh_token }`
  - Response (RefreshResponseDto): `{ access_token, refresh_token, expires_in, token_type }`

- `POST /auth/logout` (JWT required)
  - Body (LogoutDto): `{ refresh_token? }` (optional invalidation)
  - Response (MessageResponseDto): `{ message }`

- `POST /auth/forgot-password`
  - Body (ForgotPasswordDto): `{ email }`
  - Response (MessageResponseDto): `{ message }`

- `POST /auth/reset-password`
  - Body (ResetPasswordDto): `{ token, new_password }`
  - Response (MessageResponseDto): `{ message }`

- `GET /auth/google` (OAuth init)
- `GET /auth/google/callback` (OAuth callback)
  - Note: These are typically excluded from Swagger and require Google OAuth env vars.

- `GET /auth/profile` (JWT required)
  - Response: current user profile

### User Management (Subscriber Scope)

All routes under `/users` require JWT. Role permissions vary by route.

- `GET /users` (admin)
  - Query (ListUsersQueryDto): paging (`page`, `limit`) + filters (`email`, `name`, `role`, `status`, `department`, `job_title`, `two_factor_enabled`, `email_verified`, `is_locked`)
  - Response: paginated list with metadata (via repository pagination helper)

- `GET /users/:user_id` (admin, manager, analyst, viewer)
  - Response: user details + activity summary (counts from logs, screening analyses, risk analyses)

- `POST /users` (admin)
  - Body (CreateUserDto): `first_name`, `last_name`, `email`, `role`, `status?`, `department?`, `job_title?`, `send_invitation_email?`
  - Response: created user

- `PUT /users/:user_id` (admin)
  - Body (UpdateUserDto): optional fields to update
  - Response: updated user

- `PATCH /users/:user_id/password` (self or admin)
  - Body (ChangePasswordDto): `current_password?` (required for self-change), `new_password`
  - Response: `{ message }`

- `PATCH /users/:user_id/status` (admin)
  - Body (UpdateStatusDto): `status` (`active|inactive|pending|suspended`)
  - Response: updated user status

- `DELETE /users/:user_id` (admin)
  - Response: `{ message }` or deletion result; last-admin guard enforced server-side

- `GET /users/export` (admin)
  - Query (ExportUsersDto): `format=csv|xlsx` + filters
  - Response: CSV file stream (sets `Content-Type: text/csv`)

- `GET /users/:user_id/permissions` (self or admin)
  - Response: `{ permissions: string[] }`

- `PUT /users/:user_id/permissions` (admin)
  - Body (UpdatePermissionsDto): `{ mode: REPLACE|ADD|REMOVE, permissions: string[] }`
  - Response: updated permissions

## Data & Soft Delete

- Entities extend `BaseEntity` with `deleted_at` and `is_active`.
- Repository helpers enforce active-only filtering by default.
- Activity summaries count on related entities with `created_by: uuid` references.

## Running With Docker Postgres

- Compose file exposes Postgres on host `5433`:
  - `ports: '5433:5432'`
  - Set `DB_PORT=5433` in `.env`
- Start DB: `npm run db:docker:up`
- Healthcheck ensures readiness (`pg_isready`)

## Error Handling & Validation

- Global `ValidationPipe` returns `{ statusCode: 400, message, error: 'Bad Request' }` on validation errors.
- DTOs use `class-validator` with explicit messages and formats.
- Swagger reflects DTO shapes via `@ApiProperty`/`@ApiPropertyOptional`.

## Swagger

- URL: `http://localhost:<PORT>/api/docs`
- Auth: Add a Bearer token via Swagger “Authorize” button
- Hidden endpoints: Google OAuth routes are excluded from docs

## Contributing & Development Notes

- Keep changes focused: use DTOs for validation and update Swagger annotations.
- Prefer migrations (`migration:run`) over `synchronize` to manage schema.
- Add unit/integration tests under an appropriate `test` directory (the script references `test-api-suite.js`; add the file or update scripts as needed).

## License

This repository does not include an explicit license. Consult your organization’s policies before distribution.