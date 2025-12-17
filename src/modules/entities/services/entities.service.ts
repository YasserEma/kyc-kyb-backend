import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';

import { EntityRepository } from '../repositories/entity.repository';
import { IndividualEntityRepository } from '../repositories/individual-entity.repository';
import { OrganizationEntityRepository } from '../repositories/organization-entity.repository';
import { EntityHistoryRepository } from '../../entity-history/repositories/entity-history.repository';
import { EntityCustomFieldRepository } from '../../entity-custom-fields/repositories/entity-custom-field.repository';
import { ScreeningAnalysisRepository } from '../../screening-analysis/repositories/screening-analysis.repository';
import { RiskAnalysisRepository } from '../../risk-analysis/repositories/risk-analysis.repository';
import { DocumentRepository } from '../../documents/repositories/document.repository';
import { DocumentConfigurationRepository } from '../../document-configurations/repositories/document-configuration.repository';
import { IndividualIdentityDocumentRepository } from '../../individual-identity-documents/individual-identity-document.repository';
// // import { OrganizationEntityAssociationRepository } from '../../organization-entity-associations/repositories/organization-entity-association.repository';
import { EncryptionHelper } from '../../../utils/database/encryption.helper';
import { LocalStorageService } from '../../common/services/local-storage.service';

import { ListEntitiesQueryDto } from '../dtos/list-entities.dto';
import { CreateIndividualEntityDto } from '../dtos/create-individual-entity.dto';
import { CreateOrganizationEntityDto } from '../dtos/create-organization-entity.dto';
import { UpdateEntityDto } from '../dtos/update-entity.dto';
import { UpdateEntityStatusDto } from '../dtos/update-entity-status.dto';
import { UpdateIndividualEntityDto } from '../dtos/update-individual-entity.dto';
import { UpdateOrganizationEntityDto } from '../dtos/update-organization-entity.dto';
import { BulkActionDto } from '../dtos/bulk-action.dto';
import { ExportEntitiesDto } from '../dtos/export-entities.dto';
import { AddCustomFieldsDto } from '../dtos/add-custom-fields.dto';

import { EntityRelationshipRepository } from '../../entity-relationships/repositories/entity-relationship.repository';

// ... (existing imports)

@Injectable()
export class EntitiesService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly entityRepository: EntityRepository,
    private readonly individualEntityRepository: IndividualEntityRepository,
    private readonly organizationEntityRepository: OrganizationEntityRepository,
    private readonly entityHistoryRepository: EntityHistoryRepository,
    private readonly entityCustomFieldRepository: EntityCustomFieldRepository,
    private readonly screeningAnalysisRepository: ScreeningAnalysisRepository,
    private readonly riskAnalysisRepository: RiskAnalysisRepository,
    private readonly documentRepository: DocumentRepository,
    private readonly documentConfigurationRepository: DocumentConfigurationRepository,
    private readonly identityDocumentRepository: IndividualIdentityDocumentRepository,
    private readonly entityRelationshipRepository: EntityRelationshipRepository,
    private readonly configService: ConfigService,
    private readonly storageService: LocalStorageService,
  ) { }

  async listEntities(subscriberId: string, query: ListEntitiesQueryDto) {
    return this.entityRepository.findWithFilters(
      {
        subscriber_id: subscriberId,
        entity_type: query.entity_type,
        status: query.status as any,
        statuses: query.statuses,  // Multi-select with OR logic
        risk_level: query.risk_level as any,
        screening_status: query.screening_status as any,
        onboarding_completed: query.onboarding_completed,
        name: query.name,
        reference_number: query.reference_number,
        search: query.search,
        nationalities: query.nationalities,  // Multi-select with OR logic
      },
      {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
        sortBy: query.sortBy,
        sortOrder: (query.sortOrder as any) ?? 'DESC',
      }
    );
  }

  async getEntityDetails(subscriberId: string, entityId: string) {
    const entity = await this.entityRepository.findDetailsById(subscriberId, entityId);
    if (!entity) throw new NotFoundException('Entity not found');

    const [
      documents,
      customFields,
      relationships,
      riskAnalysis,
      screeningAnalysis
    ] = await Promise.all([
      this.documentRepository.find({
        where: { entity_id: entityId, subscriber_id: subscriberId, is_active: true },
        relations: ['document_configuration'],
        order: { created_at: 'DESC' },
      }),
      this.entityCustomFieldRepository.find({
        where: { entity_id: entityId },
        order: { display_order: 'ASC', created_at: 'ASC' }
      }),
      this.entityRelationshipRepository.findActiveRelationships(entityId),
      this.riskAnalysisRepository.find({
        where: { entity_id: entityId },
        order: { created_at: 'DESC' },
        take: 1 // Latest risk analysis
      }),
      this.screeningAnalysisRepository.find({
        where: { entity_id: entityId },
        order: { created_at: 'DESC' },
        take: 1 // Latest screening analysis
      })
    ]);

    const docsWithUrls = await Promise.all(
      documents.map(async (d: any) => ({
        id: d.id,
        name: d.document_name,
        type: d.document_type,
        expiry_date: d.expiry_date,
        url: await (d.storage_path ? this.storageService.getFileUrl(d.storage_path) : this.storageService.getFileUrl(d.file_path)),
        configuration: d.document_configuration ? { id: d.document_configuration.id, name: d.document_configuration.name, code: d.document_configuration.code } : null,
      }))
    );

    return {
      ...entity,
      documents: docsWithUrls,
      custom_fields: customFields,
      relationships: relationships,
      risk_analysis: riskAnalysis[0] || null,
      screening_analysis: screeningAnalysis[0] || null,
    } as any;
  }

  async createIndividualEntity(subscriberId: string, userId: string, dto: CreateIndividualEntityDto) {
    const referenceNumber = `REF-${randomUUID()}`;
    // Debug context for troubleshooting runtime errors
    // Note: left intentionally verbose to aid investigation; remove once stable
    console.log('[EntitiesService] createIndividualEntity called', {
      subscriberId,
      userId,
      name: dto?.name,
      dob: dto?.date_of_birth,
    });

    try {
      return this.dataSource.transaction(async manager => {
        // Check for duplicate entity name within the same subscriber
        const existingEntity = await manager
          .getRepository((this.entityRepository as any).repository.target)
          .findOne({
            where: {
              subscriber_id: subscriberId,
              name: dto.name,
              is_active: true,
              deleted_at: null
            }
          });

        if (existingEntity) {
          throw new ConflictException(`An entity with the name "${dto.name}" already exists for this subscriber`);
        }

        // Create base entity
        const baseEntity = this.entityRepository.create({
          subscriber_id: subscriberId,
          entity_type: 'individual',
          name: dto.name,
          reference_number: referenceNumber,
          status: 'PENDING',
          created_by: userId,
        });
        // Explicitly set relation too, in case column assignment is lost
        (baseEntity as any).creator = { id: userId } as any;
        console.log('[EntitiesService] baseEntity pre-save snapshot', {
          id: (baseEntity as any)?.id,
          subscriber_id: (baseEntity as any)?.subscriber_id,
          created_by: (baseEntity as any)?.created_by,
          has_creator_relation: !!(baseEntity as any)?.creator,
        });
        const savedEntity = await manager
          .getRepository((this.entityRepository as any).repository.target)
          .save(baseEntity)
          .catch((err) => {
            console.error('[EntitiesService] Failed to save base entity', {
              message: err?.message,
              code: err?.code,
              detail: err?.detail,
              column: err?.column,
            });
            throw err;
          });

        // Create individual entity record
        const individualRecord = this.individualEntityRepository.create({
          entity_id: savedEntity.id,
          date_of_birth: new Date(dto.date_of_birth),
          nationality: dto.nationality,
          country_of_residence: dto.country_of_residence ?? [],
          gender: dto.gender,
          address: dto.address,
          occupation: dto.occupation,
          source_of_income: dto.source_of_income,
          is_pep: dto.is_pep ?? false,
          has_criminal_record: dto.has_criminal_record ?? false,
          pep_details: dto.pep_details,
          criminal_record_details: dto.criminal_record_details,
        });
        await manager
          .getRepository((this.individualEntityRepository as any).repository.target)
          .save(individualRecord)
          .catch((err) => {
            console.error('[EntitiesService] Failed to save individual record', {
              message: err?.message,
              code: err?.code,
              detail: err?.detail,
              column: err?.column,
            });
            throw err;
          });



        // Save custom fields if provided
        if (Array.isArray(dto.custom_fields) && dto.custom_fields.length) {
          for (const cf of dto.custom_fields) {
            const fieldRecord = this.entityCustomFieldRepository.create({
              entity_id: savedEntity.id,
              field_name: cf.field_name,
              field_type: (cf.field_type ?? 'text') as any,
              field_value: cf.field_value,
              field_value_json: cf.field_value_json,
              field_group: cf.field_group,
              is_required: cf.is_required ?? false,
              is_searchable: cf.is_searchable ?? false,
              is_visible: cf.is_visible ?? true,
              is_editable: cf.is_editable ?? true,
              is_encrypted: cf.is_encrypted ?? false,
              is_pii: cf.is_pii ?? false,
              display_order: cf.display_order ?? 0,
              created_by: userId,
            } as any);
            await manager.getRepository((this.entityCustomFieldRepository as any).repository.target).save(fieldRecord);
          }
        }

        await manager.getRepository((this.entityHistoryRepository as any).repository.target).save(
          this.entityHistoryRepository.create({
            entity_id: savedEntity.id,
            changed_by: userId,
            change_type: 'created',
            change_description: 'Individual entity created',
            new_values: {
              entity: { id: savedEntity.id, type: 'individual', name: savedEntity.name },
              individual: { id: individualRecord.id, date_of_birth: individualRecord.date_of_birth },
            },
          })
        );

        // Placeholder orchestration: create pending screening and risk entries if needed
        // Skipping actual creation to avoid schema assumptions; repositories expose filters for later queries.

        return savedEntity;
      });
    } catch (err: any) {
      console.error('[EntitiesService] createIndividualEntity errored', {
        message: err?.message,
        code: err?.code,
        detail: err?.detail,
        column: err?.column,
        stack: err?.stack,
      });
      throw new InternalServerErrorException({
        message: 'Failed to create individual entity',
        code: err?.code,
        detail: err?.detail,
        column: err?.column,
      });
    }
  }

  async getIndividualProfileByEntityId(subscriberId: string, entityId: string) {
    // Ensure the base entity belongs to the subscriber for multi-tenant safety
    const entity = await this.entityRepository.findOne({ where: { id: entityId, subscriber_id: subscriberId, is_active: true } });
    if (!entity) throw new NotFoundException('Entity not found');

    const individual = await this.individualEntityRepository.findByEntityId(entityId);
    if (!individual) throw new NotFoundException('Individual profile not found');
    return individual;
  }

  async getOrganizationProfileByEntityId(subscriberId: string, entityId: string) {
    const entity = await this.entityRepository.findOne({ where: { id: entityId, subscriber_id: subscriberId, is_active: true } });
    if (!entity) throw new NotFoundException('Entity not found');

    const organization = await this.organizationEntityRepository.findByEntityId(entityId);
    if (!organization) throw new NotFoundException('Organization profile not found');
    return organization;
  }

  async getEntityNationality(subscriberId: string, entityId: string) {
    const entity = await this.entityRepository.findOne({ where: { id: entityId, subscriber_id: subscriberId, is_active: true } });
    if (!entity) throw new NotFoundException('Entity not found');

    if (entity.entity_type === 'individual') {
      const individual = await this.individualEntityRepository.findByEntityId(entityId);
      if (!individual) throw new NotFoundException('Individual profile not found');

      return {
        entity_id: entity.id,
        entity_name: entity.name,
        nationality: individual.nationality || [],
        country_of_residence: individual.country_of_residence || [],
      };
    } else if (entity.entity_type === 'organization') {
      const organization = await this.organizationEntityRepository.findByEntityId(entityId);
      if (!organization) throw new NotFoundException('Organization profile not found');

      return {
        entity_id: entity.id,
        entity_name: entity.name,
        country_of_incorporation: organization.country_of_incorporation,
      };
    }

    throw new NotFoundException('Invalid entity type');
  }

  async createOrganizationEntity(subscriberId: string, userId: string, dto: CreateOrganizationEntityDto) {
    const referenceNumber = `REF-${randomUUID()}`;

    try {
      return await this.dataSource.transaction(async manager => {
        // Check for duplicate entity name within the same subscriber
        const existingEntity = await manager
          .getRepository((this.entityRepository as any).repository.target)
          .findOne({
            where: {
              subscriber_id: subscriberId,
              name: dto.name,
              is_active: true,
              deleted_at: null
            }
          });

        if (existingEntity) {
          throw new ConflictException(`An entity with the name "${dto.name}" already exists for this subscriber`);
        }

        // Create base entity
        const baseEntity = this.entityRepository.create({
          subscriber_id: subscriberId,
          entity_type: 'organization',
          name: dto.name,
          reference_number: referenceNumber,
          status: 'PENDING',
          created_by: userId,
        });
        const savedEntity = await manager.getRepository((this.entityRepository as any).repository.target).save(baseEntity);

        // Create organization entity record
        const orgRecord = this.organizationEntityRepository.create({
          entity_id: savedEntity.id,
          legal_name: dto.legal_name,
          trade_name: dto.trade_name,
          country_of_incorporation: dto.country_of_incorporation,
          date_of_incorporation: new Date(dto.date_of_incorporation),
          organization_type: dto.organization_type,
          legal_structure: dto.legal_structure,
          tax_identification_number: dto.tax_identification_number,
          commercial_registration_number: dto.commercial_registration_number,
          registered_address: dto.registered_address,
          operating_address: dto.operating_address,
          contact_email: dto.contact_email,
          contact_phone: dto.contact_phone,
          industry_sector: dto.industry_sector,
          number_of_employees: dto.number_of_employees,
          annual_revenue: dto.annual_revenue,
        });
        await manager.getRepository((this.organizationEntityRepository as any).repository.target).save(orgRecord);

        // Save custom fields if provided
        if (Array.isArray(dto.custom_fields) && dto.custom_fields.length) {
          for (const cf of dto.custom_fields) {
            const fieldRecord = this.entityCustomFieldRepository.create({
              entity_id: savedEntity.id,
              field_name: cf.field_name,
              field_type: (cf.field_type ?? 'text') as any,
              field_value: cf.field_value,
              field_value_json: cf.field_value_json,
              field_group: cf.field_group,
              is_required: cf.is_required ?? false,
              is_searchable: cf.is_searchable ?? false,
              is_visible: cf.is_visible ?? true,
              is_editable: cf.is_editable ?? true,
              is_encrypted: cf.is_encrypted ?? false,
              is_pii: cf.is_pii ?? false,
              display_order: cf.display_order ?? 0,
              created_by: userId,
            } as any);
            await manager.getRepository((this.entityCustomFieldRepository as any).repository.target).save(fieldRecord);
          }
        }



        // History log
        await manager.getRepository((this.entityHistoryRepository as any).repository.target).save(
          this.entityHistoryRepository.create({
            entity_id: savedEntity.id,
            changed_by: userId,
            change_type: 'created',
            change_description: 'Organization entity created',
            new_values: { entity: savedEntity, organization: orgRecord },
          })
        );

        return savedEntity;
      });
    } catch (err: any) {
      console.error('[EntitiesService] createOrganizationEntity errored', {
        message: err?.message,
        code: err?.code,
        detail: err?.detail,
        column: err?.column,
        stack: err?.stack,
      });
      throw new InternalServerErrorException({
        message: 'Failed to create organization entity',
        code: err?.code,
        detail: err?.detail,
        column: err?.column,
      });
    }
  }

  async updateEntity(subscriberId: string, entityId: string, userId: string, dto: UpdateEntityDto) {
    return this.dataSource.transaction(async manager => {
      const repo = manager.getRepository((this.entityRepository as any).repository.target);
      const existing = await repo.findOne({ where: { id: entityId, subscriber_id: subscriberId, is_active: true } });
      if (!existing) throw new NotFoundException('Entity not found');

      const oldValues = { name: existing.name, risk_level: existing.risk_level, screening_status: existing.screening_status, onboarding_completed: existing.onboarding_completed };

      if (dto.name !== undefined) existing.name = dto.name;
      if (dto.risk_level !== undefined) existing.risk_level = dto.risk_level;
      if (dto.screening_status !== undefined) existing.screening_status = dto.screening_status;
      if (dto.onboarding_completed !== undefined) {
        existing.onboarding_completed = dto.onboarding_completed;
        existing.onboarded_at = dto.onboarding_completed ? new Date() : existing.onboarded_at;
      }
      existing.updated_by = userId;

      const saved = await repo.save(existing);

      await manager.getRepository((this.entityHistoryRepository as any).repository.target).save(
        this.entityHistoryRepository.create({
          entity_id: entityId,
          changed_by: userId,
          change_type: 'updated',
          change_description: 'Entity updated',
          old_values: oldValues,
          new_values: { name: saved.name, risk_level: saved.risk_level, screening_status: saved.screening_status, onboarding_completed: saved.onboarding_completed },
          changed_fields: Object.keys(dto).filter(k => (dto as any)[k] !== undefined),
        })
      );

      return saved;
    });
  }

  async updateEntityStatus(subscriberId: string, entityId: string, userId: string, dto: UpdateEntityStatusDto) {
    return this.dataSource.transaction(async manager => {
      const repo = manager.getRepository((this.entityRepository as any).repository.target);
      const existing = await repo.findOne({ where: { id: entityId, subscriber_id: subscriberId, is_active: true } });
      if (!existing) throw new NotFoundException('Entity not found');

      const oldStatus = existing.status;
      existing.status = (dto.status || '').toUpperCase();
      existing.updated_by = userId;

      const saved = await repo.save(existing);
      await manager.getRepository((this.entityHistoryRepository as any).repository.target).save(
        this.entityHistoryRepository.create({
          entity_id: entityId,
          changed_by: userId,
          change_type: 'status_changed',
          change_description: `Status changed from ${oldStatus} to ${existing.status}`,
          old_values: { status: oldStatus },
          new_values: { status: existing.status },
          change_reason: dto.reason,
        })
      );

      return saved;
    });
  }

  /**
   * Update individual entity profile
   * Updates both base entity and individual-specific fields
   */
  async updateIndividualEntity(subscriberId: string, entityId: string, userId: string, dto: UpdateIndividualEntityDto) {
    return this.dataSource.transaction(async manager => {
      const entityRepo = manager.getRepository((this.entityRepository as any).repository.target);
      const individualRepo = manager.getRepository((this.individualEntityRepository as any).repository.target);

      // Find base entity
      const entity = await entityRepo.findOne({ where: { id: entityId, subscriber_id: subscriberId, is_active: true } });
      if (!entity) throw new NotFoundException('Entity not found');
      if (entity.entity_type !== 'individual') throw new BadRequestException('Entity is not an individual type');

      // Find individual profile
      const individual = await individualRepo.findOne({ where: { entity_id: entityId } });
      if (!individual) throw new NotFoundException('Individual profile not found');

      // Capture old values for history
      const oldEntityValues: any = {};
      const oldIndividualValues: any = {};
      const changedFields: string[] = [];

      // Update base entity fields
      if (dto.name !== undefined && dto.name !== entity.name) {
        oldEntityValues.name = entity.name;
        entity.name = dto.name;
        changedFields.push('name');
      }
      if (dto.risk_level !== undefined && dto.risk_level !== entity.risk_level) {
        oldEntityValues.risk_level = entity.risk_level;
        entity.risk_level = dto.risk_level;
        changedFields.push('risk_level');
      }
      if (dto.screening_status !== undefined && dto.screening_status !== entity.screening_status) {
        oldEntityValues.screening_status = entity.screening_status;
        entity.screening_status = dto.screening_status;
        changedFields.push('screening_status');
      }
      if (dto.onboarding_completed !== undefined && dto.onboarding_completed !== entity.onboarding_completed) {
        oldEntityValues.onboarding_completed = entity.onboarding_completed;
        entity.onboarding_completed = dto.onboarding_completed;
        if (dto.onboarding_completed) entity.onboarded_at = new Date();
        changedFields.push('onboarding_completed');
      }

      entity.updated_by = userId;

      // Update individual-specific fields
      if (dto.date_of_birth !== undefined) {
        oldIndividualValues.date_of_birth = individual.date_of_birth;
        individual.date_of_birth = new Date(dto.date_of_birth);
        changedFields.push('date_of_birth');
      }
      if (dto.nationality !== undefined) {
        oldIndividualValues.nationality = individual.nationality;
        individual.nationality = dto.nationality;
        changedFields.push('nationality');
      }
      if (dto.country_of_residence !== undefined) {
        oldIndividualValues.country_of_residence = individual.country_of_residence;
        individual.country_of_residence = dto.country_of_residence;
        changedFields.push('country_of_residence');
      }
      if (dto.gender !== undefined) {
        oldIndividualValues.gender = individual.gender;
        individual.gender = dto.gender;
        changedFields.push('gender');
      }
      if (dto.address !== undefined) {
        oldIndividualValues.address = individual.address;
        individual.address = dto.address;
        changedFields.push('address');
      }
      if (dto.occupation !== undefined) {
        oldIndividualValues.occupation = individual.occupation;
        individual.occupation = dto.occupation;
        changedFields.push('occupation');
      }
      if (dto.source_of_income !== undefined) {
        oldIndividualValues.source_of_income = individual.source_of_income;
        individual.source_of_income = dto.source_of_income;
        changedFields.push('source_of_income');
      }
      if (dto.is_pep !== undefined) {
        oldIndividualValues.is_pep = individual.is_pep;
        individual.is_pep = dto.is_pep;
        changedFields.push('is_pep');
      }
      if (dto.pep_details !== undefined) {
        oldIndividualValues.pep_details = individual.pep_details;
        individual.pep_details = dto.pep_details;
        changedFields.push('pep_details');
      }
      if (dto.has_criminal_record !== undefined) {
        oldIndividualValues.has_criminal_record = individual.has_criminal_record;
        individual.has_criminal_record = dto.has_criminal_record;
        changedFields.push('has_criminal_record');
      }
      if (dto.criminal_record_details !== undefined) {
        oldIndividualValues.criminal_record_details = individual.criminal_record_details;
        individual.criminal_record_details = dto.criminal_record_details;
        changedFields.push('criminal_record_details');
      }

      // Save both records
      const savedEntity = await entityRepo.save(entity);
      const savedIndividual = await individualRepo.save(individual);

      // Log history
      if (changedFields.length > 0) {
        await manager.getRepository((this.entityHistoryRepository as any).repository.target).save(
          this.entityHistoryRepository.create({
            entity_id: entityId,
            changed_by: userId,
            change_type: 'updated',
            change_description: `Updated individual entity: ${changedFields.join(', ')}`,
            old_values: { ...oldEntityValues, ...oldIndividualValues },
            new_values: dto,
            changed_fields: changedFields,
          })
        );
      }

      return { entity: savedEntity, individual: savedIndividual };
    });
  }

  /**
   * Update organization entity profile
   * Updates both base entity and organization-specific fields
   */
  async updateOrganizationEntity(subscriberId: string, entityId: string, userId: string, dto: UpdateOrganizationEntityDto) {
    return this.dataSource.transaction(async manager => {
      const entityRepo = manager.getRepository((this.entityRepository as any).repository.target);
      const orgRepo = manager.getRepository((this.organizationEntityRepository as any).repository.target);

      // Find base entity
      const entity = await entityRepo.findOne({ where: { id: entityId, subscriber_id: subscriberId, is_active: true } });
      if (!entity) throw new NotFoundException('Entity not found');
      if (entity.entity_type !== 'organization') throw new BadRequestException('Entity is not an organization type');

      // Find organization profile
      const organization = await orgRepo.findOne({ where: { entity_id: entityId } });
      if (!organization) throw new NotFoundException('Organization profile not found');

      // Capture old values for history
      const oldEntityValues: any = {};
      const oldOrgValues: any = {};
      const changedFields: string[] = [];

      // Update base entity fields
      if (dto.name !== undefined && dto.name !== entity.name) {
        oldEntityValues.name = entity.name;
        entity.name = dto.name;
        changedFields.push('name');
      }
      if (dto.risk_level !== undefined && dto.risk_level !== entity.risk_level) {
        oldEntityValues.risk_level = entity.risk_level;
        entity.risk_level = dto.risk_level;
        changedFields.push('risk_level');
      }
      if (dto.screening_status !== undefined && dto.screening_status !== entity.screening_status) {
        oldEntityValues.screening_status = entity.screening_status;
        entity.screening_status = dto.screening_status;
        changedFields.push('screening_status');
      }
      if (dto.onboarding_completed !== undefined && dto.onboarding_completed !== entity.onboarding_completed) {
        oldEntityValues.onboarding_completed = entity.onboarding_completed;
        entity.onboarding_completed = dto.onboarding_completed;
        if (dto.onboarding_completed) entity.onboarded_at = new Date();
        changedFields.push('onboarding_completed');
      }

      entity.updated_by = userId;

      // Update organization-specific fields
      if (dto.legal_name !== undefined) {
        oldOrgValues.legal_name = organization.legal_name;
        organization.legal_name = dto.legal_name;
        changedFields.push('legal_name');
      }
      if (dto.trade_name !== undefined) {
        oldOrgValues.trade_name = organization.trade_name;
        organization.trade_name = dto.trade_name;
        changedFields.push('trade_name');
      }
      if (dto.country_of_incorporation !== undefined) {
        oldOrgValues.country_of_incorporation = organization.country_of_incorporation;
        organization.country_of_incorporation = dto.country_of_incorporation;
        changedFields.push('country_of_incorporation');
      }
      if (dto.date_of_incorporation !== undefined) {
        oldOrgValues.date_of_incorporation = organization.date_of_incorporation;
        organization.date_of_incorporation = new Date(dto.date_of_incorporation);
        changedFields.push('date_of_incorporation');
      }
      if (dto.organization_type !== undefined) {
        oldOrgValues.organization_type = organization.organization_type;
        organization.organization_type = dto.organization_type;
        changedFields.push('organization_type');
      }
      if (dto.legal_structure !== undefined) {
        oldOrgValues.legal_structure = organization.legal_structure;
        organization.legal_structure = dto.legal_structure;
        changedFields.push('legal_structure');
      }
      if (dto.tax_identification_number !== undefined) {
        oldOrgValues.tax_identification_number = organization.tax_identification_number;
        organization.tax_identification_number = dto.tax_identification_number;
        changedFields.push('tax_identification_number');
      }
      if (dto.commercial_registration_number !== undefined) {
        oldOrgValues.commercial_registration_number = organization.commercial_registration_number;
        organization.commercial_registration_number = dto.commercial_registration_number;
        changedFields.push('commercial_registration_number');
      }
      if (dto.registered_address !== undefined) {
        oldOrgValues.registered_address = organization.registered_address;
        organization.registered_address = dto.registered_address;
        changedFields.push('registered_address');
      }
      if (dto.operating_address !== undefined) {
        oldOrgValues.operating_address = organization.operating_address;
        organization.operating_address = dto.operating_address;
        changedFields.push('operating_address');
      }
      if (dto.contact_email !== undefined) {
        oldOrgValues.contact_email = organization.contact_email;
        organization.contact_email = dto.contact_email;
        changedFields.push('contact_email');
      }
      if (dto.contact_phone !== undefined) {
        oldOrgValues.contact_phone = organization.contact_phone;
        organization.contact_phone = dto.contact_phone;
        changedFields.push('contact_phone');
      }
      if (dto.industry_sector !== undefined) {
        oldOrgValues.industry_sector = organization.industry_sector;
        organization.industry_sector = dto.industry_sector;
        changedFields.push('industry_sector');
      }
      if (dto.number_of_employees !== undefined) {
        oldOrgValues.number_of_employees = organization.number_of_employees;
        organization.number_of_employees = dto.number_of_employees;
        changedFields.push('number_of_employees');
      }
      if (dto.annual_revenue !== undefined) {
        oldOrgValues.annual_revenue = organization.annual_revenue;
        organization.annual_revenue = String(dto.annual_revenue);
        changedFields.push('annual_revenue');
      }

      // Save both records
      const savedEntity = await entityRepo.save(entity);
      const savedOrganization = await orgRepo.save(organization);

      // Log history
      if (changedFields.length > 0) {
        await manager.getRepository((this.entityHistoryRepository as any).repository.target).save(
          this.entityHistoryRepository.create({
            entity_id: entityId,
            changed_by: userId,
            change_type: 'updated',
            change_description: `Updated organization entity: ${changedFields.join(', ')}`,
            old_values: { ...oldEntityValues, ...oldOrgValues },
            new_values: dto,
            changed_fields: changedFields,
          })
        );
      }

      return { entity: savedEntity, organization: savedOrganization };
    });
  }

  async bulkAction(subscriberId: string, userId: string, dto: BulkActionDto) {
    if (!dto.entityIds?.length) throw new BadRequestException('No entity IDs provided');

    return this.dataSource.transaction(async manager => {
      const repo = manager.getRepository((this.entityRepository as any).repository.target);
      const updated: { id: string; status?: string; is_active?: boolean }[] = [];

      for (const id of dto.entityIds) {
        const existing = await repo.findOne({ where: { id, subscriber_id: subscriberId } });
        if (!existing) continue;

        const previous = { status: existing.status, is_active: existing.is_active };
        switch (dto.action) {
          case 'activate':
            existing.status = 'ACTIVE';
            existing.is_active = true;
            break;
          case 'suspend':
            existing.status = 'SUSPENDED';
            break;
          case 'archive':
            existing.status = 'ARCHIVED';
            break;
          case 'restore':
            existing.status = 'ACTIVE';
            existing.is_active = true;
            existing.deleted_at = null as any;
            break;
          case 'delete':
            existing.is_active = false;
            existing.deleted_at = new Date();
            break;
        }
        existing.updated_by = userId;
        const saved = await repo.save(existing);
        updated.push({ id, status: saved.status, is_active: saved.is_active });

        await manager.getRepository((this.entityHistoryRepository as any).repository.target).save(
          this.entityHistoryRepository.create({
            entity_id: id,
            changed_by: userId,
            change_type: dto.action === 'delete' ? 'deleted' : dto.action === 'restore' ? 'restored' : 'status_changed',
            change_description: `Bulk action: ${dto.action}`,
            old_values: previous,
            new_values: { status: saved.status, is_active: saved.is_active },
            change_reason: dto.reason,
          })
        );
      }

      return { updated, count: updated.length };
    });
  }

  async getEntityHistory(entityId: string) {
    return this.entityHistoryRepository.findByEntityId(entityId, 100);
  }

  async findEntitiesByName(subscriberId: string, name: string) {
    return this.entityRepository.findWithFilters(
      {
        subscriber_id: subscriberId,
        name: name,
      },
      { page: 1, limit: 100 } // Reasonable default limit for search
    );
  }

  async exportEntities(subscriberId: string, dto: ExportEntitiesDto) {
    const result = await this.entityRepository.findWithFilters(
      {
        subscriber_id: subscriberId,
        entity_type: dto.entity_type,
        status: dto.status as any,
        risk_level: dto.risk_level as any,
        screening_status: dto.screening_status as any,
        onboarding_completed: dto.onboarding_completed,
        search: dto.search,
      },
      { page: 1, limit: 1000 }
    );

    const rows = result.data;
    const headers = ['id', 'name', 'entity_type', 'status', 'risk_level', 'screening_status', 'created_at'];
    const csv = [headers.join(',')]
      .concat(
        rows.map(r => [r.id, r.name, r.entity_type, r.status, r.risk_level ?? '', r.screening_status ?? '', r.created_at?.toISOString() ?? ''].map(v => `${v}`).join(','))
      )
      .join('\n');

    return { format: dto.format ?? 'csv', content: csv };
  }

  async addCustomFields(subscriberId: string, entityId: string, userId: string, dto: AddCustomFieldsDto) {
    return this.dataSource.transaction(async manager => {
      const entityRepo = manager.getRepository((this.entityRepository as any).repository.target);
      let entity = await entityRepo.findOne({ where: { id: entityId, subscriber_id: subscriberId, is_active: true } });
      if (!entity) {
        // Fallback check if entity exists but is inactive or belongs to another subscriber (for better error message or debugging, though 404 is standard)
        const rows = await manager.query('SELECT id FROM entities WHERE id = $1 AND subscriber_id = $2 LIMIT 1', [entityId, subscriberId]);
        if (!rows?.length) throw new NotFoundException('Entity not found');
        entity = { id: rows[0].id } as any;
      }

      const customFieldRepo = manager.getRepository((this.entityCustomFieldRepository as any).repository.target);
      const addedFields: any[] = [];

      for (const field of dto.custom_fields) {
        const fieldRecord = this.entityCustomFieldRepository.create({
          entity_id: entityId,
          field_name: field.field_name,
          field_type: 'text', // Default to text since field_type is not in DTO
          field_value: field.field_value,
          field_value_json: null, // Not in DTO
          field_group: field.field_group,
          is_required: false,
          is_searchable: true,
          is_visible: true,
          is_editable: true,
          is_encrypted: false,
          is_pii: false,
          display_order: 0,
          created_by: userId,
        } as any);

        const saved = await customFieldRepo.save(fieldRecord);
        addedFields.push(saved);
      }

      await manager.getRepository((this.entityHistoryRepository as any).repository.target).save(
        this.entityHistoryRepository.create({
          entity_id: entityId,
          changed_by: userId,
          change_type: 'updated',
          change_description: `${dto.custom_fields.length} custom field(s) added`,
          new_values: { custom_fields: addedFields },
        })
      );

      return { added: addedFields.length, fields: addedFields };
    });
  }
}
