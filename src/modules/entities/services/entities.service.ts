import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

import { ListEntitiesQueryDto } from '../dtos/list-entities.dto';
import { CreateIndividualEntityDto } from '../dtos/create-individual-entity.dto';
import { CreateOrganizationEntityDto } from '../dtos/create-organization-entity.dto';
import { UpdateEntityDto } from '../dtos/update-entity.dto';
import { UpdateEntityStatusDto } from '../dtos/update-entity-status.dto';
import { BulkActionDto } from '../dtos/bulk-action.dto';
import { ExportEntitiesDto } from '../dtos/export-entities.dto';

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
      relations: ['subscriber', 'creator', 'updater', 'custom_fields', 'history', 'documents', 'screeningAnalyses', 'riskAnalyses'],
    });

    if (!Array.isArray(entity) || !entity[0]) {
      // findAndCount returns [entities, count]; use direct findOne for clarity
      const found = await this.entityRepository.findOne({
        where: { id: entityId, subscriber_id: subscriberId, is_active: true },
        relations: ['subscriber', 'creator', 'updater', 'custom_fields', 'history', 'documents', 'screeningAnalyses', 'riskAnalyses'],
      });
      if (!found) throw new NotFoundException('Entity not found');
      return found;
    }

    return (entity as any)[0];
  }

  async createIndividualEntity(subscriberId: string, userId: string, dto: CreateIndividualEntityDto) {
    const referenceNumber = `REF-${randomUUID()}`;

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
      const savedEntity = await manager.getRepository((this.entityRepository as any).repository.target).save(baseEntity);

      // Create individual entity record
      const individualRecord = this.individualEntityRepository.create({
        entity_id: savedEntity.id,
        date_of_birth: new Date(dto.date_of_birth),
        nationality: dto.nationality,
        country_of_residence: dto.country_of_residence ?? [],
        gender: dto.gender,
        address: dto.address,
        occupation: dto.occupation,
        national_id: dto.national_id,
        id_type: dto.id_type,
        id_expiry_date: dto.id_expiry_date ? new Date(dto.id_expiry_date) : undefined,
        source_of_income: dto.source_of_income,
        is_pep: dto.is_pep ?? false,
        has_criminal_record: dto.has_criminal_record ?? false,
        pep_details: dto.pep_details,
        criminal_record_details: dto.criminal_record_details,
      });
      await manager.getRepository((this.individualEntityRepository as any).repository.target).save(individualRecord);

      // History log
      await manager.getRepository((this.entityHistoryRepository as any).repository.target).save(
        this.entityHistoryRepository.create({
          entity_id: savedEntity.id,
          changed_by: userId,
          change_type: 'created',
          change_description: 'Individual entity created',
          new_values: { entity: savedEntity, individual: individualRecord },
        })
      );

      // Placeholder orchestration: create pending screening and risk entries if needed
      // Skipping actual creation to avoid schema assumptions; repositories expose filters for later queries.

      return savedEntity;
    });
  }

  async createOrganizationEntity(subscriberId: string, userId: string, dto: CreateOrganizationEntityDto) {
    const referenceNumber = `REF-${randomUUID()}`;

    return this.dataSource.transaction(async manager => {
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
}