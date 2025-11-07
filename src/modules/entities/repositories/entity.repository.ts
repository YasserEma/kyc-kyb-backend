import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder , IsNull} from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { EntityEntity } from '../entities/entity.entity';
import { PaginationOptions, PaginationResult } from '../../common/interfaces/pagination.interface';
import { QueryHelper } from '../../../utils/database/query.helper';
import { BaseFilter } from '../../common/interfaces/filter.interface';

export interface EntityFilter extends BaseFilter {
  subscriber_id?: string;
  entity_type?: 'individual' | 'organization';
  status?: 'active' | 'inactive' | 'pending' | 'suspended' | 'archived';
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  screening_status?: 'pending' | 'in_progress' | 'completed' | 'failed' | 'requires_review';
  onboarding_completed?: boolean;
  created_by?: string;
  updated_by?: string;
  name?: string;
  reference_number?: string;
  search?: string;
}

@Injectable()
export class EntityRepository extends BaseRepository<EntityEntity> {
  constructor(
    @InjectRepository(EntityEntity)
    private readonly entityRepository: Repository<EntityEntity>,
  ) {
    super(entityRepository);
  }

  async findWithFilters(
    filters: EntityFilter = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<EntityEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findBySubscriberId(
    subscriberId: string,
    filters: Omit<EntityFilter, 'subscriber_id'> = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<EntityEntity>> {
    return this.findWithFilters({ ...filters, subscriber_id: subscriberId }, pagination);
  }

  async findByReferenceNumber(referenceNumber: string): Promise<EntityEntity | null> {
    return this.entityRepository.findOne({
      where: {
        reference_number: referenceNumber,
        is_active: true,
        deleted_at: IsNull()
      },
      relations: ['subscriber', 'individualEntity', 'organizationEntity']
    });
  }

  async findByEntityType(
    entityType: 'individual' | 'organization',
    filters: Omit<EntityFilter, 'entity_type'> = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<EntityEntity>> {
    return this.findWithFilters({ ...filters, entity_type: entityType }, pagination);
  }

  async findByStatus(
    status: 'active' | 'inactive' | 'pending' | 'suspended' | 'archived',
    filters: Omit<EntityFilter, 'status'> = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<EntityEntity>> {
    return this.findWithFilters({ ...filters, status }, pagination);
  }

  async findByRiskLevel(
    riskLevel: 'low' | 'medium' | 'high' | 'critical',
    filters: Omit<EntityFilter, 'risk_level'> = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<EntityEntity>> {
    return this.findWithFilters({ ...filters, risk_level: riskLevel }, pagination);
  }

  async findByScreeningStatus(
    screeningStatus: 'pending' | 'in_progress' | 'completed' | 'failed' | 'requires_review',
    filters: Omit<EntityFilter, 'screening_status'> = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<EntityEntity>> {
    return this.findWithFilters({ ...filters, screening_status: screeningStatus }, pagination);
  }

  async findPendingOnboarding(
    filters: Partial<EntityFilter> = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<EntityEntity>> {
    return this.findWithFilters({ ...filters, onboarding_completed: false }, pagination);
  }

  async findCompletedOnboarding(
    filters: Partial<EntityFilter> = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<EntityEntity>> {
    return this.findWithFilters({ ...filters, onboarding_completed: true }, pagination);
  }

  async findRequiringScreening(
    filters: Partial<EntityFilter> = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<EntityEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere(
      '(entity.last_screened_at IS NULL OR entity.last_screened_at < :screeningThreshold)',
      { screeningThreshold: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // 30 days ago
    );
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findRequiringRiskAssessment(
    filters: Partial<EntityFilter> = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<EntityEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere(
      '(entity.last_risk_assessed_at IS NULL OR entity.last_risk_assessed_at < :riskThreshold)',
      { riskThreshold: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // 90 days ago
    );
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async updateStatus(id: string, status: 'active' | 'inactive' | 'pending' | 'suspended' | 'archived'): Promise<void> {
    const updateData: Partial<EntityEntity> = {
      status,
      updated_at: new Date()
    };
    await this.entityRepository.update(id, updateData);
  }

  async updateRiskLevel(id: string, riskLevel: 'low' | 'medium' | 'high' | 'critical'): Promise<void> {
    const updateData: Partial<EntityEntity> = {
      risk_level: riskLevel,
      last_risk_assessed_at: new Date(),
      updated_at: new Date()
    };
    await this.entityRepository.update(id, updateData);
  }

  async updateScreeningStatus(
    id: string, 
    screeningStatus: 'pending' | 'in_progress' | 'completed' | 'failed' | 'requires_review'
  ): Promise<void> {
    const updateData: Partial<EntityEntity> = {
      screening_status: screeningStatus,
      last_screened_at: new Date(),
      updated_at: new Date()
    };
    await this.entityRepository.update(id, updateData);
  }

  async markOnboardingCompleted(id: string): Promise<void> {
    const updateData: Partial<EntityEntity> = {
      onboarding_completed: true,
      onboarded_at: new Date(),
      updated_at: new Date()
    };
    await this.entityRepository.update(id, updateData);
  }

  async getEntityStatistics(subscriberId?: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    pending: number;
    suspended: number;
    archived: number;
    individuals: number;
    organizations: number;
    onboarded: number;
    pending_onboarding: number;
    high_risk: number;
    medium_risk: number;
    low_risk: number;
    critical_risk: number;
  }> {
    const baseWhere = subscriberId 
      ? { subscriber_id: subscriberId, is_active: true, deleted_at: IsNull() }
      : { is_active: true, deleted_at: IsNull() };

    const [
      total,
      active,
      inactive,
      pending,
      suspended,
      archived,
      individuals,
      organizations,
      onboarded,
      pendingOnboarding,
      highRisk,
      mediumRisk,
      lowRisk,
      criticalRisk
    ] = await Promise.all([
      this.entityRepository.count({ where: baseWhere }),
      this.entityRepository.count({ where: { ...baseWhere, status: 'active' } }),
      this.entityRepository.count({ where: { ...baseWhere, status: 'inactive' } }),
      this.entityRepository.count({ where: { ...baseWhere, status: 'pending' } }),
      this.entityRepository.count({ where: { ...baseWhere, status: 'suspended' } }),
      this.entityRepository.count({ where: { ...baseWhere, status: 'archived' } }),
      this.entityRepository.count({ where: { ...baseWhere, entity_type: 'individual' } }),
      this.entityRepository.count({ where: { ...baseWhere, entity_type: 'organization' } }),
      this.entityRepository.count({ where: { ...baseWhere, onboarding_completed: true } }),
      this.entityRepository.count({ where: { ...baseWhere, onboarding_completed: false } }),
      this.entityRepository.count({ where: { ...baseWhere, risk_level: 'high' } }),
      this.entityRepository.count({ where: { ...baseWhere, risk_level: 'medium' } }),
      this.entityRepository.count({ where: { ...baseWhere, risk_level: 'low' } }),
      this.entityRepository.count({ where: { ...baseWhere, risk_level: 'critical' } })
    ]);

    return {
      total,
      active,
      inactive,
      pending,
      suspended,
      archived,
      individuals,
      organizations,
      onboarded,
      pending_onboarding: pendingOnboarding,
      high_risk: highRisk,
      medium_risk: mediumRisk,
      low_risk: lowRisk,
      critical_risk: criticalRisk
    };
  }

  private createFilteredQuery(filters: EntityFilter): SelectQueryBuilder<EntityEntity> {
    const queryBuilder = this.entityRepository
      .createQueryBuilder('entity')
      .leftJoinAndSelect('entity.subscriber', 'subscriber')
      .leftJoinAndSelect('entity.individualEntity', 'individualEntity')
      .leftJoinAndSelect('entity.organizationEntity', 'organizationEntity')
      .where('entity.is_active = :isActive', { isActive: true })
      .andWhere('entity.deleted_at IS NULL');

    if (filters.subscriber_id) {
      queryBuilder.andWhere('entity.subscriber_id = :subscriberId', { subscriberId: filters.subscriber_id });
    }

    if (filters.entity_type) {
      queryBuilder.andWhere('entity.entity_type = :entityType', { entityType: filters.entity_type });
    }

    if (filters.status) {
      queryBuilder.andWhere('entity.status = :status', { status: filters.status });
    }

    if (filters.risk_level) {
      queryBuilder.andWhere('entity.risk_level = :riskLevel', { riskLevel: filters.risk_level });
    }

    if (filters.screening_status) {
      queryBuilder.andWhere('entity.screening_status = :screeningStatus', { screeningStatus: filters.screening_status });
    }

    if (filters.onboarding_completed !== undefined) {
      queryBuilder.andWhere('entity.onboarding_completed = :onboardingCompleted', { onboardingCompleted: filters.onboarding_completed });
    }

    if (filters.created_by) {
      queryBuilder.andWhere('entity.created_by = :createdBy', { createdBy: filters.created_by });
    }

    if (filters.updated_by) {
      queryBuilder.andWhere('entity.updated_by = :updatedBy', { updatedBy: filters.updated_by });
    }

    if (filters.name) {
      queryBuilder.andWhere('entity.name ILIKE :name', { name: `%${filters.name}%` });
    }

    if (filters.reference_number) {
      queryBuilder.andWhere('entity.reference_number ILIKE :referenceNumber', { referenceNumber: `%${filters.reference_number}%` });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(entity.name ILIKE :search OR entity.reference_number ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters.created_at_from) {
      queryBuilder.andWhere('entity.created_at >= :createdAtFrom', { createdAtFrom: filters.created_at_from });
    }

    if (filters.created_at_to) {
      queryBuilder.andWhere('entity.created_at <= :createdAtTo', { createdAtTo: filters.created_at_to });
    }

    if (filters.updated_at_from) {
      queryBuilder.andWhere('entity.updated_at >= :updatedAtFrom', { updatedAtFrom: filters.updated_at_from });
    }

    if (filters.updated_at_to) {
      queryBuilder.andWhere('entity.updated_at <= :updatedAtTo', { updatedAtTo: filters.updated_at_to });
    }

    return queryBuilder;
  }
}