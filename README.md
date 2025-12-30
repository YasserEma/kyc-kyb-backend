# KYC-KYB Backend System

A comprehensive **Know Your Customer (KYC)** and **Know Your Business (KYB)** backend system built with NestJS, TypeScript, and PostgreSQL. This multi-tenant SaaS platform provides complete entity management, document handling, risk analysis, and compliance screening capabilities.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Environment Configuration](#-environment-configuration)
- [Database Management](#-database-management)
- [API Documentation](#-api-documentation)
- [Available Scripts](#-available-scripts)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## ✨ Features

### Core Features
- **Multi-Tenant Architecture** - Complete subscriber/company isolation
- **Entity Management** - Support for both Individual and Organization entities
- **Document Management** - Upload, verify, and manage compliance documents
- **Custom Fields** - Dynamic custom fields per entity
- **Relationship Tracking** - Entity-to-entity relationship management

### Compliance & Risk
- **Risk Analysis** - Configurable risk assessment engine
- **Screening Analysis** - AML/CFT screening capabilities
- **Entity History** - Complete audit trail of all changes
- **Activity Logging** - Comprehensive system logs

### Authentication & Access
- **JWT Authentication** - Secure token-based auth with refresh tokens
- **Google OAuth2** - Social login integration
- **Role-Based Access** - ADMIN, ANALYST, REVIEWER, AUDITOR, COMPLIANCE_OFFICER, RISK_MANAGER, OPERATIONS_MANAGER
- **Rate Limiting** - Protection against abuse

### Dynamic Configuration
- **Lists Management** - Customizable lookup lists per tenant
- **Document Configurations** - Configurable document types
- **Screening Configurations** - Flexible screening rules

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Runtime** | Node.js v18+ |
| **Framework** | NestJS v11 |
| **Language** | TypeScript v5 |
| **Database** | PostgreSQL v14+ |
| **ORM** | TypeORM v0.3 |
| **Authentication** | Passport.js, JWT |
| **Validation** | class-validator, Joi |
| **Documentation** | Swagger/OpenAPI |
| **Email** | Nodemailer |
| **Containerization** | Docker & Docker Compose |

---

## 📁 Project Structure

```
kyc-kyb-backend/
├── src/
│   ├── config/                    # Configuration files
│   │   └── data-source.ts         # TypeORM data source config
│   ├── database/
│   │   ├── migrations/            # Database migrations
│   │   ├── seeders/               # Database seeders
│   │   └── seeds.ts               # Seeder orchestrator
│   ├── modules/
│   │   ├── auth/                  # Authentication module
│   │   │   ├── dto/               # Data transfer objects
│   │   │   ├── guards/            # Auth guards (JWT, roles)
│   │   │   ├── strategies/        # Passport strategies
│   │   │   └── email/             # Email service
│   │   ├── entities/              # Entity management (Individual/Organization)
│   │   │   ├── dtos/              # Entity DTOs
│   │   │   ├── entities/          # TypeORM entities
│   │   │   ├── repositories/      # Data access layer
│   │   │   └── services/          # Business logic
│   │   ├── documents/             # Document management
│   │   ├── entity-custom-fields/  # Custom fields per entity
│   │   ├── entity-history/        # Audit trail
│   │   ├── entity-relationships/  # Entity relationships
│   │   ├── lists-management/      # Dynamic lookup lists
│   │   ├── lookups/               # Static lookup data
│   │   ├── logs/                  # Activity logging
│   │   ├── risk-analysis/         # Risk assessment
│   │   ├── risk-configuration/    # Risk rules config
│   │   ├── screening-analysis/    # AML/CFT screening
│   │   ├── subscribers/           # Tenant management
│   │   └── subscriber-users/      # User management
│   ├── utils/
│   │   └── database/              # Database utilities
│   ├── app.module.ts              # Root application module
│   └── main.ts                    # Application entry point
├── test/                          # Test files
├── .env.example                   # Environment template
├── docker-compose.yml             # Docker configuration
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
└── README.md                      # This file
```

---

## 📦 Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** v18 or higher - [Download](https://nodejs.org/)
- **npm** v9 or higher (comes with Node.js)
- **PostgreSQL** v14 or higher - [Download](https://www.postgresql.org/download/)
- **Docker & Docker Compose** (optional, for containerized database) - [Download](https://www.docker.com/)

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd kyc-kyb-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration (see Environment Configuration section)
nano .env  # or use your preferred editor
```

### 4. Start PostgreSQL Database

**Option A: Using Docker (Recommended)**
```bash
# Start PostgreSQL container
npm run db:docker:up

# Wait ~10 seconds for PostgreSQL to initialize
```

**Option B: Using Local PostgreSQL**
```bash
# Ensure PostgreSQL is running on your system
# Default connection: localhost:5432
```

### 5. Initialize Database

```bash
# Create the database (if needed)
npm run db:create

# Run all migrations
npm run migration:run

# Seed initial data
npm run seed
```

### 6. Start the Development Server

```bash
npm run dev
```

The server will start at:
- **API Server**: http://localhost:3004 (or your configured PORT)
- **Swagger Docs**: http://localhost:3004/api/docs

---

## ⚙️ Environment Configuration

Create a `.env` file in the project root with the following variables:

```env
# ===================
# Database Configuration
# ===================
DB_HOST=localhost
DB_PORT=5433                        # 5433 for Docker, 5432 for local
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=kyc_kyb_system
DB_SYNCHRONIZE=false                # Always false in production
DB_LOGGING=true                     # SQL query logging

# ===================
# Application Configuration
# ===================
NODE_ENV=development
PORT=3004
API_VERSION=v1

# ===================
# Security - Encryption
# ===================
ENCRYPTION_KEY=your-32-character-encryption-key
ENCRYPTION_ALGORITHM=aes-256-cbc

# ===================
# File Upload
# ===================
MAX_FILE_SIZE_MB=10
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png

# ===================
# JWT Configuration
# ===================
JWT_ACCESS_SECRET=your-super-secret-jwt-access-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key-min-32-chars
JWT_ACCESS_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# ===================
# Google OAuth2 (Optional)
# ===================
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3004/api/v1/auth/google/callback

# ===================
# Email Configuration (Optional)
# ===================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# ===================
# Frontend URL
# ===================
FRONTEND_URL=http://localhost:3000
```

### Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DB_HOST` | PostgreSQL host | Yes | localhost |
| `DB_PORT` | PostgreSQL port | Yes | 5432 |
| `DB_USERNAME` | Database username | Yes | postgres |
| `DB_PASSWORD` | Database password | Yes | - |
| `DB_DATABASE` | Database name | Yes | kyc_kyb_system |
| `DB_SYNCHRONIZE` | Auto-sync entities (disable in prod) | No | false |
| `DB_LOGGING` | Enable SQL logging | No | true |
| `NODE_ENV` | Environment mode | No | development |
| `PORT` | Application port | No | 3000 |
| `JWT_ACCESS_SECRET` | JWT access token secret | Yes | - |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | Yes | - |
| `JWT_ACCESS_EXPIRATION` | Access token expiry | No | 1h |
| `JWT_REFRESH_EXPIRATION` | Refresh token expiry | No | 7d |
| `ENCRYPTION_KEY` | Data encryption key (32 chars) | Yes | - |

---

## 🗄️ Database Management

### Complete Database Setup

```bash
# 1. Start PostgreSQL (Docker)
npm run db:docker:up

# 2. Create the database
npm run db:create

# 3. Run migrations
npm run migration:run

# 4. Seed initial data
npm run seed
```

### Reset Database (Development Only)

```bash
# Stop containers and remove data
npm run db:docker:down
rm -rf .docker/postgres-data

# Recreate everything
npm run db:docker:up
sleep 10
npm run db:create
npm run migration:run
npm run seed
```

### Migration Commands

```bash
# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Create a new migration
npx typeorm migration:create src/database/migrations/YourMigrationName

# Generate migration from entity changes
npx typeorm migration:generate src/database/migrations/AutoMigration -d src/config/data-source.ts
```

### Seeding

The seed command populates the database with:
- 8 Subscriber companies (tenants)
- 56 users (7 per subscriber with different roles)
- Sample individual and organization entities
- Custom fields, documents, and relationships
- Lookup lists and configurations

```bash
npm run seed
```

---

## 📚 API Documentation

### Accessing Swagger

Once the server is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:3004/api/docs
- **OpenAPI JSON**: http://localhost:3004/api-json

### API Endpoints Overview

#### Authentication (`/api/v1/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new subscriber |
| POST | `/login` | User login |
| POST | `/refresh` | Refresh access token |
| POST | `/logout` | User logout |
| POST | `/forgot-password` | Request password reset |
| POST | `/reset-password` | Reset password with token |
| GET | `/google` | Google OAuth2 login |
| GET | `/google/callback` | Google OAuth2 callback |

#### Entities (`/api/v1/entities`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all entities |
| GET | `/:entity_id` | Get entity details |
| GET | `/search/:name` | Search entities by name |
| POST | `/individual` | Create individual entity |
| POST | `/organization` | Create organization entity |
| PUT | `/:entity_id/individual` | Update individual entity |
| PUT | `/:entity_id/organization` | Update organization entity |
| PUT | `/:entity_id` | Update base entity |
| PATCH | `/:entity_id/status` | Update entity status |
| POST | `/:entity_id/custom-fields` | Add custom fields |
| GET | `/:entity_id/history` | Get entity history |
| POST | `/bulk` | Bulk entity operations |
| GET | `/export` | Export entities |

#### Documents (`/api/v1/entities/:entityId/documents`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload document |
| GET | `/` | List entity documents |
| GET | `/:documentId` | Get document details |
| PUT | `/:documentId` | Update document |
| DELETE | `/:documentId` | Delete document |
| POST | `/:documentId/verify` | Verify document |

#### Entity Relationships (`/api/v1/entities`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/:entityId/relationships` | Create relationship |
| GET | `/:entityId/relationships` | List relationships |
| GET | `/relationships/:id` | Get relationship details |
| PATCH | `/relationships/:id` | Update relationship |
| DELETE | `/relationships/:id` | Delete relationship |

#### Lists Management (`/api/v1/lists`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all lists |
| GET | `/:id` | Get list by ID |
| GET | `/lookup/:listType` | Get list by type |
| GET | `/lookup/name/:listName` | Get list by name |
| POST | `/` | Create new list |
| PUT | `/:id` | Update list |
| DELETE | `/:id` | Delete list |
| PATCH | `/:id/status` | Update list status |
| GET | `/:id/values` | Get list values |
| POST | `/:id/values` | Add list value |
| POST | `/:id/values/batch` | Batch add values |
| PUT | `/:id/values/:valueId` | Update value |
| DELETE | `/:id/values/:valueId` | Delete value |

#### Lookups (`/api/v1/lookups`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/types` | Entity types |
| GET | `/statuses` | Entity statuses |
| GET | `/nationalities` | Nationalities list |
| GET | `/genders` | Gender options |
| GET | `/risk-levels` | Risk levels |
| GET | `/screening-statuses` | Screening statuses |
| GET | `/organization-types` | Organization types |
| GET | `/document-types` | Document types |
| GET | `/individual-relationship-types` | Individual relationship types |
| GET | `/organization-relationship-types` | Organization relationship types |
| GET | `/association-types` | Association types |
| GET | `/all` | All lookups combined |
| GET | `/cache/clear` | Clear lookup cache |

#### Admin (`/api/v1/admin`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/document-configurations` | Create document config |
| GET | `/document-configurations` | List document configs |

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with ts-node |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run migration:run` | Run pending database migrations |
| `npm run migration:revert` | Revert the last migration |
| `npm run seed` | Seed the database with initial data |
| `npm run db:create` | Create the database |
| `npm run db:docker:up` | Start PostgreSQL Docker container |
| `npm run db:docker:down` | Stop Docker containers |
| `npm run test:api` | Run API tests |
| `npm run test:api:verbose` | Run API tests with verbose output |
| `npm run test:full` | Run full test suite |
| `npm run test:full:verbose` | Run full test suite with verbose output |
| `npm run test:e2e` | Run end-to-end tests |

---

## 🧪 Testing

### Running Tests

```bash
# Run API tests
npm run test:api

# Run with verbose output
npm run test:api:verbose

# Run full test suite
npm run test:full

# Run E2E tests
npm run test:e2e
```

### Test Users

After seeding, the following test users are available:

| Email | Role | Subscriber |
|-------|------|------------|
| user1@bank_one.test | ADMIN | Bank One |
| user2@bank_one.test | ANALYST | Bank One |
| user3@bank_one.test | REVIEWER | Bank One |
| user4@bank_one.test | AUDITOR | Bank One |
| user5@bank_one.test | COMPLIANCE_OFFICER | Bank One |
| user6@bank_one.test | RISK_MANAGER | Bank One |
| user7@bank_one.test | OPERATIONS_MANAGER | Bank One |

> **Note**: Seeded passwords are not bcrypt-hashed. For testing with the API, register a new user or update passwords in the database.

---

## 🔧 Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL container is running
docker compose ps

# View PostgreSQL logs
docker compose logs postgres

# Test database connection
docker compose exec postgres pg_isready -U postgres -d kyc_kyb_system
```

### Port Already in Use

```bash
# Find process using the port
lsof -i :3004

# Kill the process
kill -9 <PID>
```

### Migration Errors

```bash
# Check migration status
npx typeorm migration:show -d src/config/data-source.ts

# Revert problematic migration
npm run migration:revert

# Run with debug logging
DEBUG=typeorm:* npm run migration:run
```

### TypeScript Compilation Errors

```bash
# Clean and rebuild
rm -rf dist/
npm run build
```

### Docker Issues

```bash
# Reset Docker containers and volumes
npm run db:docker:down
docker volume prune -f
npm run db:docker:up
```

---

## 🏗️ Production Deployment

### Build for Production

```bash
# Install dependencies
npm ci

# Build the application
npm run build

# Start production server
NODE_ENV=production node dist/main.js
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong, unique secrets for JWT and encryption
- [ ] Set `DB_SYNCHRONIZE=false`
- [ ] Configure proper database credentials
- [ ] Enable HTTPS/TLS
- [ ] Set up proper logging
- [ ] Configure rate limiting
- [ ] Set up monitoring and alerting

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Write unit tests for new features

---

## 📄 License

This project is licensed under the ISC License.

---

## 🆘 Support

For support and questions:
1. Check the troubleshooting section above
2. Review the Swagger API documentation
3. Check existing GitHub issues
4. Create a new issue with detailed information

---

**Built with ❤️ using NestJS and TypeORM**
