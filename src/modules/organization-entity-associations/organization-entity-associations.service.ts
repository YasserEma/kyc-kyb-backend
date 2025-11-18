import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { OrganizationEntityAssociationRepository } from './repositories/organization-entity-association.repository';
import { EntityRepository } from '../entities/repositories/entity.repository';
import { EntityHistoryRepository } from '../entity-history/repositories/entity-history.repository';
import { CreateOrganizationAssociationDto } from './dtos/create-organization-association.dto';

@Injectable()
export class OrganizationEntityAssociationsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly associationRepository: OrganizationEntityAssociationRepository,
    private readonly entityRepository: EntityRepository,
    private readonly entityHistoryRepository: EntityHistoryRepository,
  ) {}

  async listAssociations(filters: {
    organizationId?: string;
    individualId?: string;
    relationshipType?: string;
    status?: string;
    verificationStatus?: string;
    page: number;
    limit: number;
  }) {
    const query = this.associationRepository.createQueryBuilder('association')
      .leftJoinAndSelect('association.organization_entity', 'organization')
      .leftJoinAndSelect('association.individual_entity', 'individual')
      .where('association.is_active = :isActive', { isActive: true });

    if (filters.organizationId) {
      query.andWhere('association.organization_entity_id = :orgId', { orgId: filters.organizationId });
    }

    if (filters.individualId) {
      query.andWhere('association.individual_entity_id = :indId', { indId: filters.individualId });
    }

    if (filters.relationshipType) {
      query.andWhere('association.relationship_type = :relType', { relType: filters.relationshipType });
    }

    if (filters.status) {
      query.andWhere('association.status = :status', { status: filters.status });
    }

    if (filters.verificationStatus) {
      query.andWhere('association.verification_status = :verStatus', { verStatus: filters.verificationStatus });
    }

    const [data, total] = await query
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .orderBy('association.created_at', 'DESC')
      .getManyAndCount();

    return {
      data,
      total,
      page: filters.page,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  async getAssociationById(id: string) {
    const association = await this.associationRepository.findOne({
      where: { id, is_active: true },
      relations: ['organization_entity', 'individual_entity'],
    });

    if (!association) {
      throw new NotFoundException('Association not found');
    }

    return association;
  }

  async createAssociation(dto: CreateOrganizationAssociationDto, userId: string) {
    return this.dataSource.transaction(async manager => {
      // Validate that both entities exist
      const orgRows = await manager.query('SELECT id, entity_id FROM organization_entities WHERE (id = $1 OR entity_id = $1) AND is_active = true LIMIT 1', [dto.organization_id]);
      const organizationSub = orgRows?.[0] ? { id: orgRows[0].id, entity_id: orgRows[0].entity_id } as any : null;

      if (!organizationSub) {
        const orgRows2 = await manager.query('SELECT id FROM organization_entities WHERE entity_id = $1 LIMIT 1', [dto.organization_id]);
        if (!orgRows2?.length) throw new NotFoundException('Organization entity not found');
      }

      const indRows = await manager.query('SELECT id, entity_id FROM individual_entities WHERE (id = $1 OR entity_id = $1) AND is_active = true LIMIT 1', [dto.individual_id]);
      const individualSub = indRows?.[0] ? { id: indRows[0].id, entity_id: indRows[0].entity_id } as any : null;

      if (!individualSub) {
        const indRows2 = await manager.query('SELECT id FROM individual_entities WHERE entity_id = $1 LIMIT 1', [dto.individual_id]);
        if (!indRows2?.length) throw new NotFoundException('Individual entity not found');
      }

      // Check for existing active association
      const existing = await manager.getRepository((this.associationRepository as any).repository.target)
        .findOne({
          where: {
            organization_id: organizationSub.id,
            individual_id: individualSub.id,
            relationship_type: dto.relationship_type,
            is_active: true,
          },
        });

      if (existing) {
        throw new BadRequestException('Active association already exists between these entities');
      }

      const insert = await manager.query(
        `INSERT INTO organization_associations (
           organization_id,
           individual_id,
           relationship_type,
           position_title,
           association_status,
           effective_from,
           created_by
         ) VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING id, created_at, updated_at, deleted_at, is_active`,
        [
          organizationSub.id,
          individualSub.id,
          dto.relationship_type,
          (dto as any)?.relationship_details?.position || dto.role_description || 'Member',
          'active',
          dto.start_date ? new Date(dto.start_date) : new Date(),
          userId,
        ]
      );
      const savedAssociation = insert?.[0] || {};

      // History logging skipped for association creation to ensure compatibility with current schema

      return savedAssociation;
    });
  }

  async updateVerificationStatus(
    id: string,
    verificationStatus: string,
    verificationNotes?: string,
    userId?: string,
  ) {
    return this.dataSource.transaction(async manager => {
      const association = await manager.getRepository((this.associationRepository as any).repository.target)
        .findOne({ where: { id, is_active: true } });

      if (!association) {
        throw new NotFoundException('Association not found');
      }

      const oldStatus = association.verification_status;
      association.verification_status = verificationStatus;
      association.verification_notes = verificationNotes;
      association.updated_by = userId;

      const saved = await manager.getRepository((this.associationRepository as any).repository.target).save(association);

      // Log history
      await manager.getRepository((this.entityHistoryRepository as any).repository.target).save(
        this.entityHistoryRepository.create({
          entity_id: association.organization_entity_id,
          changed_by: userId,
          change_type: 'updated',
          change_description: `Verification status changed from ${oldStatus} to ${verificationStatus}`,
          old_values: { verification_status: oldStatus },
          new_values: { verification_status: verificationStatus, verification_notes: verificationNotes },
        })
      );

      return saved;
    });
  }

  async setNextReviewDate(id: string, nextReviewDate: Date, userId?: string) {
    return this.dataSource.transaction(async manager => {
      const association = await manager.getRepository((this.associationRepository as any).repository.target)
        .findOne({ where: { id, is_active: true } });

      if (!association) {
        throw new NotFoundException('Association not found');
      }

      const oldDate = association.next_review_date;
      association.next_review_date = nextReviewDate;
      association.updated_by = userId;

      const saved = await manager.getRepository((this.associationRepository as any).repository.target).save(association);

      // Log history
      await manager.getRepository((this.entityHistoryRepository as any).repository.target).save(
        this.entityHistoryRepository.create({
          entity_id: association.organization_entity_id,
          changed_by: userId,
          change_type: 'updated',
          change_description: `Next review date updated`,
          old_values: { next_review_date: oldDate },
          new_values: { next_review_date: nextReviewDate },
        })
      );

      return saved;
    });
  }

  async updateRiskLevel(id: string, riskLevel: string, riskReason?: string, userId?: string) {
    return this.dataSource.transaction(async manager => {
      const association = await manager.getRepository((this.associationRepository as any).repository.target)
        .findOne({ where: { id, is_active: true } });

      if (!association) {
        throw new NotFoundException('Association not found');
      }

      const oldRiskLevel = association.risk_level;
      association.risk_level = riskLevel;
      association.risk_reason = riskReason;
      association.updated_by = userId;

      const saved = await manager.getRepository((this.associationRepository as any).repository.target).save(association);

      // Log history
      await manager.getRepository((this.entityHistoryRepository as any).repository.target).save(
        this.entityHistoryRepository.create({
          entity_id: association.organization_entity_id,
          changed_by: userId,
          change_type: 'risk_updated',
          change_description: `Risk level changed from ${oldRiskLevel} to ${riskLevel}`,
          old_values: { risk_level: oldRiskLevel },
          new_values: { risk_level: riskLevel, risk_reason: riskReason },
        })
      );

      return saved;
    });
  }

  async getOrganizationStats(organizationId: string) {
    const stats = await this.associationRepository
      .createQueryBuilder('association')
      .select('COUNT(*)', 'total_associations')
      .addSelect('COUNT(CASE WHEN association.verification_status = \'VERIFIED\' THEN 1 END)', 'verified_associations')
      .addSelect('COUNT(CASE WHEN association.verification_status = \'PENDING\' THEN 1 END)', 'pending_associations')
      .addSelect('COUNT(CASE WHEN association.status = \'ACTIVE\' THEN 1 END)', 'active_associations')
      .addSelect('COUNT(CASE WHEN association.risk_level = \'HIGH\' THEN 1 END)', 'high_risk_associations')
      .addSelect('COUNT(CASE WHEN association.relationship_type = \'director\' THEN 1 END)', 'directors')
      .addSelect('COUNT(CASE WHEN association.relationship_type = \'shareholder\' THEN 1 END)', 'shareholders')
      .addSelect('COUNT(CASE WHEN association.relationship_type = \'beneficial_owner\' THEN 1 END)', 'beneficial_owners')
      .where('association.organization_entity_id = :orgId', { orgId: organizationId })
      .andWhere('association.is_active = :isActive', { isActive: true })
      .getRawOne();

    return {
      organization_id: organizationId,
      total_associations: Number(stats.total_associations) || 0,
      verified_associations: Number(stats.verified_associations) || 0,
      pending_associations: Number(stats.pending_associations) || 0,
      active_associations: Number(stats.active_associations) || 0,
      high_risk_associations: Number(stats.high_risk_associations) || 0,
      directors: Number(stats.directors) || 0,
      shareholders: Number(stats.shareholders) || 0,
      beneficial_owners: Number(stats.beneficial_owners) || 0,
    };
  }

  async getIndividualAssociations(individualId: string, filters?: { status?: string; verificationStatus?: string }) {
    const query = this.associationRepository
      .createQueryBuilder('association')
      .leftJoinAndSelect('association.organization_entity', 'organization')
      .where('association.individual_entity_id = :indId', { indId: individualId })
      .andWhere('association.is_active = :isActive', { isActive: true });

    if (filters?.status) {
      query.andWhere('association.status = :status', { status: filters.status });
    }

    if (filters?.verificationStatus) {
      query.andWhere('association.verification_status = :verStatus', { verStatus: filters.verificationStatus });
    }

    return query.orderBy('association.created_at', 'DESC').getMany();
  }
}