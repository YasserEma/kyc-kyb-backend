E2E Scenario Test & Fix for Entity Wizard Flow
Role: You are an expert Senior Developer and QA Automation Engineer specializing in NestJS.

Objective: Your goal is to create a comprehensive End-to-End (E2E) test script for the new multi-stage "Entity Creation Wizard." The test must be written as a complete user scenario, where each step logically follows the one before it, storing and reusing data (like entity IDs) across requests.

Primary Directive: Fix As You Go
You have full access to the entire codebase. As you write this test, you will inevitably find bugs, logical errors, or mismatches between controllers, services, and DTOs.

You must fix the underlying application code first before you can make the test pass.

Pay close attention to these known problems and fix them:

Missing Service Method: The EntitiesController has a POST /:entity_id/documents endpoint that calls this.entitiesService.addDocument(). This method does not exist in EntitiesService. You must create the addDocument method in EntitiesService to handle the document upload logic (similar to the createDocumentFromFile logic already in DocumentsService).

created_by in DTOs: Some DTOs, like CreateOrganizationRelationshipDto, and controllers, like OrganizationEntityAssociationsController, expect a userId or created_by field to be passed in the request Body. This is poor practice and a security risk.

Your Fix: Modify all such controllers and services to get the userId from the JWT payload (req.user.sub) instead.

Remove the created_by (or userId) fields from the corresponding DTOs (like CreateOrganizationRelationshipDto).

Critical ID Mismatch (Entity vs. Sub-Entity): The application uses two types of IDs:

entity_id (from the main entities table).

The Primary Key id from the sub-tables (e.g., individual_entities.id or organization_entities.id).

The Relationship DTOs (like CreateIndividualRelationshipDto) correctly require the sub-table id, not the entity_id.

Your Fix:

Your test script must first fetch these sub-IDs after creating an entity.

The endpoint GET /entities/:entity_id/individual exists. Use it to get the id for individual entities.

The endpoint GET /entities/:entity_id/organization is missing. You must create this new endpoint in EntitiesController and EntitiesService to fetch the OrganizationEntity details (and its id) by its entity_id. This is essential for the Org-to-Org relationship test to work.

E2E Test Script Requirements (File: test/entities.e2e-spec.ts)
Create a test file that executes the following scenario using jest and supertest:

1. Setup (beforeAll):
Initialize App: Bootstrap the full NestJS AppModule.

Authenticate:

Send a POST /auth/login request with valid test user credentials (e.g., admin@test.com, password123).

Assert a 200 OK status.

Store the returned access_token in a global variable.

Test File: Create a dummy test.pdf file in the /test directory (e.g., fs.writeFileSync(...)) to be used for file upload tests.

2. Test Scenario: The Wizard Flow
Define global variables to store the IDs from step to step: individualEntityId, organizationEntityId, linkingIndividualId, linkingOrganizationId, individualSubId, organizationSubId, linkingIndividualSubId, linkingOrganizationSubId.

Describe: "Stage 1: Entity Creation"

it('should CREATE a new IndividualEntity (Primary)'):

POST /entities/individual with a CreateIndividualEntityDto.

Include a custom_fields array with field_group: 'basic_info'.

Assert 201 Created.

Store the id from the response body as individualEntityId.

it('should CREATE a new OrganizationEntity (Primary)'):

POST /entities/organization with a CreateOrganizationEntityDto.

Assert 201 Created.

Store the id as organizationEntityId.

it('should CREATE a linking IndividualEntity (Secondary)'):

POST /entities/individual (e.g., "Jane Smith").

Assert 201 Created and store the id as linkingIndividualId.

it('should CREATE a linking OrganizationEntity (Secondary)'):

POST /entities/organization (e.g., "Subsidiary Corp").

Assert 201 Created and store the id as linkingOrganizationId.

it('should FETCH and store all Sub-Entity IDs'):

GET /entities/:entity_id/individual for individualEntityId. Store body.id as individualSubId.

GET /entities/:entity_id/individual for linkingIndividualId. Store body.id as linkingIndividualSubId.

GET /entities/:entity_id/organization (the endpoint you created) for organizationEntityId. Store body.id as organizationSubId.

GET /entities/:entity_id/organization for linkingOrganizationId. Store body.id as linkingOrganizationSubId.

Assert 200 OK for all.

Describe: "Stage 2: Documents & Custom Fields"

it('should ADD a Document to the Organization'):

POST /entities/:entity_id/documents using organizationEntityId.

Use .attach('file', 'test/test.pdf') for the file upload.

Use .field(...) to send DTO data like document_type: 'incorporation_certificate'.

Assert 201 Created.

it('should ADD Stage-2 Custom Fields to the Individual'):

POST /entities/:entity_id/custom-fields using individualEntityId.

Send DTO AddCustomFieldsDto with field_group: 'documents'.

Assert 201 Created and that body.fields[0].field_group is 'documents'.

Describe: "Stage 3: Related Parties & Final Custom Fields"

it('should ADD an Organization-to-Individual relationship (Director)'):

POST /organization-entity-associations.

Send DTO using organization_entity_id: organizationEntityId and individual_entity_id: linkingIndividualId.

Assert 201 Created.

it('should ADD an Organization-to-Organization relationship (Subsidiary)'):

POST /organization-relationships.

Send DTO using the sub-IDs: primary_organization_id: organizationSubId and related_organization_id: linkingOrganizationSubId.

Assert 201 Created.

it('should ADD an Individual-to-Individual relationship (Family)'):

POST /relationships.

Send DTO using the sub-IDs: primary_individual_id: individualSubId and related_individual_id: linkingIndividualSubId.

Assert 201 Created.

it('should ADD Stage-3 Custom Fields to the Organization'):

POST /entities/:entity_id/custom-fields using organizationEntityId.

Send DTO AddCustomFieldsDto with field_group: 'related_parties'.

Assert 201 Created and that body.fields[0].field_group is 'related_parties'.

6. Teardown (afterAll):
Cleanup: Delete the test.pdf file (fs.unlinkSync(...)).

Close App: Shut down the NestJS application (await app.close()).