import { Repository, SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { ListValueEntity } from '../entities/list-value.entity';
import { BaseFilter, PaginationOptions, PaginationResult } from '../../common/interfaces';
import { QueryHelper } from '../../../utils/database/query.helper';

export interface ListValueFilter extends BaseFilter {
  list_id?: string;
  value?: string;
  value_type?: string | string[];
  status?: string | string[];
  match_type?: string | string[];
  risk_level?: string | string[];
  confidence_score?: number;
  min_confidence_score?: number;
  max_confidence_score?: number;
  source?: string;
  source_type?: string | string[];
  is_verified?: boolean;
  is_active?: boolean;
  is_whitelisted?: boolean;
  is_false_positive?: boolean;
  is_expired?: boolean;
  is_effective?: boolean;
  category?: string;
  subcategory?: string;
  jurisdiction?: string;
  regulatory_framework?: string;
  reason_for_listing?: string;
  created_by?: string;
  updated_by?: string;
  verified_by?: string;
  match_count?: number;
  min_match_count?: number;
  max_match_count?: number;
  last_matched_date_from?: Date;
  last_matched_date_to?: Date;
  effective_date_from?: Date;
  effective_date_to?: Date;
  expiry_date_from?: Date;
  expiry_date_to?: Date;
  verified_date_from?: Date;
  verified_date_to?: Date;
  last_reviewed_date_from?: Date;
  last_reviewed_date_to?: Date;
  tags?: string | string[];
}

@Injectable()
export class ListValueRepository extends BaseRepository<ListValueEntity> {
  constructor(
    @InjectRepository(ListValueEntity)
    repository: Repository<ListValueEntity>,
  ) {
    super(repository);
  }

  async findWithFilters(
    filters: ListValueFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListValueEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findByListId(
    listId: string,
    filters: Omit<ListValueFilter, 'list_id'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListValueEntity>> {
    return this.findWithFilters({ ...filters, list_id: listId }, pagination);
  }

  async findByValue(
    value: string,
    exactMatch: boolean = false,
    filters: Omit<ListValueFilter, 'value'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListValueEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    
    if (exactMatch) {
      queryBuilder.andWhere('list_value.value = :value', { value });
    } else {
      queryBuilder.andWhere('list_value.value ILIKE :value', { value: `%${value}%` });
    }
    
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findByValueType(
    valueType: string | string[],
    filters: Omit<ListValueFilter, 'value_type'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListValueEntity>> {
    return this.findWithFilters({ ...filters, value_type: valueType }, pagination);
  }

  async findByRiskLevel(
    riskLevel: string | string[],
    filters: Omit<ListValueFilter, 'risk_level'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListValueEntity>> {
    return this.findWithFilters({ ...filters, risk_level: riskLevel }, pagination);
  }

  async findActiveValues(
    filters: Omit<ListValueFilter, 'is_active' | 'status'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListValueEntity>> {
    return this.findWithFilters({ 
      ...filters, 
      is_active: true, 
      status: 'active' 
    }, pagination);
  }

  async findVerifiedValues(
    filters: Omit<ListValueFilter, 'is_verified'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListValueEntity>> {
    return this.findWithFilters({ ...filters, is_verified: true }, pagination);
  }

  async findUnverifiedValues(
    filters: Omit<ListValueFilter, 'is_verified'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListValueEntity>> {
    return this.findWithFilters({ ...filters, is_verified: false }, pagination);
  }

  async findWhitelistedValues(
    filters: Omit<ListValueFilter, 'is_whitelisted'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListValueEntity>> {
    return this.findWithFilters({ ...filters, is_whitelisted: true }, pagination);
  }

  async findFalsePositives(
    filters: Omit<ListValueFilter, 'is_false_positive'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListValueEntity>> {
    return this.findWithFilters({ ...filters, is_false_positive: true }, pagination);
  }

  async findExpiredValues(
    filters: ListValueFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListValueEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('list_value.expiry_date < :currentDate', { currentDate: new Date() });
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findExpiringValues(
    daysAhead: number = 30,
    filters: ListValueFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListValueEntity>> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('list_value.expiry_date BETWEEN :currentDate AND :futureDate', { 
      currentDate: new Date(), 
      futureDate 
    });
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findHighConfidenceValues(
    minConfidence: number = 80,
    filters: Omit<ListValueFilter, 'min_confidence_score'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListValueEntity>> {
    return this.findWithFilters({ ...filters, min_confidence_score: minConfidence }, pagination);
  }

  async findLowConfidenceValues(
    maxConfidence: number = 50,
    filters: Omit<ListValueFilter, 'max_confidence_score'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListValueEntity>> {
    return this.findWithFilters({ ...filters, max_confidence_score: maxConfidence }, pagination);
  }

  async findHighRiskValues(
    filters: Omit<ListValueFilter, 'risk_level'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListValueEntity>> {
    return this.findWithFilters({ ...filters, risk_level: ['high', 'critical'] }, pagination);
  }

  async findFrequentlyMatchedValues(
    minMatches: number = 10,
    filters: Omit<ListValueFilter, 'min_match_count'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListValueEntity>> {
    return this.findWithFilters({ ...filters, min_match_count: minMatches }, pagination);
  }

  async findUnmatchedValues(
    filters: Omit<ListValueFilter, 'min_match_count' | 'max_match_count'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListValueEntity>> {
    return this.findWithFilters({ 
      ...filters, 
      min_match_count: 0, 
      max_match_count: 0 
    }, pagination);
  }

  async findRecentlyMatchedValues(
    daysBack: number = 7,
    filters: ListValueFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListValueEntity>> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - daysBack);

    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('list_value.last_matched_date >= :fromDate', { fromDate });
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findStaleValues(
    daysBack: number = 90,
    filters: ListValueFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListValueEntity>> {
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - daysBack);

    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('(list_value.last_matched_date IS NULL OR list_value.last_matched_date < :staleDate)', { staleDate });
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findByJurisdiction(
    jurisdiction: string,
    filters: Omit<ListValueFilter, 'jurisdiction'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListValueEntity>> {
    return this.findWithFilters({ ...filters, jurisdiction }, pagination);
  }

  async findByRegulatoryFramework(
    framework: string,
    filters: Omit<ListValueFilter, 'regulatory_framework'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListValueEntity>> {
    return this.findWithFilters({ ...filters, regulatory_framework: framework }, pagination);
  }

  async findByCategory(
    category: string,
    subcategory?: string,
    filters: Omit<ListValueFilter, 'category' | 'subcategory'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListValueEntity>> {
    const filterParams: ListValueFilter = { ...filters, category };
    if (subcategory) filterParams.subcategory = subcategory;
    return this.findWithFilters(filterParams, pagination);
  }

  async findBySource(
    source: string,
    sourceType?: string,
    filters: Omit<ListValueFilter, 'source' | 'source_type'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListValueEntity>> {
    const filterParams: ListValueFilter = { ...filters, source };
    if (sourceType) filterParams.source_type = sourceType;
    return this.findWithFilters(filterParams, pagination);
  }

  async findDuplicateValues(
    listId?: string,
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListValueEntity>> {
    const queryBuilder = this.repository.createQueryBuilder('list_value');
    
    if (listId) {
      queryBuilder.where('list_value.list_id = :listId', { listId });
    }
    
    queryBuilder.andWhere(`list_value.value IN (
      SELECT value 
      FROM list_values 
      ${listId ? 'WHERE list_id = :listId' : ''}
      GROUP BY value 
      HAVING COUNT(*) > 1
    )`);
    
    queryBuilder.orderBy('list_value.value', 'ASC');
    queryBuilder.addOrderBy('list_value.created_at', 'ASC');
    
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findSimilarValues(
    value: string,
    similarity: number = 0.8,
    listId?: string,
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListValueEntity>> {
    const queryBuilder = this.repository.createQueryBuilder('list_value');
    
    if (listId) {
      queryBuilder.where('list_value.list_id = :listId', { listId });
    }
    
    queryBuilder.andWhere('SIMILARITY(list_value.value, :value) >= :similarity', { 
      value, 
      similarity 
    });
    queryBuilder.orderBy('SIMILARITY(list_value.value, :value)', 'DESC');
    
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async updateValueStatus(
    id: string,
    status: string,
    updatedBy?: string,
  ): Promise<void> {
    const updateData: any = { 
      status, 
      updated_at: new Date() 
    };
    
    if (status === 'active') updateData.is_active = true;
    if (status === 'inactive') updateData.is_active = false;
    if (updatedBy) updateData.updated_by = updatedBy;
    
    await this.repository.update(id, updateData);
  }

  async markAsVerified(
    id: string,
    verifiedBy: string,
    verificationNotes?: string,
  ): Promise<void> {
    const updateData: any = {
      is_verified: true,
      verified_by: verifiedBy,
      verified_date: new Date(),
      updated_at: new Date(),
    };
    
    if (verificationNotes) updateData.verification_notes = verificationNotes;
    
    await this.repository.update(id, updateData);
  }

  async markAsUnverified(
    id: string,
    updatedBy?: string,
  ): Promise<void> {
    const updateData: any = {
      is_verified: false,
      verified_by: null,
      verified_date: null,
      verification_notes: null,
      updated_at: new Date(),
    };
    
    if (updatedBy) updateData.updated_by = updatedBy;
    
    await this.repository.update(id, updateData);
  }

  async markAsWhitelisted(
    id: string,
    updatedBy?: string,
    reason?: string,
  ): Promise<void> {
    const updateData: any = {
      is_whitelisted: true,
      updated_at: new Date(),
    };
    
    if (updatedBy) updateData.updated_by = updatedBy;
    if (reason) updateData.whitelist_reason = reason;
    
    await this.repository.update(id, updateData);
  }

  async markAsFalsePositive(
    id: string,
    updatedBy?: string,
    reason?: string,
  ): Promise<void> {
    const updateData: any = {
      is_false_positive: true,
      updated_at: new Date(),
    };
    
    if (updatedBy) updateData.updated_by = updatedBy;
    if (reason) updateData.false_positive_reason = reason;
    
    await this.repository.update(id, updateData);
  }

  async updateConfidenceScore(
    id: string,
    confidenceScore: number,
    updatedBy?: string,
  ): Promise<void> {
    const updateData: any = {
      confidence_score: confidenceScore,
      updated_at: new Date(),
    };
    
    if (updatedBy) updateData.updated_by = updatedBy;
    
    await this.repository.update(id, updateData);
  }

  async updateRiskLevel(
    id: string,
    riskLevel: string,
    updatedBy?: string,
  ): Promise<void> {
    const updateData: any = {
      risk_level: riskLevel,
      updated_at: new Date(),
    };
    
    if (updatedBy) updateData.updated_by = updatedBy;
    
    await this.repository.update(id, updateData);
  }

  async incrementMatchCount(
    id: string,
    matchedEntityId?: string,
  ): Promise<void> {
    const updateData: any = {
      match_count: () => 'match_count + 1',
      last_matched_date: new Date(),
      updated_at: new Date(),
    };
    
    if (matchedEntityId) {
      // Add to match history
      updateData.match_history = () => `
        COALESCE(match_history, '[]'::jsonb) || 
        jsonb_build_object(
          'entity_id', '${matchedEntityId}',
          'matched_at', '${new Date().toISOString()}'
        )
      `;
    }
    
    await this.repository.update(id, updateData);
  }

  async updateMatchHistory(
    id: string,
    matchHistory: any[],
  ): Promise<void> {
    await this.repository.update(id, {
      match_history: matchHistory,
      updated_at: new Date(),
    });
  }

  async updateReviewHistory(
    id: string,
    reviewHistory: any[],
  ): Promise<void> {
    await this.repository.update(id, {
      review_history: reviewHistory,
      last_reviewed_date: new Date(),
      updated_at: new Date(),
    });
  }

  async updateAdditionalData(
    id: string,
    additionalData: Record<string, any>,
  ): Promise<void> {
    await this.repository.update(id, {
      additional_data: additionalData,
      updated_at: new Date(),
    });
  }

  async updateAliases(
    id: string,
    aliases: string[],
  ): Promise<void> {
    await this.repository.update(id, {
      aliases,
      updated_at: new Date(),
    });
  }

  async updateRelatedIdentifiers(
    id: string,
    relatedIdentifiers: string[],
  ): Promise<void> {
    await this.repository.update(id, {
      related_identifiers: relatedIdentifiers,
      updated_at: new Date(),
    });
  }

  async updateMetadata(
    id: string,
    metadata: Record<string, any>,
    tags?: string[],
  ): Promise<void> {
    const updateData: any = {
      metadata,
      updated_at: new Date(),
    };
    
    if (tags) updateData.tags = tags;
    
    await this.repository.update(id, updateData);
  }

  async bulkUpdateStatus(
    ids: string[],
    status: string,
    updatedBy?: string,
  ): Promise<void> {
    const updateData: any = { 
      status, 
      updated_at: new Date() 
    };
    
    if (status === 'active') updateData.is_active = true;
    if (status === 'inactive') updateData.is_active = false;
    if (updatedBy) updateData.updated_by = updatedBy;
    
    await this.repository.update(ids, updateData);
  }

  async bulkMarkAsVerified(
    ids: string[],
    verifiedBy: string,
  ): Promise<void> {
    await this.repository.update(ids, {
      is_verified: true,
      verified_by: verifiedBy,
      verified_date: new Date(),
      updated_at: new Date(),
    });
  }

  async bulkMarkAsWhitelisted(
    ids: string[],
    updatedBy?: string,
    reason?: string,
  ): Promise<void> {
    const updateData: any = {
      is_whitelisted: true,
      updated_at: new Date(),
    };
    
    if (updatedBy) updateData.updated_by = updatedBy;
    if (reason) updateData.whitelist_reason = reason;
    
    await this.repository.update(ids, updateData);
  }

  async bulkMarkAsFalsePositive(
    ids: string[],
    updatedBy?: string,
    reason?: string,
  ): Promise<void> {
    const updateData: any = {
      is_false_positive: true,
      updated_at: new Date(),
    };
    
    if (updatedBy) updateData.updated_by = updatedBy;
    if (reason) updateData.false_positive_reason = reason;
    
    await this.repository.update(ids, updateData);
  }

  async getListValueStatistics(filters: ListValueFilter = {}): Promise<{
    total: number;
    by_value_type: Record<string, number>;
    by_status: Record<string, number>;
    by_match_type: Record<string, number>;
    by_risk_level: Record<string, number>;
    by_category: Record<string, number>;
    by_source: Record<string, number>;
    by_jurisdiction: Record<string, number>;
    active_count: number;
    inactive_count: number;
    verified_count: number;
    unverified_count: number;
    whitelisted_count: number;
    false_positive_count: number;
    expired_count: number;
    expiring_soon_count: number;
    high_risk_count: number;
    high_confidence_count: number;
    low_confidence_count: number;
    frequently_matched_count: number;
    unmatched_count: number;
    stale_count: number;
    duplicate_count: number;
    total_matches: number;
    average_confidence_score: number;
    average_match_count: number;
  }> {
    const queryBuilder = this.createFilteredQuery(filters);
    
    const [
      total,
      byValueType,
      byStatus,
      byMatchType,
      byRiskLevel,
      byCategory,
      bySource,
      byJurisdiction,
      activeCount,
      inactiveCount,
      verifiedCount,
      unverifiedCount,
      whitelistedCount,
      falsePositiveCount,
      expiredCount,
      expiringSoonCount,
      highRiskCount,
      highConfidenceCount,
      lowConfidenceCount,
      frequentlyMatchedCount,
      unmatchedCount,
      staleCount,
      duplicateCount,
      totalMatches,
      avgConfidenceScore,
      avgMatchCount,
    ] = await Promise.all([
      queryBuilder.getCount(),
      this.getCountByField('value_type', filters),
      this.getCountByField('status', filters),
      this.getCountByField('match_type', filters),
      this.getCountByField('risk_level', filters),
      this.getCountByField('category', filters),
      this.getCountByField('source', filters),
      this.getCountByField('jurisdiction', filters),
      this.getCountWithCondition({ ...filters, is_active: true }),
      this.getCountWithCondition({ ...filters, is_active: false }),
      this.getCountWithCondition({ ...filters, is_verified: true }),
      this.getCountWithCondition({ ...filters, is_verified: false }),
      this.getCountWithCondition({ ...filters, is_whitelisted: true }),
      this.getCountWithCondition({ ...filters, is_false_positive: true }),
      this.getExpiredCount(filters),
      this.getExpiringSoonCount(30, filters),
      this.getCountWithCondition({ ...filters, risk_level: ['high', 'critical'] }),
      this.getCountWithCondition({ ...filters, min_confidence_score: 80 }),
      this.getCountWithCondition({ ...filters, max_confidence_score: 50 }),
      this.getCountWithCondition({ ...filters, min_match_count: 10 }),
      this.getCountWithCondition({ ...filters, min_match_count: 0, max_match_count: 0 }),
      this.getStaleCount(90, filters),
      this.getDuplicateCount(filters),
      this.getSumByField('match_count', filters),
      this.getAverageConfidenceScore(filters),
      this.getAverageMatchCount(filters),
    ]);

    return {
      total,
      by_value_type: byValueType,
      by_status: byStatus,
      by_match_type: byMatchType,
      by_risk_level: byRiskLevel,
      by_category: byCategory,
      by_source: bySource,
      by_jurisdiction: byJurisdiction,
      active_count: activeCount,
      inactive_count: inactiveCount,
      verified_count: verifiedCount,
      unverified_count: unverifiedCount,
      whitelisted_count: whitelistedCount,
      false_positive_count: falsePositiveCount,
      expired_count: expiredCount,
      expiring_soon_count: expiringSoonCount,
      high_risk_count: highRiskCount,
      high_confidence_count: highConfidenceCount,
      low_confidence_count: lowConfidenceCount,
      frequently_matched_count: frequentlyMatchedCount,
      unmatched_count: unmatchedCount,
      stale_count: staleCount,
      duplicate_count: duplicateCount,
      total_matches: totalMatches,
      average_confidence_score: avgConfidenceScore,
      average_match_count: avgMatchCount,
    };
  }

  private createFilteredQuery(filters: ListValueFilter): SelectQueryBuilder<ListValueEntity> {
    const queryBuilder = this.repository.createQueryBuilder('list_value');

    // Apply base filters
    QueryHelper.applyBaseFilters(queryBuilder, filters, 'list_value');

    // Apply specific filters
    if (filters.list_id) {
      queryBuilder.andWhere('list_value.list_id = :listId', { listId: filters.list_id });
    }

    if (filters.value) {
      queryBuilder.andWhere('list_value.value ILIKE :value', { value: `%${filters.value}%` });
    }

    if (filters.value_type) {
      QueryHelper.applyInFilter(queryBuilder, 'list_value.value_type', filters.value_type);
    }

    if (filters.status) {
      QueryHelper.applyInFilter(queryBuilder, 'list_value.status', filters.status);
    }

    if (filters.match_type) {
      QueryHelper.applyInFilter(queryBuilder, 'list_value.match_type', filters.match_type);
    }

    if (filters.risk_level) {
      QueryHelper.applyInFilter(queryBuilder, 'list_value.risk_level', filters.risk_level);
    }

    if (filters.confidence_score !== undefined) {
      queryBuilder.andWhere('list_value.confidence_score = :confidenceScore', { confidenceScore: filters.confidence_score });
    }

    if (filters.min_confidence_score !== undefined) {
      queryBuilder.andWhere('list_value.confidence_score >= :minConfidenceScore', { minConfidenceScore: filters.min_confidence_score });
    }

    if (filters.max_confidence_score !== undefined) {
      queryBuilder.andWhere('list_value.confidence_score <= :maxConfidenceScore', { maxConfidenceScore: filters.max_confidence_score });
    }

    if (filters.source) {
      queryBuilder.andWhere('list_value.source = :source', { source: filters.source });
    }

    if (filters.source_type) {
      QueryHelper.applyInFilter(queryBuilder, 'list_value.source_type', filters.source_type);
    }

    if (filters.is_verified !== undefined) {
      queryBuilder.andWhere('list_value.is_verified = :isVerified', { isVerified: filters.is_verified });
    }

    if (filters.is_active !== undefined) {
      queryBuilder.andWhere('list_value.is_active = :isActive', { isActive: filters.is_active });
    }

    if (filters.is_whitelisted !== undefined) {
      queryBuilder.andWhere('list_value.is_whitelisted = :isWhitelisted', { isWhitelisted: filters.is_whitelisted });
    }

    if (filters.is_false_positive !== undefined) {
      queryBuilder.andWhere('list_value.is_false_positive = :isFalsePositive', { isFalsePositive: filters.is_false_positive });
    }

    if (filters.is_expired !== undefined) {
      if (filters.is_expired) {
        queryBuilder.andWhere('list_value.expiry_date < :currentDate', { currentDate: new Date() });
      } else {
        queryBuilder.andWhere('(list_value.expiry_date IS NULL OR list_value.expiry_date >= :currentDate)', { currentDate: new Date() });
      }
    }

    if (filters.is_effective !== undefined) {
      const now = new Date();
      if (filters.is_effective) {
        queryBuilder.andWhere('(list_value.effective_date IS NULL OR list_value.effective_date <= :now)', { now });
        queryBuilder.andWhere('(list_value.expiry_date IS NULL OR list_value.expiry_date > :now)', { now });
      } else {
        queryBuilder.andWhere('(list_value.effective_date > :now OR list_value.expiry_date <= :now)', { now });
      }
    }

    if (filters.category) {
      queryBuilder.andWhere('list_value.category = :category', { category: filters.category });
    }

    if (filters.subcategory) {
      queryBuilder.andWhere('list_value.subcategory = :subcategory', { subcategory: filters.subcategory });
    }

    if (filters.jurisdiction) {
      queryBuilder.andWhere('list_value.jurisdiction = :jurisdiction', { jurisdiction: filters.jurisdiction });
    }

    if (filters.regulatory_framework) {
      queryBuilder.andWhere('list_value.regulatory_framework = :regulatoryFramework', { regulatoryFramework: filters.regulatory_framework });
    }

    if (filters.reason_for_listing) {
      queryBuilder.andWhere('list_value.reason_for_listing ILIKE :reasonForListing', { reasonForListing: `%${filters.reason_for_listing}%` });
    }

    if (filters.created_by) {
      queryBuilder.andWhere('list_value.created_by = :createdBy', { createdBy: filters.created_by });
    }

    if (filters.updated_by) {
      queryBuilder.andWhere('list_value.updated_by = :updatedBy', { updatedBy: filters.updated_by });
    }

    if (filters.verified_by) {
      queryBuilder.andWhere('list_value.verified_by = :verifiedBy', { verifiedBy: filters.verified_by });
    }

    // Numeric range filters
    if (filters.match_count !== undefined) {
      queryBuilder.andWhere('list_value.match_count = :matchCount', { matchCount: filters.match_count });
    }

    if (filters.min_match_count !== undefined) {
      queryBuilder.andWhere('list_value.match_count >= :minMatchCount', { minMatchCount: filters.min_match_count });
    }

    if (filters.max_match_count !== undefined) {
      queryBuilder.andWhere('list_value.match_count <= :maxMatchCount', { maxMatchCount: filters.max_match_count });
    }

    // Date range filters
    if (filters.last_matched_date_from) {
      queryBuilder.andWhere('list_value.last_matched_date >= :lastMatchedDateFrom', { lastMatchedDateFrom: filters.last_matched_date_from });
    }

    if (filters.last_matched_date_to) {
      queryBuilder.andWhere('list_value.last_matched_date <= :lastMatchedDateTo', { lastMatchedDateTo: filters.last_matched_date_to });
    }

    if (filters.effective_date_from) {
      queryBuilder.andWhere('list_value.effective_date >= :effectiveDateFrom', { effectiveDateFrom: filters.effective_date_from });
    }

    if (filters.effective_date_to) {
      queryBuilder.andWhere('list_value.effective_date <= :effectiveDateTo', { effectiveDateTo: filters.effective_date_to });
    }

    if (filters.expiry_date_from) {
      queryBuilder.andWhere('list_value.expiry_date >= :expiryDateFrom', { expiryDateFrom: filters.expiry_date_from });
    }

    if (filters.expiry_date_to) {
      queryBuilder.andWhere('list_value.expiry_date <= :expiryDateTo', { expiryDateTo: filters.expiry_date_to });
    }

    if (filters.verified_date_from) {
      queryBuilder.andWhere('list_value.verified_date >= :verifiedDateFrom', { verifiedDateFrom: filters.verified_date_from });
    }

    if (filters.verified_date_to) {
      queryBuilder.andWhere('list_value.verified_date <= :verifiedDateTo', { verifiedDateTo: filters.verified_date_to });
    }

    if (filters.last_reviewed_date_from) {
      queryBuilder.andWhere('list_value.last_reviewed_date >= :lastReviewedDateFrom', { lastReviewedDateFrom: filters.last_reviewed_date_from });
    }

    if (filters.last_reviewed_date_to) {
      queryBuilder.andWhere('list_value.last_reviewed_date <= :lastReviewedDateTo', { lastReviewedDateTo: filters.last_reviewed_date_to });
    }

    // Text search filters
    if (filters.tags) {
      const tags = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
      const tagConditions = tags.map((_, index) => `list_value.tags ILIKE :tag${index}`).join(' OR ');
      const tagParams = tags.reduce((params, tag, index) => {
        params[`tag${index}`] = `%${tag}%`;
        return params;
      }, {} as Record<string, string>);
      
      queryBuilder.andWhere(`(${tagConditions})`, tagParams);
    }

    return queryBuilder;
  }

  private async getCountByField(field: string, filters: ListValueFilter): Promise<Record<string, number>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select(`list_value.${field}`, 'field_value');
    queryBuilder.addSelect('COUNT(*)', 'count');
    queryBuilder.groupBy(`list_value.${field}`);

    const results = await queryBuilder.getRawMany();
    return results.reduce((acc, result) => {
      acc[result.field_value] = parseInt(result.count);
      return acc;
    }, {});
  }

  private async getCountWithCondition(filters: ListValueFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    return queryBuilder.getCount();
  }

  private async getSumByField(field: string, filters: ListValueFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select(`SUM(list_value.${field})`, 'sum_value');
    
    const result = await queryBuilder.getRawOne();
    return parseInt(result.sum_value) || 0;
  }

  private async getExpiredCount(filters: ListValueFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('list_value.expiry_date < :currentDate', { currentDate: new Date() });
    return queryBuilder.getCount();
  }

  private async getExpiringSoonCount(daysAhead: number, filters: ListValueFilter): Promise<number> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('list_value.expiry_date BETWEEN :currentDate AND :futureDate', { 
      currentDate: new Date(), 
      futureDate 
    });
    return queryBuilder.getCount();
  }

  private async getStaleCount(daysBack: number, filters: ListValueFilter): Promise<number> {
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - daysBack);

    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('(list_value.last_matched_date IS NULL OR list_value.last_matched_date < :staleDate)', { staleDate });
    return queryBuilder.getCount();
  }

  private async getDuplicateCount(filters: ListValueFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere(`list_value.value IN (
      SELECT value 
      FROM list_values 
      GROUP BY value 
      HAVING COUNT(*) > 1
    )`);
    return queryBuilder.getCount();
  }

  private async getAverageConfidenceScore(filters: ListValueFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select('AVG(list_value.confidence_score)', 'avg_confidence');
    
    const result = await queryBuilder.getRawOne();
    return parseFloat(result.avg_confidence) || 0;
  }

  private async getAverageMatchCount(filters: ListValueFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select('AVG(list_value.match_count)', 'avg_matches');
    
    const result = await queryBuilder.getRawOne();
    return parseFloat(result.avg_matches) || 0;
  }
}