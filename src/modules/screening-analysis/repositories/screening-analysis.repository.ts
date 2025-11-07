import { Repository, SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ScreeningAnalysisEntity } from '../entities/screening-analysis.entity';
import { BaseFilter, PaginationOptions, PaginationResult } from '../../common/interfaces';
import { QueryHelper } from '../../../utils/database/query.helper';
import { BaseRepository } from '../../common/repositories/base.repository';

export interface ScreeningAnalysisFilter extends BaseFilter {
  entity_id?: string;
  subscriber_id?: string;
  screening_type?: string | string[];
  screening_provider?: string;
  screening_status?: string | string[];
  risk_level?: string | string[];
  match_status?: string | string[];
  requires_review?: boolean;
  is_false_positive?: boolean;
  is_whitelisted?: boolean;
  is_escalated?: boolean;
  is_active?: boolean;
  has_matches?: boolean;
  has_high_risk_matches?: boolean;
  is_overdue_review?: boolean;
  is_stale?: boolean;
  initiated_by?: string;
  reviewed_by?: string;
  escalated_to?: string;
  review_decision?: string | string[];
  jurisdiction?: string;
  min_confidence_score?: number;
  max_confidence_score?: number;
  min_match_score?: number;
  max_match_score?: number;
  min_total_matches?: number;
  max_total_matches?: number;
  screening_date_from?: Date;
  screening_date_to?: Date;
  completed_date_from?: Date;
  completed_date_to?: Date;
  review_date_from?: Date;
  review_date_to?: Date;
  next_review_date_from?: Date;
  next_review_date_to?: Date;
  tags?: string | string[];
  data_sources?: string | string[];
  search_terms?: string | string[];
}

@Injectable()
export class ScreeningAnalysisRepository extends BaseRepository<ScreeningAnalysisEntity> {
  constructor(
    @InjectRepository(ScreeningAnalysisEntity)
    repository: Repository<ScreeningAnalysisEntity>,
  ) {
    super(repository);
  }

  async findWithFilters(
    filters: ScreeningAnalysisFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ScreeningAnalysisEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findByEntityId(
    entityId: string,
    filters: Omit<ScreeningAnalysisFilter, 'entity_id'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ScreeningAnalysisEntity>> {
    return this.findWithFilters({ ...filters, entity_id: entityId }, pagination);
  }

  async findBySubscriberId(
    subscriberId: string,
    filters: Omit<ScreeningAnalysisFilter, 'subscriber_id'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ScreeningAnalysisEntity>> {
    return this.findWithFilters({ ...filters, subscriber_id: subscriberId }, pagination);
  }

  async findByScreeningType(
    screeningType: string | string[],
    filters: Omit<ScreeningAnalysisFilter, 'screening_type'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ScreeningAnalysisEntity>> {
    return this.findWithFilters({ ...filters, screening_type: screeningType }, pagination);
  }

  async findByRiskLevel(
    riskLevel: string | string[],
    filters: Omit<ScreeningAnalysisFilter, 'risk_level'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ScreeningAnalysisEntity>> {
    return this.findWithFilters({ ...filters, risk_level: riskLevel }, pagination);
  }

  async findHighRiskScreenings(
    filters: ScreeningAnalysisFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ScreeningAnalysisEntity>> {
    return this.findWithFilters({ ...filters, risk_level: ['high', 'critical'] }, pagination);
  }

  async findPendingReview(
    filters: Omit<ScreeningAnalysisFilter, 'requires_review'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ScreeningAnalysisEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('(screening_analysis.requires_review = :requiresReview OR screening_analysis.high_risk_matches > 0 OR screening_analysis.match_status = :possibleMatch)', {
      requiresReview: true,
      possibleMatch: 'possible_match',
    });
    queryBuilder.andWhere('screening_analysis.reviewed_by IS NULL');
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findOverdueReviews(
    filters: ScreeningAnalysisFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ScreeningAnalysisEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('screening_analysis.next_review_date < :currentDate', { currentDate: new Date() });
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findEscalatedScreenings(
    filters: Omit<ScreeningAnalysisFilter, 'is_escalated'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ScreeningAnalysisEntity>> {
    return this.findWithFilters({ ...filters, is_escalated: true }, pagination);
  }

  async findStaleScreenings(
    maxAgeDays: number = 90,
    filters: ScreeningAnalysisFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ScreeningAnalysisEntity>> {
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - maxAgeDays);

    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('screening_analysis.completed_date < :staleDate', { staleDate });
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findFailedScreenings(
    filters: ScreeningAnalysisFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ScreeningAnalysisEntity>> {
    return this.findWithFilters({ ...filters, screening_status: 'failed' }, pagination);
  }

  async findWithMatches(
    filters: ScreeningAnalysisFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ScreeningAnalysisEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('screening_analysis.total_matches > 0');
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findFalsePositives(
    filters: Omit<ScreeningAnalysisFilter, 'is_false_positive'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ScreeningAnalysisEntity>> {
    return this.findWithFilters({ ...filters, is_false_positive: true }, pagination);
  }

  async findWhitelistedScreenings(
    filters: Omit<ScreeningAnalysisFilter, 'is_whitelisted'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ScreeningAnalysisEntity>> {
    return this.findWithFilters({ ...filters, is_whitelisted: true }, pagination);
  }

  async findByProvider(
    provider: string,
    filters: Omit<ScreeningAnalysisFilter, 'screening_provider'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ScreeningAnalysisEntity>> {
    return this.findWithFilters({ ...filters, screening_provider: provider }, pagination);
  }

  async findRecentScreenings(
    daysBack: number = 7,
    filters: ScreeningAnalysisFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ScreeningAnalysisEntity>> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - daysBack);

    return this.findWithFilters({ 
      ...filters, 
      screening_date_from: fromDate 
    }, pagination);
  }

  async findByJurisdiction(
    jurisdiction: string,
    filters: Omit<ScreeningAnalysisFilter, 'jurisdiction'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ScreeningAnalysisEntity>> {
    return this.findWithFilters({ ...filters, jurisdiction }, pagination);
  }

  async updateScreeningStatus(
    id: string,
    status: string,
    updatedBy?: string,
  ): Promise<void> {
    const updateData: any = { 
      screening_status: status, 
      updated_at: new Date(),
      last_updated_date: new Date(),
    };
    
    if (status === 'completed') {
      updateData.completed_date = new Date();
    }
    
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
      last_updated_date: new Date(),
    };
    
    if (updatedBy) updateData.updated_by = updatedBy;
    
    await this.repository.update(id, updateData);
  }

  async updateMatchStatus(
    id: string,
    matchStatus: string,
    updatedBy?: string,
  ): Promise<void> {
    const updateData: any = { 
      match_status: matchStatus, 
      updated_at: new Date(),
      last_updated_date: new Date(),
    };
    
    if (updatedBy) updateData.updated_by = updatedBy;
    
    await this.repository.update(id, updateData);
  }

  async markAsReviewed(
    id: string,
    reviewedBy: string,
    reviewDecision: string,
    reviewNotes?: string,
  ): Promise<void> {
    const updateData: any = {
      reviewed_by: reviewedBy,
      review_date: new Date(),
      review_decision: reviewDecision,
      requires_review: false,
      updated_at: new Date(),
      last_updated_date: new Date(),
    };
    
    if (reviewNotes) updateData.review_notes = reviewNotes;
    
    await this.repository.update(id, updateData);
  }

  async markAsFalsePositive(
    id: string,
    reviewedBy: string,
    notes?: string,
  ): Promise<void> {
    const updateData: any = {
      is_false_positive: true,
      reviewed_by: reviewedBy,
      review_date: new Date(),
      review_decision: 'approved',
      requires_review: false,
      updated_at: new Date(),
      last_updated_date: new Date(),
    };
    
    if (notes) updateData.review_notes = notes;
    
    await this.repository.update(id, updateData);
  }

  async addToWhitelist(
    id: string,
    reviewedBy: string,
    notes?: string,
  ): Promise<void> {
    const updateData: any = {
      is_whitelisted: true,
      reviewed_by: reviewedBy,
      review_date: new Date(),
      review_decision: 'approved',
      requires_review: false,
      updated_at: new Date(),
      last_updated_date: new Date(),
    };
    
    if (notes) updateData.review_notes = notes;
    
    await this.repository.update(id, updateData);
  }

  async escalateScreening(
    id: string,
    escalatedTo: string,
    escalationReason: string,
    escalatedBy?: string,
  ): Promise<void> {
    const updateData: any = {
      is_escalated: true,
      escalated_to: escalatedTo,
      escalation_date: new Date(),
      escalation_reason: escalationReason,
      updated_at: new Date(),
      last_updated_date: new Date(),
    };
    
    if (escalatedBy) updateData.updated_by = escalatedBy;
    
    await this.repository.update(id, updateData);
  }

  async updateMatchCounts(
    id: string,
    totalMatches: number,
    highRiskMatches: number,
    mediumRiskMatches: number,
    lowRiskMatches: number,
  ): Promise<void> {
    await this.repository.update(id, {
      total_matches: totalMatches,
      high_risk_matches: highRiskMatches,
      medium_risk_matches: mediumRiskMatches,
      low_risk_matches: lowRiskMatches,
      updated_at: new Date(),
      last_updated_date: new Date(),
    } as any);
  }

  async updateScores(
    id: string,
    confidenceScore?: number,
    matchScore?: number,
  ): Promise<void> {
    const updateData: any = {
      updated_at: new Date(),
      last_updated_date: new Date(),
    };
    
    if (confidenceScore !== undefined) updateData.confidence_score = confidenceScore;
    if (matchScore !== undefined) updateData.match_score = matchScore;
    
    await this.repository.update(id, updateData);
  }

  async updateScreeningResults(
    id: string,
    screeningResults: Record<string, any>,
    matchDetails?: Record<string, any>,
    providerResponse?: Record<string, any>,
  ): Promise<void> {
    const updateData: any = {
      screening_results: screeningResults,
      updated_at: new Date(),
      last_updated_date: new Date(),
    };
    
    if (matchDetails) updateData.match_details = matchDetails;
    if (providerResponse) updateData.provider_response = providerResponse;
    
    await this.repository.update(id, updateData);
  }

  async updateProcessingTime(
    id: string,
    processingTimeSeconds: number,
  ): Promise<void> {
    await this.repository.update(id, {
      processing_time_seconds: processingTimeSeconds,
      updated_at: new Date(),
      last_updated_date: new Date(),
    } as any);
  }

  async incrementRetryCount(id: string): Promise<void> {
    await this.repository.update(id, {
      retry_count: () => 'retry_count + 1',
      last_retry_date: new Date(),
      updated_at: new Date(),
      last_updated_date: new Date(),
    } as any);
  }

  async updateNextReviewDate(
    id: string,
    nextReviewDate: Date,
    reviewFrequencyDays?: number,
  ): Promise<void> {
    const updateData: any = {
      next_review_date: nextReviewDate,
      updated_at: new Date(),
      last_updated_date: new Date(),
    };
    
    if (reviewFrequencyDays) updateData.review_frequency_days = reviewFrequencyDays;
    
    await this.repository.update(id, updateData);
  }

  async updateCost(
    id: string,
    cost: number,
    currency: string,
  ): Promise<void> {
    await this.repository.update(id, {
      screening_cost: cost,
      cost_currency: currency,
      updated_at: new Date(),
      last_updated_date: new Date(),
    } as any);
  }

  async getScreeningStatistics(filters: ScreeningAnalysisFilter = {}): Promise<{
    total: number;
    by_type: Record<string, number>;
    by_status: Record<string, number>;
    by_risk_level: Record<string, number>;
    by_match_status: Record<string, number>;
    by_provider: Record<string, number>;
    pending_review_count: number;
    escalated_count: number;
    false_positive_count: number;
    whitelisted_count: number;
    overdue_review_count: number;
    stale_count: number;
    failed_count: number;
    total_matches: number;
    high_risk_matches: number;
    average_confidence_score: number;
    average_match_score: number;
    average_processing_time: number;
    total_cost: number;
  }> {
    const queryBuilder = this.createFilteredQuery(filters);
    
    const [
      total,
      byType,
      byStatus,
      byRiskLevel,
      byMatchStatus,
      byProvider,
      pendingReviewCount,
      escalatedCount,
      falsePositiveCount,
      whitelistedCount,
      overdueReviewCount,
      staleCount,
      failedCount,
      totalMatches,
      highRiskMatches,
      avgConfidence,
      avgMatchScore,
      avgProcessingTime,
      totalCost,
    ] = await Promise.all([
      queryBuilder.getCount(),
      this.getCountByField('screening_type', filters),
      this.getCountByField('screening_status', filters),
      this.getCountByField('risk_level', filters),
      this.getCountByField('match_status', filters),
      this.getCountByField('screening_provider', filters),
      this.getCountWithCondition({ ...filters, requires_review: true }),
      this.getCountWithCondition({ ...filters, is_escalated: true }),
      this.getCountWithCondition({ ...filters, is_false_positive: true }),
      this.getCountWithCondition({ ...filters, is_whitelisted: true }),
      this.getOverdueReviewCount(filters),
      this.getStaleCount(90, filters),
      this.getCountWithCondition({ ...filters, screening_status: 'failed' }),
      this.getTotalMatches(filters),
      this.getHighRiskMatches(filters),
      this.getAverageConfidenceScore(filters),
      this.getAverageMatchScore(filters),
      this.getAverageProcessingTime(filters),
      this.getTotalCost(filters),
    ]);

    return {
      total,
      by_type: byType,
      by_status: byStatus,
      by_risk_level: byRiskLevel,
      by_match_status: byMatchStatus,
      by_provider: byProvider,
      pending_review_count: pendingReviewCount,
      escalated_count: escalatedCount,
      false_positive_count: falsePositiveCount,
      whitelisted_count: whitelistedCount,
      overdue_review_count: overdueReviewCount,
      stale_count: staleCount,
      failed_count: failedCount,
      total_matches: totalMatches,
      high_risk_matches: highRiskMatches,
      average_confidence_score: avgConfidence,
      average_match_score: avgMatchScore,
      average_processing_time: avgProcessingTime,
      total_cost: totalCost,
    };
  }

  private createFilteredQuery(filters: ScreeningAnalysisFilter): SelectQueryBuilder<ScreeningAnalysisEntity> {
    const queryBuilder = this.repository.createQueryBuilder('screening_analysis');

    // Apply base filters
    QueryHelper.applyBaseFilters(queryBuilder, filters, 'screening_analysis');

    // Apply specific filters
    if (filters.entity_id) {
      queryBuilder.andWhere('screening_analysis.entity_id = :entityId', { entityId: filters.entity_id });
    }

    if (filters.subscriber_id) {
      queryBuilder.andWhere('screening_analysis.subscriber_id = :subscriberId', { subscriberId: filters.subscriber_id });
    }

    if (filters.screening_type) {
      QueryHelper.applyInFilter(queryBuilder, 'screening_analysis.screening_type', filters.screening_type);
    }

    if (filters.screening_provider) {
      queryBuilder.andWhere('screening_analysis.screening_provider = :screeningProvider', { screeningProvider: filters.screening_provider });
    }

    if (filters.screening_status) {
      QueryHelper.applyInFilter(queryBuilder, 'screening_analysis.screening_status', filters.screening_status);
    }

    if (filters.risk_level) {
      QueryHelper.applyInFilter(queryBuilder, 'screening_analysis.risk_level', filters.risk_level);
    }

    if (filters.match_status) {
      QueryHelper.applyInFilter(queryBuilder, 'screening_analysis.match_status', filters.match_status);
    }

    if (filters.requires_review !== undefined) {
      queryBuilder.andWhere('screening_analysis.requires_review = :requiresReview', { requiresReview: filters.requires_review });
    }

    if (filters.is_false_positive !== undefined) {
      queryBuilder.andWhere('screening_analysis.is_false_positive = :isFalsePositive', { isFalsePositive: filters.is_false_positive });
    }

    if (filters.is_whitelisted !== undefined) {
      queryBuilder.andWhere('screening_analysis.is_whitelisted = :isWhitelisted', { isWhitelisted: filters.is_whitelisted });
    }

    if (filters.is_escalated !== undefined) {
      queryBuilder.andWhere('screening_analysis.is_escalated = :isEscalated', { isEscalated: filters.is_escalated });
    }

    if (filters.is_active !== undefined) {
      queryBuilder.andWhere('screening_analysis.is_active = :isActive', { isActive: filters.is_active });
    }

    if (filters.has_matches !== undefined) {
      if (filters.has_matches) {
        queryBuilder.andWhere('screening_analysis.total_matches > 0');
      } else {
        queryBuilder.andWhere('screening_analysis.total_matches = 0');
      }
    }

    if (filters.has_high_risk_matches !== undefined) {
      if (filters.has_high_risk_matches) {
        queryBuilder.andWhere('screening_analysis.high_risk_matches > 0');
      } else {
        queryBuilder.andWhere('screening_analysis.high_risk_matches = 0');
      }
    }

    if (filters.is_overdue_review !== undefined) {
      if (filters.is_overdue_review) {
        queryBuilder.andWhere('screening_analysis.next_review_date < :currentDate', { currentDate: new Date() });
      } else {
        queryBuilder.andWhere('(screening_analysis.next_review_date IS NULL OR screening_analysis.next_review_date >= :currentDate)', { currentDate: new Date() });
      }
    }

    if (filters.is_stale !== undefined) {
      const staleDate = new Date();
      staleDate.setDate(staleDate.getDate() - 90);
      
      if (filters.is_stale) {
        queryBuilder.andWhere('screening_analysis.completed_date < :staleDate', { staleDate });
      } else {
        queryBuilder.andWhere('(screening_analysis.completed_date IS NULL OR screening_analysis.completed_date >= :staleDate)', { staleDate });
      }
    }

    if (filters.initiated_by) {
      queryBuilder.andWhere('screening_analysis.initiated_by = :initiatedBy', { initiatedBy: filters.initiated_by });
    }

    if (filters.reviewed_by) {
      queryBuilder.andWhere('screening_analysis.reviewed_by = :reviewedBy', { reviewedBy: filters.reviewed_by });
    }

    if (filters.escalated_to) {
      queryBuilder.andWhere('screening_analysis.escalated_to = :escalatedTo', { escalatedTo: filters.escalated_to });
    }

    if (filters.review_decision) {
      QueryHelper.applyInFilter(queryBuilder, 'screening_analysis.review_decision', filters.review_decision);
    }

    if (filters.jurisdiction) {
      queryBuilder.andWhere('screening_analysis.jurisdiction = :jurisdiction', { jurisdiction: filters.jurisdiction });
    }

    // Score filters
    if (filters.min_confidence_score !== undefined) {
      queryBuilder.andWhere('screening_analysis.confidence_score >= :minConfidenceScore', { minConfidenceScore: filters.min_confidence_score });
    }

    if (filters.max_confidence_score !== undefined) {
      queryBuilder.andWhere('screening_analysis.confidence_score <= :maxConfidenceScore', { maxConfidenceScore: filters.max_confidence_score });
    }

    if (filters.min_match_score !== undefined) {
      queryBuilder.andWhere('screening_analysis.match_score >= :minMatchScore', { minMatchScore: filters.min_match_score });
    }

    if (filters.max_match_score !== undefined) {
      queryBuilder.andWhere('screening_analysis.match_score <= :maxMatchScore', { maxMatchScore: filters.max_match_score });
    }

    if (filters.min_total_matches !== undefined) {
      queryBuilder.andWhere('screening_analysis.total_matches >= :minTotalMatches', { minTotalMatches: filters.min_total_matches });
    }

    if (filters.max_total_matches !== undefined) {
      queryBuilder.andWhere('screening_analysis.total_matches <= :maxTotalMatches', { maxTotalMatches: filters.max_total_matches });
    }

    // Date range filters
    if (filters.screening_date_from) {
      queryBuilder.andWhere('screening_analysis.screening_date >= :screeningDateFrom', { screeningDateFrom: filters.screening_date_from });
    }

    if (filters.screening_date_to) {
      queryBuilder.andWhere('screening_analysis.screening_date <= :screeningDateTo', { screeningDateTo: filters.screening_date_to });
    }

    if (filters.completed_date_from) {
      queryBuilder.andWhere('screening_analysis.completed_date >= :completedDateFrom', { completedDateFrom: filters.completed_date_from });
    }

    if (filters.completed_date_to) {
      queryBuilder.andWhere('screening_analysis.completed_date <= :completedDateTo', { completedDateTo: filters.completed_date_to });
    }

    if (filters.review_date_from) {
      queryBuilder.andWhere('screening_analysis.review_date >= :reviewDateFrom', { reviewDateFrom: filters.review_date_from });
    }

    if (filters.review_date_to) {
      queryBuilder.andWhere('screening_analysis.review_date <= :reviewDateTo', { reviewDateTo: filters.review_date_to });
    }

    if (filters.next_review_date_from) {
      queryBuilder.andWhere('screening_analysis.next_review_date >= :nextReviewDateFrom', { nextReviewDateFrom: filters.next_review_date_from });
    }

    if (filters.next_review_date_to) {
      queryBuilder.andWhere('screening_analysis.next_review_date <= :nextReviewDateTo', { nextReviewDateTo: filters.next_review_date_to });
    }

    // Text search filters
    if (filters.tags) {
      const tags = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
      const tagConditions = tags.map((_, index) => `screening_analysis.tags ILIKE :tag${index}`).join(' OR ');
      const tagParams = tags.reduce((params, tag, index) => {
        params[`tag${index}`] = `%${tag}%`;
        return params;
      }, {} as Record<string, string>);
      
      queryBuilder.andWhere(`(${tagConditions})`, tagParams);
    }

    if (filters.data_sources) {
      const sources = Array.isArray(filters.data_sources) ? filters.data_sources : [filters.data_sources];
      const sourceConditions = sources.map((_, index) => `screening_analysis.data_sources ILIKE :source${index}`).join(' OR ');
      const sourceParams = sources.reduce((params, source, index) => {
        params[`source${index}`] = `%${source}%`;
        return params;
      }, {} as Record<string, string>);
      
      queryBuilder.andWhere(`(${sourceConditions})`, sourceParams);
    }

    if (filters.search_terms) {
      const terms = Array.isArray(filters.search_terms) ? filters.search_terms : [filters.search_terms];
      const termConditions = terms.map((_, index) => `screening_analysis.search_terms ILIKE :term${index}`).join(' OR ');
      const termParams = terms.reduce((params: Record<string, any>, term, index) => {
        params[`term${index}`] = `%${term}%`;
        return params;
      }, {});
      
      queryBuilder.andWhere(`(${termConditions})`, termParams);
    }

    return queryBuilder;
  }

  private async getCountByField(field: string, filters: ScreeningAnalysisFilter): Promise<Record<string, number>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select(`screening_analysis.${field}`, 'field_value');
    queryBuilder.addSelect('COUNT(*)', 'count');
    queryBuilder.groupBy(`screening_analysis.${field}`);

    const results = await queryBuilder.getRawMany();
    return results.reduce((acc, result) => {
      acc[result.field_value] = parseInt(result.count);
      return acc;
    }, {});
  }

  private async getCountWithCondition(filters: ScreeningAnalysisFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    return queryBuilder.getCount();
  }

  private async getOverdueReviewCount(filters: ScreeningAnalysisFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('screening_analysis.next_review_date < :currentDate', { currentDate: new Date() });
    return queryBuilder.getCount();
  }

  private async getStaleCount(maxAgeDays: number, filters: ScreeningAnalysisFilter): Promise<number> {
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - maxAgeDays);

    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('screening_analysis.completed_date < :staleDate', { staleDate });
    return queryBuilder.getCount();
  }

  private async getTotalMatches(filters: ScreeningAnalysisFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select('SUM(screening_analysis.total_matches)', 'total_matches');
    
    const result = await queryBuilder.getRawOne();
    return parseInt(result.total_matches) || 0;
  }

  private async getHighRiskMatches(filters: ScreeningAnalysisFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select('SUM(screening_analysis.high_risk_matches)', 'high_risk_matches');
    
    const result = await queryBuilder.getRawOne();
    return parseInt(result.high_risk_matches) || 0;
  }

  private async getAverageConfidenceScore(filters: ScreeningAnalysisFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select('AVG(screening_analysis.confidence_score)', 'avg_confidence');
    queryBuilder.andWhere('screening_analysis.confidence_score IS NOT NULL');
    
    const result = await queryBuilder.getRawOne();
    return parseFloat(result.avg_confidence) || 0;
  }

  private async getAverageMatchScore(filters: ScreeningAnalysisFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select('AVG(screening_analysis.match_score)', 'avg_match_score');
    queryBuilder.andWhere('screening_analysis.match_score IS NOT NULL');
    
    const result = await queryBuilder.getRawOne();
    return parseFloat(result.avg_match_score) || 0;
  }

  private async getAverageProcessingTime(filters: ScreeningAnalysisFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select('AVG(screening_analysis.processing_time_seconds)', 'avg_processing_time');
    queryBuilder.andWhere('screening_analysis.processing_time_seconds IS NOT NULL');
    
    const result = await queryBuilder.getRawOne();
    return parseFloat(result.avg_processing_time) || 0;
  }

  private async getTotalCost(filters: ScreeningAnalysisFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select('SUM(screening_analysis.screening_cost)', 'total_cost');
    queryBuilder.andWhere('screening_analysis.screening_cost IS NOT NULL');
    
    const result = await queryBuilder.getRawOne();
    return parseFloat(result.total_cost) || 0;
  }
}