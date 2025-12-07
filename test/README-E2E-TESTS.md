# Entity Relationships E2E Tests

## Overview
Comprehensive E2E test suite for the Unified Entity Relationships module.

## Test File Location
`test/entity-relationships.e2e-spec.ts`

## Prerequisites

### 1. Start PostgreSQL Database (Docker)
```powershell
cd d:\KYC-Project\backend-kyc
npm run db:docker:up
```

### 2. Run Migrations
```powershell
npm run migration:run
```

### 3. Verify Environment Variables
Ensure `.env` file contains:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=kyc_db
```

## Running the Tests

### Run All E2E Tests
```powershell
npm run test:e2e
```

### Run Only Entity Relationships Tests
```powershell
npx jest test/entity-relationships.e2e-spec.ts --runInBand --forceExit
```

### Run with Verbose Output
```powershell
npx jest test/entity-relationships.e2e-spec.ts --runInBand --forceExit --verbose
```

## Test Scenarios Covered

### A. Link Existing Entities (POST)
- ✅ Creates relationship between "Alpha Corp" and "John Doe" with type `director`
- ✅ Verifies response status 201
- ✅ Validates response contains relationship details
- ✅ Confirms record exists in database

### B. Create & Link NEW Individual (POST - Polymorphic)
- ✅ Creates new Individual entity "Jane Smith" inline
- ✅ Links to "Alpha Corp" with type `shareholder`
- ✅ Includes metadata (ownership_percentage: 10)
- ✅ Verifies new entity created in database
- ✅ Verifies relationship created successfully

### C. Create & Link NEW Organization (POST - Polymorphic)
- ✅ Creates new Organization entity "Beta LLC" inline
- ✅ Links to "John Doe" with type `employer`
- ✅ Verifies new organization created
- ✅ Verifies relationship created successfully

### D. Prevent Duplicates (Error Handling)
- ✅ Attempts to create duplicate relationship
- ✅ Expects status 409 (Conflict)
- ✅ Validates error message

### E. List Relationships (GET)
- ✅ Lists all relationships for "Alpha Corp"
- ✅ Verifies both "John Doe" and "Jane Smith" appear
- ✅ Tests active_only filter
- ✅ Validates response structure

### F. Soft Delete (DELETE)
- ✅ Soft deletes a relationship
- ✅ Expects status 200
- ✅ Verifies `deleted_at` timestamp set in database
- ✅ Confirms deleted relationships excluded from default list

### G. Additional Error Handling
- ✅ 404 when source entity doesn't exist
- ✅ 404 when target entity doesn't exist
- ✅ 400 when both target methods provided
- ✅ 400 when neither target method provided

## Test Data Seeding

The test automatically seeds the following data in `beforeAll`:

1. **Subscriber**: "Test Subscriber"
2. **User**: "Test User" (linked to subscriber)
3. **Organization Entity**: "Alpha Corp"
4. **Individual Entity**: "John Doe"

Additional entities created during tests:
- "Jane Smith" (Individual)
- "Beta LLC" (Organization)

## Authentication Mocking

The test overrides `JwtAuthGuard` to inject a mock user:
```typescript
{
  id: '<testUser.id>',
  subscriber_id: '<testSubscriber.id>',
  email: 'test@example.com'
}
```

This allows testing without actual JWT tokens.

## Database Cleanup

All test data is automatically cleaned up in `afterAll` to ensure database state is restored.

## Expected Test Results

All 14 test cases should pass:
- ✅ 1 test in "A. Link Existing Entities"
- ✅ 1 test in "B. Create & Link NEW Individual"
- ✅ 1 test in "C. Create & Link NEW Organization"
- ✅ 1 test in "D. Prevent Duplicates"
- ✅ 2 tests in "E. List Relationships"
- ✅ 2 tests in "F. Soft Delete Relationship"
- ✅ 4 tests in "G. Error Handling"

## Troubleshooting

### Database Connection Issues
- Ensure Docker PostgreSQL is running
- Verify `.env` file has correct credentials
- Check migrations are up to date

### Test Failures
- Check if database has existing conflicting data
- Ensure all migrations have run successfully
- Verify entity service implementations are correct

### Cannot Find Module Errors
- Run `npm install` to ensure all dependencies installed
- Verify TypeScript is compiled: `npm run build`
