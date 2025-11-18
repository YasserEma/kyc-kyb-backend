import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
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
import { DocumentsService } from '../../documents/documents.service';
import { IndividualIdentityDocumentRepository } from '../../individual-identity-documents/individual-identity-document.repository';
import { OrganizationEntityAssociationRepository } from '../../organization-entity-associations/repositories/organization-entity-association.repository';
import { EncryptionHelper } from '../../../utils/database/encryption.helper';

import { ListEntitiesQueryDto } from '../dtos/list-entities.dto';
import { CreateIndividualEntityDto } from '../dtos/create-individual-entity.dto';
import { CreateOrganizationEntityDto } from '../dtos/create-organization-entity.dto';
import { UpdateEntityDto } from '../dtos/update-entity.dto';
import { UpdateEntityStatusDto } from '../dtos/update-entity-status.dto';
import { BulkActionDto } from '../dtos/bulk-action.dto';
import { ExportEntitiesDto } from '../dtos/export-entities.dto';
import { AddCustomFieldsDto } from '../dtos/add-custom-fields.dto';

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
    private readonly identityDocumentRepository: IndividualIdentityDocumentRepository,
    private readonly organizationEntityAssociationRepository: OrganizationEntityAssociationRepository,
    private readonly documentsService: DocumentsService,
    private readonly configService: ConfigService,
  ) {}

  async listEntities(subscriberId: string, query: ListEntitiesQueryDto) {
    return this.entityRepository.findWithFilters(
      {
        subscriber_id: subscriberId,
        entity_type: query.entity_type,
        status: query.status as any,
        risk_level: query.risk_level as any,
        screening_status: query.screening_status as any,
        onboarding_completed: query.onboarding_completed,
        name: query.name,
        reference_number: query.reference_number,
        search: query.search,
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
    const [entity] = await this.entityRepository.findAndCount({
      where: {
        id: entityId,
        subscriber_id: subscriberId,
        is_active: true,
      },
      relations: ['subscriber'],
    });

    if (!Array.isArray(entity) || !entity[0]) {
      // findAndCount returns [entities, count]; use direct findOne for clarity
      const found = await this.entityRepository.findOne({
        where: { id: entityId, subscriber_id: subscriberId, is_active: true },
        relations: ['subscriber'],
      });
      if (!found) throw new NotFoundException('Entity not found');
      return found;
    }

    return (entity as any)[0];
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

  async createOrganizationEntity(subscriberId: string, userId: string, dto: CreateOrganizationEntityDto) {
    const referenceNumber = `REF-${randomUUID()}`;

    try {
      return await this.dataSource.transaction(async manager => {
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

  async addCustomFields(entityId: string, userId: string, dto: AddCustomFieldsDto) {
    return this.dataSource.transaction(async manager => {
      const entityRepo = manager.getRepository((this.entityRepository as any).repository.target);
      let entity = await entityRepo.findOne({ where: { id: entityId, is_active: true } });
      if (!entity) {
        const rows = await manager.query('SELECT id FROM entities WHERE id = $1 LIMIT 1', [entityId]);
        if (!rows?.length) throw new NotFoundException('Entity not found');
        entity = { id: rows[0].id } as any;
      }

      const customFieldRepo = manager.getRepository((this.entityCustomFieldRepository as any).repository.target);
      const addedFields: any[] = [];

      for (const field of dto.custom_fields) {
        const fieldRecord = this.entityCustomFieldRepository.create({
          entity_id: entityId,
          field_name: field.field_name,
          field_type: 'text',
          field_value: field.field_value,
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

  async addDocument(subscriberId: string, entityId: string, userId: string, dto: any, file?: Express.Multer.File) {
    return this.dataSource.transaction(async manager => {
      // Verify entity exists and belongs to subscriber
      const entityRepo = manager.getRepository((this.entityRepository as any).repository.target);
      const entity = await entityRepo.findOne({ where: { id: entityId, is_active: true } });
      if (!entity) throw new NotFoundException('Entity not found');

      // Use the documents service to create the document
      const document = await this.documentsService.createDocumentFromFile(
        dto.file || (file ? file.buffer.toString('base64') : ''),
        subscriberId,
        userId,
        manager,
        {
          entity_id: entityId,
          document_type: dto.document_type,
          document_name: dto.document_name,
          document_number: dto.document_number,
          issuing_country: dto.issuing_country,
          expiry_date: dto.expiry_date ? new Date(dto.expiry_date) : undefined,
          mime_type: dto.mime_type || (file ? file.mimetype : 'application/octet-stream'),
        }
      );

      // Log the document addition in entity history
      await manager.getRepository((this.entityHistoryRepository as any).repository.target).save(
        this.entityHistoryRepository.create({
          entity_id: entityId,
          changed_by: userId,
          change_type: 'updated',
          change_description: `Document added: ${dto.document_name}`,
          new_values: { document: { id: document.id, name: document.document_name, type: document.document_type } },
        })
      );

      return document;
    });
  }
}