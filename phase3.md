Generate Complete 'Entities' Module (Phase 3) Based on API Specification
Objective: Generate the complete, production-ready EntitiesModule (src/modules/entities). This module is the core of the KYC application, responsible for the comprehensive CRUD (Create, Read, Update, Delete) management of "Entities" (both Individuals and Organizations).

This implementation must be based strictly on the 9-endpoint API specification provided and must integrate seamlessly with the existing project structure, including all provided entities, repositories, and modules.

Core Architectural & Security Requirements:

Thick Service, Thin Controller: All business logic must reside in EntitiesService. The EntitiesController is only for request/response mapping, DTO validation, Swagger documentation, and extracting user context.

Authentication: All 9 endpoints in EntitiesController must be protected by the existing JwtAuthGuard.

Authorization (RBAC): Use the existing RolesGuard and @Roles decorator for all endpoints. Apply the specific permissions as defined in the API specification (e.g., view_entity, create_entity, update_entity_status, view_entity_history, export_entity).

Multi-Tenant Scoping (Critical): This is the most important security requirement. All EntitiesService methods must accept the subscriberId from the authenticated user's TokenPayload. Every single database query (find, update, delete) must be scoped to this subscriberId. An admin from Company A must never be able to see, edit, or delete entities from Company B.

Database Transaction Integrity: The create and update endpoints (2.3, 2.4, 2.5) are complex and modify multiple tables. All logic for these endpoints must be wrapped in a DataSource transaction (this.dataSource.transaction(async manager => { ... })) to ensure data integrity.

Audit Trail (History): All operations that modify entity data (Create, Update, Status Change, Delete) must create a new record in the entity_history table using the EntityHistoryRepository.

Service Orchestration: The EntitiesService will act as an orchestrator. It must inject and call other services (e.g., ScreeningService, RiskService, DocumentService, OrganizationEntityAssociationRepository). Create and inject placeholder/stub services for ScreeningService, RiskService, and DocumentService if they do not exist, so their methods can be called (e.g., this.screeningService.triggerScreening(...)).

Swagger Documentation: All 9 endpoints, all DTOs (including nested DTOs), and all API responses (success and error) must be fully documented with @nestjs/swagger decorators, matching the provided API specification.

Part 1: New File Generation Plan
Please generate the following new files:

src/modules/entities/entities.module.ts

src/modules/entities/entities.controller.ts

src/modules/entities/entities.service.ts

src/modules/entities/dto/list-entities-query.dto.ts (for API 2.1)

src/modules/entities/dto/create-dtos.common.ts (for common nested DTOs)

src/modules/entities/dto/create-individual-entity.dto.ts (for API 2.3)

src/modules/entities/dto/create-organization-entity.dto.ts (for API 2.4)

src/modules/entities/dto/update-entity.dto.ts (for API 2.5)

src/modules/entities/dto/update-entity-status.dto.ts (for API 2.6)

src/modules/entities/dto/bulk-action.dto.ts (for API 2.7)

src/modules/entities/dto/list-entity-history-query.dto.ts (for API 2.8)

src/modules/entities/dto/export-entities.dto.ts (for API 2.9)

(Create stub modules/services for Screening, Risk, and Documents if they don't exist to satisfy service injection).

Part 2: DTO Implementation Details
Generate all DTOs in src/modules/entities/dto/. They must include class-validator decorators and @ApiProperty decorators matching the API spec.

list-entities-query.dto.ts (API 2.1):

Implement all query parameters specified: page, limit, entity_type (Enum), status (Enum), risk_level (Enum), screening_status (Enum), search, created_from (Date), created_to (Date), sort_by, sort_order. Use @IsOptional(), @IsEnum(), @IsDateString(), etc.

create-dtos.common.ts:

CustomFieldDto: Create a DTO for the custom_fields array. It must match the API spec: field_key (string), field_value (string), field_type (enum: TEXT, NUMBER, etc.), field_category (string).

EntityDocumentDto: Create a DTO for the documents array. It must match the API spec: document_type (string), file (string, for base64/multipart stub), expiry_date (Date, optional).

create-individual-entity.dto.ts (API 2.3):

This DTO must be nested. Create IndividualBasicInfoDto and SelfDeclarationsDto.

IndividualBasicInfoDto: Must contain all fields from basic_information in the API spec, matching IndividualEntity. Crucially, nationality must be string[] (@IsArray()) to support multi-nationality, as requested.

SelfDeclarationsDto: Must contain is_pep (boolean), pep_details (string, optional), etc.

CreateIndividualEntityDto: Must contain onboard (boolean), basic_information (@ValidateNested()), self_declarations (@ValidateNested()), documents (array of EntityDocumentDto, optional), custom_fields (array of CustomFieldDto, optional), trigger_screening (boolean, optional), trigger_risk_analysis (boolean, optional).

create-organization-entity.dto.ts (API 2.4):

This DTO must be nested. Create OrganizationBasicInfoDto and RelatedPartyDto.

OrganizationBasicInfoDto: Must contain all fields from basic_information in the API spec, matching OrganizationEntity. name is required.

RelatedPartyDto: Must contain all fields for related_parties in the API spec, matching OrganizationEntityAssociationEntity. It must support either individual_entity_id (string, optional, for existing) or individual_data (nested DTO, optional, for new).

CreateOrganizationEntityDto: Must contain onboard (boolean), basic_information (@ValidateNested()), documents (optional), related_parties (optional), custom_fields (optional), trigger_screening (optional), trigger_risk_analysis (optional).

update-entity.dto.ts (API 2.5):

Must contain basic_information (object, optional), custom_fields (array, optional), trigger_screening (boolean, optional), trigger_risk_analysis (boolean, optional).

update-entity-status.dto.ts (API 2.6):

Must contain status (string, required, Enum) and reason (string, optional).

bulk-action.dto.ts (API 2.7):

Must contain entity_ids (array of UUIDs), action (string, Enum), parameters (object, optional).

list-entity-history-query.dto.ts (API 2.8):

Must contain page, limit, change_type (Enum, optional), date_from (Date, optional), date_to (Date, optional).

export-entities.dto.ts (API 2.9):

Must contain filters (nested ListEntitiesQueryDto, optional), format (string, Enum: 'CSV' | 'XLSX'), columns (array of strings, optional).

Part 3: Module Implementation (entities.module.ts)
File: src/modules/entities/entities.module.ts

imports:

TypeOrmModule.forFeature([...]): Import EntityEntity, IndividualEntity, OrganizationEntity, EntityHistoryEntity, EntityCustomFieldEntity, OrganizationEntityAssociationEntity, ScreeningAnalysisEntity, RiskAnalysisEntity, DocumentEntity.

forwardRef(() => AuthModule) (for Guards and TokenPayload).

LogsModule.

(Import your stub/real modules: ScreeningModule, RiskModule, DocumentsModule).

controllers: [EntitiesController]

providers:

EntitiesService

EntityRepository

IndividualEntityRepository

OrganizationEntityRepository

EntityHistoryRepository

EntityCustomFieldRepository

OrganizationEntityAssociationRepository

ScreeningAnalysisRepository

RiskAnalysisRepository

DocumentRepository

(Provide stub/real services: ScreeningService, RiskService, DocumentService).

exports: [EntitiesService, EntityRepository, IndividualEntityRepository, OrganizationEntityRepository]

Part 4: Service Implementation (entities.service.ts)
Generate the EntitiesService with all business logic.

Inject: DataSource, all repositories listed in the module, and all stub/real services (ScreeningService, RiskService, DocumentService).

Implement listEntities (API 2.1):

Method: async listEntities(subscriberId: string, query: ListEntitiesQueryDto)

Logic: Use entityRepository.findWithFilters. Critically, enforce scoping by creating a filter object: const filters = { ...query, subscriber_id: subscriberId }.

Implement getEntityDetails (API 2.2):

Method: async getEntityDetails(entityId: string, subscriberId: string)

Logic:

Fetch the base EntityEntity scoped by id AND subscriber_id. Throw NotFoundException if not found.

Based on entity_type, fetch the IndividualEntity or OrganizationEntity profile.

Use Promise.all to fetch all related data in parallel: custom_fields, relationships (from associationRepository), screening_history (latest 10), risk_history (latest 10), documents.

Assemble the complex response DTO as specified in the API. Mask sensitive fields like tax_identification_number.

Implement createIndividualEntity (API 2.3):

Method: async createIndividualEntity(dto: CreateIndividualEntityDto, subscriberId: string, userId: string)

Logic:

Use this.dataSource.transaction(async manager => { ... }).

Inside transaction:

Check for duplicate reference_number (if provided by user).

Create and save the base EntityEntity (type 'INDIVIDUAL', subscriber_id, created_by: userId).

Create and save the IndividualEntity (link entity_id, save all basic_information and self_declarations). Ensure nationality string[] is saved correctly to the jsonb column.

Loop dto.custom_fields and create/save EntityCustomFieldEntity records.

Call documentService.processUploads(..., manager) (stub).

Create and save an EntityHistoryEntity ("created").

Outside transaction:

If dto.trigger_screening, await this.screeningService.triggerScreening(...).

If dto.trigger_risk_analysis, await this.riskService.triggerAnalysis(...).

Return the response DTO as specified.

Implement createOrganizationEntity (API 2.4):

Method: async createOrganizationEntity(dto: CreateOrganizationEntityDto, subscriberId: string, userId: string)

Logic:

Use this.dataSource.transaction(async manager => { ... }).

Inside transaction:

Create/save EntityEntity (type 'ORGANIZATION').

Create/save OrganizationEntity.

Loop dto.custom_fields and save.

Loop dto.related_parties: This is complex.

If party.individual_entity_id exists, use it.

If party.individual_data exists, call a helper function (private) async createRelatedPartyIndividual(...) within the same transaction to create the new Individual + Base Entity, then get its ID.

Create and save the OrganizationEntityAssociationEntity linking the org and the individual.

Call documentService.processUploads(..., manager) (stub).

Create EntityHistoryEntity ("created").

Outside transaction: Trigger screening/risk for the org and all newly created related parties.

Return the complex response DTO.

Implement updateEntity (API 2.5):

Method: async updateEntity(entityId: string, dto: UpdateEntityDto, subscriberId: string, userId: string)

Logic:

Use this.dataSource.transaction(async manager => { ... }).

Find the entity scoped by id AND subscriber_id. Throw NotFoundException.

Get a deep copy of oldValues for history.

Update the EntityEntity and/or IndividualEntity/OrganizationEntity tables based on dto.basic_information.

Handle updates to dto.custom_fields (find existing, update, or create new).

Create EntityHistoryEntity ("updated"), logging old_values and new_values.

Outside transaction: Trigger re-screening/re-assessment if flags are true.

Return the response DTO.

Implement updateEntityStatus (API 2.6):

Method: async updateEntityStatus(entityId: string, dto: UpdateEntityStatusDto, subscriberId: string, userId: string)

Logic:

Find entity (scoped).

Save old status for history.

Update entity.status = dto.status. Save.

Log to EntityHistoryRepository (change_type: 'status_changed').

Return the specified response.

Implement bulkAction (API 2.7):

Method: async bulkAction(dto: BulkActionDto, subscriberId: string, userId: string)

Logic:

Fetch all entities: ...find({ where: { id: In(dto.entity_ids), subscriber_id: subscriberId } }).

Loop through the found entities.

Perform the dto.action (e.g., call updateEntityStatus or softDelete).

Collect succeeded and failed results (e.g., if an ID from the DTO was not found in the subscriber's account).

Return the specified response.

Implement getEntityHistory (API 2.8):

Method: async getEntityHistory(entityId: string, subscriberId: string, query: ListEntityHistoryQueryDto)

Logic:

Check Access: await this.entityRepository.findOne({ where: { id: entityId, subscriber_id: subscriberId } }). Throw NotFoundException if null.

Call entityHistoryRepository.findWithFilters(...), passing in entity_id and query params.

Implement exportEntities (API 2.9):

Method: async exportEntities(dto: ExportEntitiesDto, subscriberId: string, userId: string)

Logic: This must be an asynchronous job.

Do not generate the file here.

(Optional: Create an ExportJob entity/table to track this).

Log that the job was started.

Return the 202 Accepted response immediately, as specified: { success: true, data: { export_id: ..., status: 'PROCESSING', ... } }.

Part 5: Controller Implementation (entities.controller.ts)
Generate the EntitiesController class.

Apply class-level decorators: @ApiTags('Entity Management'), @ApiBearerAuth(), @UseGuards(JwtAuthGuard).

Implement all 9 endpoints from the API spec (2.1 to 2.9).

Each method must:

Have the correct HTTP verb (@Get, @Post, @Put, @Patch, @Delete) and path (:entity_id, individuals, bulk-action, etc.).

Have the correct @UseGuards(RolesGuard) and @Roles('...') decorator matching the "Permissions" in the API spec.

Have a full set of @ApiOperation, @ApiResponse (for success and errors 401, 403, 404, 400), and @ApiParam/@ApiQuery/@ApiBody decorators.

Extract subscriberId and sub (userId) from the @Req() req object: const { subscriberId, sub } = req.user as TokenPayload;.

Call the corresponding entitiesService method, passing all required parameters (e.g., subscriberId, userId, DTOs, params).

Example Stub for Controller:

TypeScript

@ApiTags('Entity Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('entities')
export class EntitiesController {
  constructor(private readonly entitiesService: EntitiesService) {}

  // 2.1 List Entities
  @Get()
  @UseGuards(RolesGuard)
  @Roles('view_entity')
  @ApiOperation({ summary: 'Retrieves a paginated list of all entities' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async listEntities(@Req() req: Request, @Query() query: ListEntitiesQueryDto) {
    const { subscriberId } = req.user as TokenPayload;
    return this.entitiesService.listEntities(subscriberId, query);
  }

  // 2.2 Get Entity Details
  @Get(':entity_id')
  @UseGuards(RolesGuard)
  @Roles('view_entity')
  @ApiOperation({ summary: 'Retrieves complete details of a specific entity' })
  @ApiParam({ name: 'entity_id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  async getEntityDetails(@Req() req: Request, @Param('entity_id') entityId: string) {
    const { subscriberId } = req.user as TokenPayload;
    return this.entitiesService.getEntityDetails(entityId, subscriberId);
  }

  // 2.3 Create Individual Entity
  @Post('individuals')
  @UseGuards(RolesGuard)
  @Roles('create_entity')
  @ApiOperation({ summary: 'Creates a new individual entity (KYC)' })
  @ApiResponse({ status: 201, description: 'Created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createIndividual(@Req() req: Request, @Body() dto: CreateIndividualEntityDto) {
    const { subscriberId, sub } = req.user as TokenPayload;
    return this.entitiesService.createIndividualEntity(dto, subscriberId, sub);
  }

  // 2.4 Create Organization Entity
  @Post('organizations')
  @UseGuards(RolesGuard)
  @Roles('create_entity')
  @ApiOperation({ summary: 'Creates a new organization entity (KYB)' })
  @ApiResponse({ status: 201, description: 'Created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createOrganization(@Req() req: Request, @Body() dto: CreateOrganizationEntityDto) {
    const { subscriberId, sub } = req.user as TokenPayload;
    return this.entitiesService.createOrganizationEntity(dto, subscriberId, sub);
  }

  // 2.5 Update Entity
  @Put(':entity_id')
  @UseGuards(RolesGuard)
  @Roles('update_entity')
  @ApiOperation({ summary: "Updates an existing entity's information" })
  @ApiParam({ name: 'entity_id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  async updateEntity(@Req() req: Request, @Param('entity_id') entityId: string, @Body() dto: UpdateEntityDto) {
    const { subscriberId, sub } = req.user as TokenPayload;
    return this.entitiesService.updateEntity(entityId, dto, subscriberId, sub);
  }

  // 2.6 Update Entity Status
  @Patch(':entity_id/status')
  @UseGuards(RolesGuard)
  @Roles('update_entity_status')
  @ApiOperation({ summary: "Updates the status of an entity" })
  @ApiParam({ name: 'entity_id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  async updateEntityStatus(@Req() req: Request, @Param('entity_id') entityId: string, @Body() dto: UpdateEntityStatusDto) {
    const { subscriberId, sub } = req.user as TokenPayload;
    return this.entitiesService.updateEntityStatus(entityId, dto, subscriberId, sub);
  }

  // 2.7 Bulk Entity Actions
  @Post('bulk-action')
  @UseGuards(RolesGuard)
  @Roles('admin') // Using 'admin' as a placeholder, adjust if a specific permission exists
  @ApiOperation({ summary: 'Performs bulk operations on multiple entities' })
  @ApiResponse({ status: 200, description: 'Success (partial or complete)' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async bulkAction(@Req() req: Request, @Body() dto: BulkActionDto) {
    const { subscriberId, sub } = req.user as TokenPayload;
    return this.entitiesService.bulkAction(dto, subscriberId, sub);
  }

  // 2.8 Get Entity History
  @Get(':entity_id/history')
  @UseGuards(RolesGuard)
  @Roles('view_entity_history')
  @ApiOperation({ summary: 'Retrieves complete change history for an entity' })
  @ApiParam({ name: 'entity_id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  async getEntityHistory(@Req() req: Request, @Param('entity_id') entityId: string, @Query() query: ListEntityHistoryQueryDto) {
    const { subscriberId } = req.user as TokenPayload;
    return this.entitiesService.getEntityHistory(entityId, subscriberId, query);
  }

  // 2.9 Export Entities
  @Post('export')
  @UseGuards(RolesGuard)
  @Roles('export_entity')
  @ApiOperation({ summary: 'Exports entities based on filters' })
  @ApiResponse({ status: 202, description: 'Export initiated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async exportEntities(@Req() req: Request, @Body() dto: ExportEntitiesDto) {
    const { subscriberId, sub } = req.user as TokenPayload;
    return this.entitiesService.exportEntities(dto, subscriberId, sub);
  }
}