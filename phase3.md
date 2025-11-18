Full E2E Test Plan for KYC Application (Phase 3 - Entities & Relationships)
Objective: Execute a comprehensive end-to-end (E2E) test plan for the NestJS KYC application, focusing on the newly implemented "Phase 3" features. This plan will cover:

Environment Setup: Running the app, database, and fixing critical seeder data.

Individual API Tests: Validating each endpoint in the Entities module and the new IndividualRelationships module in isolation.

E2E Scenarios: Testing complex user journeys that chain these APIs, with a heavy focus on the new "Multi-ID" flow, "Custom Fields," "Related Parties," and critical security (Multi-Tenancy & RBAC).

Phase 1: Environment Setup & Data Correction
Install Dependencies: Run npm install to ensure all packages are present.

Configure Environment (.env):

Create a .env file in the root directory with all required variables (Database credentials, JWT secrets, Nodemailer credentials, Google OAuth keys).

Start Database: Run docker compose up -d to start the PostgreSQL container.

CRITICAL FIX - Correct Seeder Data:

Before seeding, open src/database/seeders/02-subscriber-users.seeder.ts.

The file contains the plaintext password "hashed-password". This will cause all seeded user logins to fail.

Action: Generate a valid bcrypt hash for a known password (e.g., "Password123!").

Replace all instances of "hashed-password" in that file with the new, valid bcrypt hash string.

Run Migrations: Execute npm run migration:run (or the equivalent command) to run all migrations, including the new ones for individual-identity-documents and the modifications to individual_entities.

Seed Database: Run npm run seed to populate the database with the corrected test data.

Run Application: Run npm run start:dev. Verify the application starts successfully.

Phase 2: Individual API Test Cases (Isolation)
Prerequisite: Use Postman or a similar tool.

Login as Admin (Bank): POST /api/v1/auth/login with user1@bank_one.test and "Password123!". Store the returned access_token as ADMIN_TOKEN_BANK.

Login as Admin (Supermarket): POST /api/v1/auth/login with user1@supermarket.test. Store ADMIN_TOKEN_SUPERMARKET.

Login as Analyst (Bank): POST /api/v1/auth/login with user2@bank_one.test. Store ANALYST_TOKEN_BANK.

Test Suite 1: EntitiesModule (/entities)

API 2.1: GET /api/v1/entities (List Entities)

Test 2.1.1 (Success): Use ADMIN_TOKEN_BANK. GET /api/v1/entities. Expect 200 OK and a paginated list of entities seeded for bank_one.

Test 2.1.2 (Filtering): Use ADMIN_TOKEN_BANK. GET /api/v1/entities?status=ACTIVE&entity_type=INDIVIDUAL. Expect 200 OK and a filtered list.

Test 2.1.3 (Security): Use ANALYST_TOKEN_BANK. GET /api/v1/entities. Expect 200 OK (RBAC: view_entity permission).

API 2.3: POST /api/v1/entities/individuals (Create Individual)

Test 2.3.1 (Success - Full Refactor): Use ADMIN_TOKEN_BANK. Send a POST request with a body matching create-individual-entity.dto.ts, specifically testing the new features:

JSON

{
  "onboard": true,
  "basic_information": { "name": "John Smith (Multi-ID Test)" /*...other fields*/ },
  "self_declarations": { "is_pep": false, "has_criminal_record": false },
  "identity_documents": [
    {
      "nationality": "EG",
      "id_type": "NATIONAL_ID",
      "id_number": "30001010101010",
      "file": "base64_string_of_eg_id.pdf"
    },
    {
      "nationality": "US",
      "id_type": "PASSPORT",
      "id_number": "E12345678",
      "expiry_date": "2030-01-01",
      "file": "base64_string_of_us_passport.jpg"
    }
  ],
  "custom_fields": [
    {
      "field_key": "customer_source",
      "field_value": "Walk-in",
      "field_type": "TEXT",
      "field_category": "Acquisition"
    }
  ],
  "trigger_screening": true,
  "trigger_risk_analysis": true
}
Expect: 201 Created. Store the new entity_id as NEW_INDIVIDUAL_ID.

Verify: Check the database to confirm:

One record in entities.

One record in individual_entities (with NO flat nationality or national_id fields).

Two records in individual_identity_documents linked to this individual.

One record in entity_custom_fields.

One record in entity_history with change_type: 'created'.

API 2.4: POST /api/v1/entities/organizations (Create Organization)

Test 2.4.1 (Success - Full Logic): Use ADMIN_TOKEN_BANK. Send a POST request testing related_parties and custom_fields:

JSON

{
  "onboard": true,
  "basic_information": { "name": "Org (Full Test)", "country_of_incorporation": "US", "date_of_incorporation": "2020-01-01", "registered_address": "123 Main St" },
  "related_parties": [
    {
      "individual_data": { "name": "Test UBO", "nationality": ["US"] },
      "relationship_type": "UBO",
      "ownership_percentage": 50
    }
  ],
  "custom_fields": [
    { "field_key": "business_line", "field_value": "Payments", "field_type": "TEXT", "field_category": "Business" }
  ]
}
Expect: 201 Created. Store the new entity_id as NEW_ORG_ID.

Verify: Check the database to confirm:

One record in entities (NEW_ORG_ID).

One new IndividualEntity ("Test UBO") was also created.

One record in organization_entity_associations linking NEW_ORG_ID to the new "Test UBO".

One record in entity_custom_fields.

API 2.2: GET /api/v1/entities/{entity_id} (Get Details)

Test 2.2.1 (Success - Individual): Use ADMIN_TOKEN_BANK. GET /api/v1/entities/{NEW_INDIVIDUAL_ID}.

Expect: 200 OK. Verify the response body:

profile does not contain flat nationality or national_id.

The root of the response (or a new field) contains the identity_documents array (with 2 items).

The custom_fields array contains 1 item ("customer_source").

Test 2.2.2 (Success - Organization): Use ADMIN_TOKEN_BANK. GET /api/v1/entities/{NEW_ORG_ID}.

Expect: 200 OK. Verify the relationships array contains the "Test UBO".

API 2.8: GET /api/v1/entities/{entity_id}/history (Get History)

Test 2.8.1 (Success): Use ADMIN_TOKEN_BANK. GET /api/v1/entities/{NEW_INDIVIDUAL_ID}/history.

Expect: 200 OK with at least one "created" record.

API 2.5: PUT /api/v1/entities/{entity_id} (Update Entity)

Test 2.5.1 (Success): Use ADMIN_TOKEN_BANK. PUT /api/v1/entities/{NEW_INDIVIDUAL_ID} with a body to update occupation and add a new custom_field.

Expect: 200 OK.

Verify: Check GET /api/v1/entities/{NEW_INDIVIDUAL_ID}/history. Expect a new "updated" record in entity_history.

API 2.6: PATCH /api/v1/entities/{entity_id}/status (Update Status)

Test 2.6.1 (Success): Use ADMIN_TOKEN_BANK. PATCH /api/v1/entities/{NEW_INDIVIDUAL_ID}/status with body {"status": "BLOCKED"}.

Expect: 200 OK. Verify status is "BLOCKED".

API 2.7: POST /api/v1/entities/bulk-action (Bulk Action)

Test 2.7.1 (Success - Delete): Use ADMIN_TOKEN_BANK. POST /api/v1/entities/bulk-action with body {"entity_ids": ["{NEW_INDIVIDUAL_ID}"], "action": "DELETE"}.

Expect: 200 OK.

Verify: GET /api/v1/entities/{NEW_INDIVIDUAL_ID}. Expect 404 Not Found (due to soft delete).

API 2.9: POST /api/v1/entities/export (Export Entities)

Test 2.9.1 (Success): Use ADMIN_TOKEN_BANK. POST /api/v1/entities/export with filters.

Expect: 202 Accepted response with export_id and status: 'PROCESSING'.

Test Suite 2: IndividualEntityRelationshipsModule (/entities/:id/relationships)

Prerequisite: Create two new individuals: INDIVIDUAL_A_ID and INDIVIDUAL_B_ID.

Test 2.10.1 (Success - Create Relation): Use ADMIN_TOKEN_BANK. POST /api/v1/entities/{INDIVIDUAL_A_ID}/relationships with body:

JSON

{
  "related_individual_id": "{INDIVIDUAL_B_ID_FROM_ENTITY_TABLE}",
  "relationship_type": "PARTNER",
  "effective_from": "2020-01-01"
}
Expect: 201 Created.

Verify: Check the individual_entity_relationships table for the new record.

Test 2.10.2 (Success - Get Relations): Use ADMIN_TOKEN_BANK. GET /api/v1/entities/{INDIVIDUAL_A_ID}/relationships.

Expect: 200 OK with an array containing the "PARTNER" relationship to INDIVIDUAL_B_ID.

Test 2.10.3 (Success - Delete Relation): Get the relationship_id from the test above. DELETE /api/v1/individual-relationships/{relationship_id}.

Expect: 204 No Content or 200 OK.

Verify: GET /api/v1/entities/{INDIVIDUAL_A_ID}/relationships. Expect an empty array [].

Phase 3: E2E Scenarios (Security & Flow)
Scenario 3.1: Multi-Tenancy Security (CRITICAL TEST)

Action: Use ADMIN_TOKEN_BANK (from Bank 1).

Action: Get the entity_id of a seeded entity belonging to Supermarket 1 (e.g., 550e8400-e29b-41d4-a716-446655440021 from 08-entities.seeder.ts). Let's call it SUPERMARKET_ENTITY_ID.

Test: GET /api/v1/entities/{SUPERMARKET_ENTITY_ID}.

Expected: 404 Not Found. (The service entities.service.ts must scope the findOne query by subscriberId, making this entity "not found" for Bank 1's admin).

Test: PUT /api/v1/entities/{SUPERMARKET_ENTITY_ID} (with any valid body).

Expected: 404 Not Found.

Test: POST /api/v1/entities/{SUPERMARKET_ENTITY_ID}/relationships (with any valid body).

Expected: 404 Not Found (or 403 Forbidden).

Scenario 3.2: Role-Based Access Control (RBAC)

Action: Use ANALYST_TOKEN_BANK.

Test (Success): GET /api/v1/entities. Expected: 200 OK (Permission: view_entity).

Test (Success): POST /api/v1/entities/individuals (with valid body). Expected: 201 Created (Permission: create_entity).

Test (Failure): POST /api/v1/entities/bulk-action (with action: "DELETE"). Expected: 403 Forbidden (Permission: admin only).

Test (Failure): PATCH /api/v1/entities/{NEW_INDIVIDUAL_ID}/status. Expected: 403 Forbidden (Permission: update_entity_status).