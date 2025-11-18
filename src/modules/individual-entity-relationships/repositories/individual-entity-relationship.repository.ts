import { Repository, SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { IndividualEntityRelationshipEntity } from '../entities/individual-entity-relationship.entity';
import { PaginationOptions, PaginationResult } from '../../common/interfaces/pagination.interface';
import { BaseFilter } from '../../common/interfaces/filter.interface';
import { QueryHelper } from '../../../utils/database/query.helper';

export interface IndividualEntityRelationshipFilter extends BaseFilter {
  primary_individual_id?: string;
  related_individual_id?: string;
  relationship_type?: string;
  relationship_status?: string;
  is_primary?: boolean;
  is_reciprocal?: boolean;
  is_pep_related?: boolean;
  is_sanctions_related?: boolean;
  requires_enhanced_due_diligence?: boolean;
  risk_level?: string;
  is_verified?: boolean;
  verification_status?: 'verified' | 'pending' | 'expired';
  needs_review?: boolean;
  is_current?: boolean;
  is_expired?: boolean;
  is_future?: boolean;
  created_by?: string;
  updated_by?: string;
  relationship_types?: string[];
  risk_levels?: string[];
  individual_ids?: string[];
  start_date_from?: Date;
  start_date_to?: Date;
  end_date_from?: Date;
  end_date_to?: Date;
  ownership_percentage_min?: number;
  ownership_percentage_max?: number;
  search?: string;
}

@Injectable()
export class IndividualEntityRelationshipRepository extends BaseRepository<IndividualEntityRelationshipEntity> {
  constructor(
    @InjectRepository(IndividualEntityRelationshipEntity)
    repository: Repository<IndividualEntityRelationshipEntity>,
  ) {
    super(repository);
  }

  async findWithFilters(
    filter: IndividualEntityRelationshipFilter = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginationResult<IndividualEntityRelationshipEntity>> {
    const queryBuilder = this.createQueryBuilder('rel')
      .leftJoinAndSelect('rel.primary_individual', 'primary')
      .leftJoinAndSelect('rel.related_individual', 'related');

    this.applyFilters(queryBuilder, filter);
    QueryHelper.applySorting(queryBuilder, pagination.sortBy, pagination.sortOrder, ['created_at', 'updated_at']);

    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findByIndividualId(
    individualId: string,
    filter: Partial<IndividualEntityRelationshipFilter> = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginationResult<IndividualEntityRelationshipEntity>> {
    const queryBuilder = this.createQueryBuilder('rel')
      .leftJoinAndSelect('rel.primary_individual', 'primary')
      .leftJoinAndSelect('rel.related_individual', 'related')
      .where('(rel.primary_individual_id = :individualId OR rel.related_individual_id = :individualId)', 
        { individualId });

    this.applyFilters(queryBuilder, filter);
    QueryHelper.applySorting(queryBuilder, pagination.sortBy, pagination.sortOrder, ['created_at', 'updated_at']);

    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findPrimaryRelationships(
    individualId: string,
    filter: Partial<IndividualEntityRelationshipFilter> = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginationResult<IndividualEntityRelationshipEntity>> {
    const queryBuilder = this.createQueryBuilder('rel')
      .leftJoinAndSelect('rel.primary_individual', 'primary')
      .leftJoinAndSelect('rel.related_individual', 'related')
      .where('rel.primary_individual_id = :individualId', { individualId });

    this.applyFilters(queryBuilder, filter);
    QueryHelper.applySorting(queryBuilder, pagination.sortBy, pagination.sortOrder, ['created_at', 'updated_at']);

    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findRelatedRelationships(
    individualId: string,
    filter: Partial<IndividualEntityRelationshipFilter> = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginationResult<IndividualEntityRelationshipEntity>> {
    const queryBuilder = this.createQueryBuilder('rel')
      .leftJoinAndSelect('rel.primary_individual', 'primary')
      .leftJoinAndSelect('rel.related_individual', 'related')
      .where('rel.related_individual_id = :individualId', { individualId });

    this.applyFilters(queryBuilder, filter);
    QueryHelper.applySorting(queryBuilder, pagination.sortBy, pagination.sortOrder, ['created_at', 'updated_at']);

    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findByRelationshipType(
    relationshipType: string,
    filter: Partial<IndividualEntityRelationshipFilter> = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginationResult<IndividualEntityRelationshipEntity>> {
    const queryBuilder = this.createQueryBuilder('rel')
      .leftJoinAndSelect('rel.primary_individual', 'primary')
      .leftJoinAndSelect('rel.related_individual', 'related')
      .where('rel.relationship_type = :relationshipType', { relationshipType })
      .andWhere('rel.deleted_at IS NULL');

    this.applyFilters(queryBuilder, filter);
    QueryHelper.applySorting(queryBuilder, pagination.sortBy, pagination.sortOrder, ['created_at', 'updated_at']);

    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findHighRiskRelationships(
    filter: Partial<IndividualEntityRelationshipFilter> = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginationResult<IndividualEntityRelationshipEntity>> {
    const queryBuilder = this.createQueryBuilder('rel')
      .leftJoinAndSelect('rel.primary_individual', 'primary')
      .leftJoinAndSelect('rel.related_individual', 'related')
      .where('rel.deleted_at IS NULL')
      .andWhere('(rel.is_pep_related = true OR rel.is_sanctions_related = true OR rel.requires_enhanced_due_diligence = true OR rel.risk_level = :riskLevel)', 
        { riskLevel: 'high' });

    this.applyFilters(queryBuilder, filter);
    QueryHelper.applySorting(queryBuilder, pagination.sortBy, pagination.sortOrder, ['created_at', 'updated_at']);

    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findUnverifiedRelationships(
    filter: Partial<IndividualEntityRelationshipFilter> = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginationResult<IndividualEntityRelationshipEntity>> {
    const queryBuilder = this.createQueryBuilder('rel')
      .leftJoinAndSelect('rel.primary_individual', 'primary')
      .leftJoinAndSelect('rel.related_individual', 'related')
      .where('rel.is_verified = false')
      .andWhere('rel.deleted_at IS NULL');

    this.applyFilters(queryBuilder, filter);
    QueryHelper.applySorting(queryBuilder, pagination.sortBy, pagination.sortOrder, ['created_at', 'updated_at']);

    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findExpiredVerifications(
    filter: Partial<IndividualEntityRelationshipFilter> = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginationResult<IndividualEntityRelationshipEntity>> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const queryBuilder = this.createQueryBuilder('rel')
      .leftJoinAndSelect('rel.primary_individual', 'primary')
      .leftJoinAndSelect('rel.related_individual', 'related')
      .where('rel.is_verified = true')
      .andWhere('rel.verification_date < :sixMonthsAgo', { sixMonthsAgo })
      .andWhere('rel.deleted_at IS NULL');

    this.applyFilters(queryBuilder, filter);
    QueryHelper.applySorting(queryBuilder, pagination.sortBy, pagination.sortOrder, ['created_at', 'updated_at']);

    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findRelationshipsNeedingReview(
    filter: Partial<IndividualEntityRelationshipFilter> = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginationResult<IndividualEntityRelationshipEntity>> {
    const today = new Date();

    const queryBuilder = this.createQueryBuilder('rel')
      .leftJoinAndSelect('rel.primary_individual', 'primary')
      .leftJoinAndSelect('rel.related_individual', 'related')
      .where('rel.deleted_at IS NULL')
      .andWhere('(rel.next_review_date IS NULL OR rel.next_review_date <= :today)', { today });

    this.applyFilters(queryBuilder, filter);
    QueryHelper.applySorting(queryBuilder, pagination.sortBy, pagination.sortOrder, ['created_at', 'updated_at']);

    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findCurrentRelationships(
    individualId?: string,
    filter: Partial<IndividualEntityRelationshipFilter> = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginationResult<IndividualEntityRelationshipEntity>> {
    const today = new Date();

    const queryBuilder = this.createQueryBuilder('rel')
      .leftJoinAndSelect('rel.primary_individual', 'primary')
      .leftJoinAndSelect('rel.related_individual', 'related')
      .where('rel.relationship_status = :status', { status: 'active' })
      .andWhere('(rel.relationship_start_date IS NULL OR rel.relationship_start_date <= :today)', { today })
      .andWhere('(rel.relationship_end_date IS NULL OR rel.relationship_end_date >= :today)', { today })
      .andWhere('rel.deleted_at IS NULL');

    if (individualId) {
      queryBuilder.andWhere('(rel.primary_individual_id = :individualId OR rel.related_individual_id = :individualId)', 
        { individualId });
    }

    this.applyFilters(queryBuilder, filter);
    QueryHelper.applySorting(queryBuilder, pagination.sortBy, pagination.sortOrder, ['created_at', 'updated_at']);

    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findExpiredRelationships(
    filter: Partial<IndividualEntityRelationshipFilter> = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginationResult<IndividualEntityRelationshipEntity>> {
    const today = new Date();

    const queryBuilder = this.createQueryBuilder('rel')
      .leftJoinAndSelect('rel.primary_individual', 'primary')
      .leftJoinAndSelect('rel.related_individual', 'related')
      .where('rel.relationship_end_date < :today', { today })
      .andWhere('rel.deleted_at IS NULL');

    this.applyFilters(queryBuilder, filter);
    QueryHelper.applySorting(queryBuilder, pagination.sortBy, pagination.sortOrder, ['created_at', 'updated_at']);

    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findOwnershipRelationships(
    individualId?: string,
    minPercentage?: number,
    filter: Partial<IndividualEntityRelationshipFilter> = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginationResult<IndividualEntityRelationshipEntity>> {
    const queryBuilder = this.createQueryBuilder('rel')
      .leftJoinAndSelect('rel.primary_individual', 'primary')
      .leftJoinAndSelect('rel.related_individual', 'related')
      .where('rel.ownership_percentage IS NOT NULL')
      .andWhere('rel.deleted_at IS NULL');

    if (individualId) {
      queryBuilder.andWhere('(rel.primary_individual_id = :individualId OR rel.related_individual_id = :individualId)', 
        { individualId });
    }

    if (minPercentage !== undefined) {
      queryBuilder.andWhere('rel.ownership_percentage >= :minPercentage', { minPercentage });
    }

    this.applyFilters(queryBuilder, filter);
    QueryHelper.applySorting(queryBuilder, pagination.sortBy, pagination.sortOrder, ['created_at', 'updated_at']);

    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async updateVerificationStatus(
    relationshipId: string,
    isVerified: boolean,
    verifiedBy?: string,
    verificationMethod?: string
  ): Promise<boolean> {
    const updateData: Partial<IndividualEntityRelationshipEntity> = {
      is_verified: isVerified,
      verification_date: isVerified ? new Date() : null,
      verified_by: verifiedBy,
      verification_method: verificationMethod,
      updated_at: new Date()
    };

    const result = await this.update(relationshipId, updateData);
    const affected = result.affected ?? 0;
    return affected > 0;
  }

  async updateReviewDate(
    relationshipId: string,
    reviewedBy: string,
    nextReviewDate?: Date
  ): Promise<boolean> {
    const updateData: Partial<IndividualEntityRelationshipEntity> = {
      last_reviewed_date: new Date(),
      reviewed_by: reviewedBy,
      next_review_date: nextReviewDate,
      updated_at: new Date()
    };

    const result = await this.update(relationshipId, updateData);
    const affected = result.affected ?? 0;
    return affected > 0;
  }

  async updateRiskLevel(
    relationshipId: string,
    riskLevel: string,
    riskFactors?: string,
    updatedBy?: string
  ): Promise<boolean> {
    const updateData: Partial<IndividualEntityRelationshipEntity> = {
      risk_level: riskLevel,
      risk_factors: riskFactors,
      updated_by: updatedBy,
      updated_at: new Date()
    };

    const result = await this.update(relationshipId, updateData);
    const affected = result.affected ?? 0;
    return affected > 0;
  }

  async getRelationshipStatistics(individualId?: string): Promise<{
    total_relationships: number;
    active_relationships: number;
    expired_relationships: number;
    high_risk_relationships: number;
    unverified_relationships: number;
    relationships_needing_review: number;
    relationship_types: Record<string, number>;
    risk_levels: Record<string, number>;
    verification_status: Record<string, number>;
  }> {
    const queryBuilder = this.createQueryBuilder('rel')
      .where('rel.deleted_at IS NULL');

    if (individualId) {
      queryBuilder.andWhere('(rel.primary_individual_id = :individualId OR rel.related_individual_id = :individualId)', 
        { individualId });
    }

    const relationships = await queryBuilder.getMany();
    const today = new Date();

    const stats = {
      total_relationships: relationships.length,
      active_relationships: relationships.filter(r => r.relationship_status === 'active').length,
      expired_relationships: relationships.filter(r => r.relationship_end_date && r.relationship_end_date < today).length,
      high_risk_relationships: relationships.filter(r => r.is_high_risk).length,
      unverified_relationships: relationships.filter(r => !r.is_verified).length,
      relationships_needing_review: relationships.filter(r => r.needs_review).length,
      relationship_types: {} as Record<string, number>,
      risk_levels: {} as Record<string, number>,
      verification_status: {} as Record<string, number>
    };

    // Count by relationship type
    relationships.forEach(rel => {
      stats.relationship_types[rel.relationship_type] = (stats.relationship_types[rel.relationship_type] || 0) + 1;
    });

    // Count by risk level
    relationships.forEach(rel => {
      if (rel.risk_level) {
        stats.risk_levels[rel.risk_level] = (stats.risk_levels[rel.risk_level] || 0) + 1;
      }
    });

    // Count by verification status
    relationships.forEach(rel => {
      const status = rel.verification_status;
      stats.verification_status[status] = (stats.verification_status[status] || 0) + 1;
    });

    return stats;
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<IndividualEntityRelationshipEntity>,
    filter: IndividualEntityRelationshipFilter
  ): void {
    QueryHelper.applyBaseFilters(queryBuilder, filter, 'rel');

    if (filter.primary_individual_id) {
      queryBuilder.andWhere('rel.primary_individual_id = :primaryIndividualId', { 
        primaryIndividualId: filter.primary_individual_id 
      });
    }

    if (filter.related_individual_id) {
      queryBuilder.andWhere('rel.related_individual_id = :relatedIndividualId', { 
        relatedIndividualId: filter.related_individual_id 
      });
    }

    if (filter.relationship_type) {
      queryBuilder.andWhere('rel.relationship_type = :relationshipType', { 
        relationshipType: filter.relationship_type 
      });
    }

    if (filter.relationship_status) {
      queryBuilder.andWhere('rel.relationship_status = :relationshipStatus', { 
        relationshipStatus: filter.relationship_status 
      });
    }

    if (filter.is_primary !== undefined) {
      queryBuilder.andWhere('rel.is_primary = :isPrimary', { isPrimary: filter.is_primary });
    }

    if (filter.is_reciprocal !== undefined) {
      queryBuilder.andWhere('rel.is_reciprocal = :isReciprocal', { isReciprocal: filter.is_reciprocal });
    }

    if (filter.is_pep_related !== undefined) {
      queryBuilder.andWhere('rel.is_pep_related = :isPepRelated', { isPepRelated: filter.is_pep_related });
    }

    if (filter.is_sanctions_related !== undefined) {
      queryBuilder.andWhere('rel.is_sanctions_related = :isSanctionsRelated', { 
        isSanctionsRelated: filter.is_sanctions_related 
      });
    }

    if (filter.requires_enhanced_due_diligence !== undefined) {
      queryBuilder.andWhere('rel.requires_enhanced_due_diligence = :requiresEdd', { 
        requiresEdd: filter.requires_enhanced_due_diligence 
      });
    }

    if (filter.risk_level) {
      queryBuilder.andWhere('rel.risk_level = :riskLevel', { riskLevel: filter.risk_level });
    }

    if (filter.is_verified !== undefined) {
      queryBuilder.andWhere('rel.is_verified = :isVerified', { isVerified: filter.is_verified });
    }

    if (filter.created_by) {
      queryBuilder.andWhere('rel.created_by = :createdBy', { createdBy: filter.created_by });
    }

    if (filter.updated_by) {
      queryBuilder.andWhere('rel.updated_by = :updatedBy', { updatedBy: filter.updated_by });
    }

    if (filter.relationship_types?.length) {
      QueryHelper.applyInClause(queryBuilder, 'rel.relationship_type', filter.relationship_types, 'relationshipTypes');
    }

    if (filter.risk_levels?.length) {
      QueryHelper.applyInClause(queryBuilder, 'rel.risk_level', filter.risk_levels, 'riskLevels');
    }

    if (filter.individual_ids?.length) {
      queryBuilder.andWhere(
        '(rel.primary_individual_id IN (:...individualIds) OR rel.related_individual_id IN (:...individualIds))',
        { individualIds: filter.individual_ids }
      );
    }

    if (filter.start_date_from) {
      queryBuilder.andWhere('rel.relationship_start_date >= :startDateFrom', { 
        startDateFrom: filter.start_date_from 
      });
    }

    if (filter.start_date_to) {
      queryBuilder.andWhere('rel.relationship_start_date <= :startDateTo', { 
        startDateTo: filter.start_date_to 
      });
    }

    if (filter.end_date_from) {
      queryBuilder.andWhere('rel.relationship_end_date >= :endDateFrom', { 
        endDateFrom: filter.end_date_from 
      });
    }

    if (filter.end_date_to) {
      queryBuilder.andWhere('rel.relationship_end_date <= :endDateTo', { 
        endDateTo: filter.end_date_to 
      });
    }

    if (filter.ownership_percentage_min !== undefined) {
      queryBuilder.andWhere('rel.ownership_percentage >= :ownershipMin', { 
        ownershipMin: filter.ownership_percentage_min 
      });
    }

    if (filter.ownership_percentage_max !== undefined) {
      queryBuilder.andWhere('rel.ownership_percentage <= :ownershipMax', { 
        ownershipMax: filter.ownership_percentage_max 
      });
    }

    if (filter.search) {
      queryBuilder.andWhere(
        '(rel.relationship_description ILIKE :search OR rel.notes ILIKE :search OR rel.legal_basis ILIKE :search)',
        { search: `%${filter.search}%` }
      );
    }
  }
}