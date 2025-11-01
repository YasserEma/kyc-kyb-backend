import { Repository, SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { RiskAnalysisEntity } from '../entities/risk-analysis.entity';
import { BaseFilter, PaginationOptions, PaginationResult } from '../../common/interfaces';
import { QueryHelper } from '../../../utils/database/query.helper';

export interface RiskAnalysisFilter extends BaseFilter {
  entity_id?: string;
  subscriber_id?: string;
  risk_type?: string | string[];
  risk_category?: string;
  risk_subcategory?: string;
  analysis_status?: string | string[];
  risk_level?: string | string[];
  requires_review?: boolean;
  is_escalated?: boolean;
  is_approved?: boolean;
  is_exception?: boolean;
  is_active?: boolean;
  exceeds_risk_appetite?: boolean;
  exceeds_risk_tolerance?: boolean;
  is_overdue_review?: boolean;
  is_stale?: boolean;
  initiated_by?: string;
  reviewed_by?: string;
  approved_by?: string;
  escalated_to?: string;
  review_decision?: string | string[];
  risk_methodology?: string;
  analysis_model?: string;
  jurisdiction?: string;
  regulatory_framework?: string;
  min_risk_score?: number;
  max_risk_score?: number;
  min_inherent_risk_score?: number;
  max_inherent_risk_score?: number;
  min_residual_risk_score?: number;
  max_residual_risk_score?: number;
  min_confidence_level?: number;
  max_confidence_level?: number;
  min_control_effectiveness?: number;
  max_control_effectiveness?: number;
  analysis_date_from?: Date;
  analysis_date_to?: Date;
  completed_date_from?: Date;
  completed_date_to?: Date;
  review_date_from?: Date;
  review_date_to?: Date;
  next_review_date_from?: Date;
  next_review_date_to?: Date;
  data_as_of_date_from?: Date;
  data_as_of_date_to?: Date;
  tags?: string | string[];
  data_sources?: string | string[];
}

@Injectable()
export class RiskAnalysisRepository extends BaseRepository<RiskAnalysisEntity> {
  constructor(
    @InjectRepository(RiskAnalysisEntity)
    private readonly repository: Repository<RiskAnalysisEntity>,
  ) {
    super(repository);
  }

  async findWithFilters(
    filters: RiskAnalysisFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskAnalysisEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findByEntityId(
    entityId: string,
    filters: Omit<RiskAnalysisFilter, 'entity_id'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskAnalysisEntity>> {
    return this.findWithFilters({ ...filters, entity_id: entityId }, pagination);
  }

  async findBySubscriberId(
    subscriberId: string,
    filters: Omit<RiskAnalysisFilter, 'subscriber_id'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskAnalysisEntity>> {
    return this.findWithFilters({ ...filters, subscriber_id: subscriberId }, pagination);
  }

  async findByRiskType(
    riskType: string | string[],
    filters: Omit<RiskAnalysisFilter, 'risk_type'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskAnalysisEntity>> {
    return this.findWithFilters({ ...filters, risk_type: riskType }, pagination);
  }

  async findByRiskLevel(
    riskLevel: string | string[],
    filters: Omit<RiskAnalysisFilter, 'risk_level'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskAnalysisEntity>> {
    return this.findWithFilters({ ...filters, risk_level: riskLevel }, pagination);
  }

  async findHighRiskAnalyses(
    filters: RiskAnalysisFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskAnalysisEntity>> {
    return this.findWithFilters({ ...filters, risk_level: ['high', 'critical'] }, pagination);
  }

  async findPendingReview(
    filters: RiskAnalysisFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskAnalysisEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('(risk_analysis.requires_review = :requiresReview OR risk_analysis.risk_level IN (:...highRiskLevels) OR risk_analysis.exceeds_risk_appetite = :exceedsAppetite OR risk_analysis.exceeds_risk_tolerance = :exceedsTolerance)', {
      requiresReview: true,
      highRiskLevels: ['high', 'critical'],
      exceedsAppetite: true,
      exceedsTolerance: true,
    });
    queryBuilder.andWhere('risk_analysis.reviewed_by IS NULL');
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findOverdueReviews(
    filters: RiskAnalysisFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskAnalysisEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('risk_analysis.next_review_date < :currentDate', { currentDate: new Date() });
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findEscalatedAnalyses(
    filters: Omit<RiskAnalysisFilter, 'is_escalated'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskAnalysisEntity>> {
    return this.findWithFilters({ ...filters, is_escalated: true }, pagination);
  }

  async findUnapprovedHighRisk(
    filters: RiskAnalysisFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskAnalysisEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('risk_analysis.risk_level IN (:...highRiskLevels)', { highRiskLevels: ['high', 'critical'] });
    queryBuilder.andWhere('risk_analysis.is_approved = :isApproved', { isApproved: false });
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findExceedingRiskAppetite(
    filters: Omit<RiskAnalysisFilter, 'exceeds_risk_appetite'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskAnalysisEntity>> {
    return this.findWithFilters({ ...filters, exceeds_risk_appetite: true }, pagination);
  }

  async findExceedingRiskTolerance(
    filters: Omit<RiskAnalysisFilter, 'exceeds_risk_tolerance'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskAnalysisEntity>> {
    return this.findWithFilters({ ...filters, exceeds_risk_tolerance: true }, pagination);
  }

  async findStaleAnalyses(
    maxAgeDays: number = 90,
    filters: RiskAnalysisFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskAnalysisEntity>> {
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - maxAgeDays);

    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('risk_analysis.completed_date < :staleDate', { staleDate });
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findFailedAnalyses(
    filters: RiskAnalysisFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskAnalysisEntity>> {
    return this.findWithFilters({ ...filters, analysis_status: 'failed' }, pagination);
  }

  async findExceptions(
    filters: Omit<RiskAnalysisFilter, 'is_exception'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskAnalysisEntity>> {
    return this.findWithFilters({ ...filters, is_exception: true }, pagination);
  }

  async findByMethodology(
    methodology: string,
    filters: Omit<RiskAnalysisFilter, 'risk_methodology'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskAnalysisEntity>> {
    return this.findWithFilters({ ...filters, risk_methodology: methodology }, pagination);
  }

  async findByModel(
    model: string,
    filters: Omit<RiskAnalysisFilter, 'analysis_model'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskAnalysisEntity>> {
    return this.findWithFilters({ ...filters, analysis_model: model }, pagination);
  }

  async findRecentAnalyses(
    daysBack: number = 7,
    filters: RiskAnalysisFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskAnalysisEntity>> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - daysBack);

    return this.findWithFilters({ 
      ...filters, 
      analysis_date_from: fromDate 
    }, pagination);
  }

  async findByJurisdiction(
    jurisdiction: string,
    filters: Omit<RiskAnalysisFilter, 'jurisdiction'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskAnalysisEntity>> {
    return this.findWithFilters({ ...filters, jurisdiction }, pagination);
  }

  async updateAnalysisStatus(
    id: string,
    status: string,
    updatedBy?: string,
  ): Promise<void> {
    const updateData: any = { 
      analysis_status: status, 
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

  async updateRiskScores(
    id: string,
    riskScore?: number,
    inherentRiskScore?: number,
    residualRiskScore?: number,
    controlEffectivenessScore?: number,
    probabilityScore?: number,
    impactScore?: number,
    confidenceLevel?: number,
  ): Promise<void> {
    const updateData: any = {
      updated_at: new Date(),
      last_updated_date: new Date(),
    };
    
    if (riskScore !== undefined) updateData.risk_score = riskScore;
    if (inherentRiskScore !== undefined) updateData.inherent_risk_score = inherentRiskScore;
    if (residualRiskScore !== undefined) updateData.residual_risk_score = residualRiskScore;
    if (controlEffectivenessScore !== undefined) updateData.control_effectiveness_score = controlEffectivenessScore;
    if (probabilityScore !== undefined) updateData.probability_score = probabilityScore;
    if (impactScore !== undefined) updateData.impact_score = impactScore;
    if (confidenceLevel !== undefined) updateData.confidence_level = confidenceLevel;
    
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

  async markAsApproved(
    id: string,
    approvedBy: string,
    approvalNotes?: string,
  ): Promise<void> {
    const updateData: any = {
      is_approved: true,
      approved_by: approvedBy,
      approval_date: new Date(),
      updated_at: new Date(),
      last_updated_date: new Date(),
    };
    
    if (approvalNotes) updateData.approval_notes = approvalNotes;
    
    await this.repository.update(id, updateData);
  }

  async markAsException(
    id: string,
    approvedBy: string,
    approvalNotes?: string,
  ): Promise<void> {
    const updateData: any = {
      is_exception: true,
      is_approved: true,
      approved_by: approvedBy,
      approval_date: new Date(),
      review_decision: 'exception_granted',
      updated_at: new Date(),
      last_updated_date: new Date(),
    };
    
    if (approvalNotes) updateData.approval_notes = approvalNotes;
    
    await this.repository.update(id, updateData);
  }

  async escalateAnalysis(
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

  async updateRiskAppetiteFlags(
    id: string,
    exceedsRiskAppetite: boolean,
    exceedsRiskTolerance: boolean,
    riskToleranceThreshold?: number,
  ): Promise<void> {
    const updateData: any = {
      exceeds_risk_appetite: exceedsRiskAppetite,
      exceeds_risk_tolerance: exceedsRiskTolerance,
      updated_at: new Date(),
      last_updated_date: new Date(),
    };
    
    if (riskToleranceThreshold !== undefined) updateData.risk_tolerance_threshold = riskToleranceThreshold;
    
    await this.repository.update(id, updateData);
  }

  async updateAnalysisResults(
    id: string,
    analysisResults: Record<string, any>,
    modelInputs?: Record<string, any>,
    modelOutputs?: Record<string, any>,
  ): Promise<void> {
    const updateData: any = {
      analysis_results: analysisResults,
      updated_at: new Date(),
      last_updated_date: new Date(),
    };
    
    if (modelInputs) updateData.model_inputs = modelInputs;
    if (modelOutputs) updateData.model_outputs = modelOutputs;
    
    await this.repository.update(id, updateData);
  }

  async updateRiskFactors(
    id: string,
    riskFactors: Record<string, any>,
    mitigatingControls?: Record<string, any>,
    riskIndicators?: Record<string, any>,
  ): Promise<void> {
    const updateData: any = {
      risk_factors: riskFactors,
      updated_at: new Date(),
      last_updated_date: new Date(),
    };
    
    if (mitigatingControls) updateData.mitigating_controls = mitigatingControls;
    if (riskIndicators) updateData.risk_indicators = riskIndicators;
    
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
    });
  }

  async incrementRetryCount(id: string): Promise<void> {
    await this.repository.update(id, {
      retry_count: () => 'retry_count + 1',
      last_retry_date: new Date(),
      updated_at: new Date(),
      last_updated_date: new Date(),
    });
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

  async updateRecommendationsAndActions(
    id: string,
    recommendations?: string,
    actionItems?: string,
  ): Promise<void> {
    const updateData: any = {
      updated_at: new Date(),
      last_updated_date: new Date(),
    };
    
    if (recommendations) updateData.recommendations = recommendations;
    if (actionItems) updateData.action_items = actionItems;
    
    await this.repository.update(id, updateData);
  }

  async getRiskAnalysisStatistics(filters: RiskAnalysisFilter = {}): Promise<{
    total: number;
    by_type: Record<string, number>;
    by_status: Record<string, number>;
    by_risk_level: Record<string, number>;
    by_methodology: Record<string, number>;
    by_model: Record<string, number>;
    pending_review_count: number;
    escalated_count: number;
    unapproved_high_risk_count: number;
    exceeding_appetite_count: number;
    exceeding_tolerance_count: number;
    overdue_review_count: number;
    stale_count: number;
    failed_count: number;
    exception_count: number;
    average_risk_score: number;
    average_inherent_risk_score: number;
    average_residual_risk_score: number;
    average_control_effectiveness: number;
    average_confidence_level: number;
    average_processing_time: number;
    risk_distribution: Record<string, number>;
  }> {
    const queryBuilder = this.createFilteredQuery(filters);
    
    const [
      total,
      byType,
      byStatus,
      byRiskLevel,
      byMethodology,
      byModel,
      pendingReviewCount,
      escalatedCount,
      unapprovedHighRiskCount,
      exceedingAppetiteCount,
      exceedingToleranceCount,
      overdueReviewCount,
      staleCount,
      failedCount,
      exceptionCount,
      avgRiskScore,
      avgInherentRiskScore,
      avgResidualRiskScore,
      avgControlEffectiveness,
      avgConfidenceLevel,
      avgProcessingTime,
      riskDistribution,
    ] = await Promise.all([
      queryBuilder.getCount(),
      this.getCountByField('risk_type', filters),
      this.getCountByField('analysis_status', filters),
      this.getCountByField('risk_level', filters),
      this.getCountByField('risk_methodology', filters),
      this.getCountByField('analysis_model', filters),
      this.getPendingReviewCount(filters),
      this.getCountWithCondition({ ...filters, is_escalated: true }),
      this.getUnapprovedHighRiskCount(filters),
      this.getCountWithCondition({ ...filters, exceeds_risk_appetite: true }),
      this.getCountWithCondition({ ...filters, exceeds_risk_tolerance: true }),
      this.getOverdueReviewCount(filters),
      this.getStaleCount(90, filters),
      this.getCountWithCondition({ ...filters, analysis_status: 'failed' }),
      this.getCountWithCondition({ ...filters, is_exception: true }),
      this.getAverageRiskScore(filters),
      this.getAverageInherentRiskScore(filters),
      this.getAverageResidualRiskScore(filters),
      this.getAverageControlEffectiveness(filters),
      this.getAverageConfidenceLevel(filters),
      this.getAverageProcessingTime(filters),
      this.getRiskDistribution(filters),
    ]);

    return {
      total,
      by_type: byType,
      by_status: byStatus,
      by_risk_level: byRiskLevel,
      by_methodology: byMethodology,
      by_model: byModel,
      pending_review_count: pendingReviewCount,
      escalated_count: escalatedCount,
      unapproved_high_risk_count: unapprovedHighRiskCount,
      exceeding_appetite_count: exceedingAppetiteCount,
      exceeding_tolerance_count: exceedingToleranceCount,
      overdue_review_count: overdueReviewCount,
      stale_count: staleCount,
      failed_count: failedCount,
      exception_count: exceptionCount,
      average_risk_score: avgRiskScore,
      average_inherent_risk_score: avgInherentRiskScore,
      average_residual_risk_score: avgResidualRiskScore,
      average_control_effectiveness: avgControlEffectiveness,
      average_confidence_level: avgConfidenceLevel,
      average_processing_time: avgProcessingTime,
      risk_distribution: riskDistribution,
    };
  }

  private createFilteredQuery(filters: RiskAnalysisFilter): SelectQueryBuilder<RiskAnalysisEntity> {
    const queryBuilder = this.repository.createQueryBuilder('risk_analysis');

    // Apply base filters
    QueryHelper.applyBaseFilters(queryBuilder, filters, 'risk_analysis');

    // Apply specific filters
    if (filters.entity_id) {
      queryBuilder.andWhere('risk_analysis.entity_id = :entityId', { entityId: filters.entity_id });
    }

    if (filters.subscriber_id) {
      queryBuilder.andWhere('risk_analysis.subscriber_id = :subscriberId', { subscriberId: filters.subscriber_id });
    }

    if (filters.risk_type) {
      QueryHelper.applyInFilter(queryBuilder, 'risk_analysis.risk_type', filters.risk_type);
    }

    if (filters.risk_category) {
      queryBuilder.andWhere('risk_analysis.risk_category = :riskCategory', { riskCategory: filters.risk_category });
    }

    if (filters.risk_subcategory) {
      queryBuilder.andWhere('risk_analysis.risk_subcategory = :riskSubcategory', { riskSubcategory: filters.risk_subcategory });
    }

    if (filters.analysis_status) {
      QueryHelper.applyInFilter(queryBuilder, 'risk_analysis.analysis_status', filters.analysis_status);
    }

    if (filters.risk_level) {
      QueryHelper.applyInFilter(queryBuilder, 'risk_analysis.risk_level', filters.risk_level);
    }

    if (filters.requires_review !== undefined) {
      queryBuilder.andWhere('risk_analysis.requires_review = :requiresReview', { requiresReview: filters.requires_review });
    }

    if (filters.is_escalated !== undefined) {
      queryBuilder.andWhere('risk_analysis.is_escalated = :isEscalated', { isEscalated: filters.is_escalated });
    }

    if (filters.is_approved !== undefined) {
      queryBuilder.andWhere('risk_analysis.is_approved = :isApproved', { isApproved: filters.is_approved });
    }

    if (filters.is_exception !== undefined) {
      queryBuilder.andWhere('risk_analysis.is_exception = :isException', { isException: filters.is_exception });
    }

    if (filters.is_active !== undefined) {
      queryBuilder.andWhere('risk_analysis.is_active = :isActive', { isActive: filters.is_active });
    }

    if (filters.exceeds_risk_appetite !== undefined) {
      queryBuilder.andWhere('risk_analysis.exceeds_risk_appetite = :exceedsRiskAppetite', { exceedsRiskAppetite: filters.exceeds_risk_appetite });
    }

    if (filters.exceeds_risk_tolerance !== undefined) {
      queryBuilder.andWhere('risk_analysis.exceeds_risk_tolerance = :exceedsRiskTolerance', { exceedsRiskTolerance: filters.exceeds_risk_tolerance });
    }

    if (filters.is_overdue_review !== undefined) {
      if (filters.is_overdue_review) {
        queryBuilder.andWhere('risk_analysis.next_review_date < :currentDate', { currentDate: new Date() });
      } else {
        queryBuilder.andWhere('(risk_analysis.next_review_date IS NULL OR risk_analysis.next_review_date >= :currentDate)', { currentDate: new Date() });
      }
    }

    if (filters.is_stale !== undefined) {
      const staleDate = new Date();
      staleDate.setDate(staleDate.getDate() - 90);
      
      if (filters.is_stale) {
        queryBuilder.andWhere('risk_analysis.completed_date < :staleDate', { staleDate });
      } else {
        queryBuilder.andWhere('(risk_analysis.completed_date IS NULL OR risk_analysis.completed_date >= :staleDate)', { staleDate });
      }
    }

    if (filters.initiated_by) {
      queryBuilder.andWhere('risk_analysis.initiated_by = :initiatedBy', { initiatedBy: filters.initiated_by });
    }

    if (filters.reviewed_by) {
      queryBuilder.andWhere('risk_analysis.reviewed_by = :reviewedBy', { reviewedBy: filters.reviewed_by });
    }

    if (filters.approved_by) {
      queryBuilder.andWhere('risk_analysis.approved_by = :approvedBy', { approvedBy: filters.approved_by });
    }

    if (filters.escalated_to) {
      queryBuilder.andWhere('risk_analysis.escalated_to = :escalatedTo', { escalatedTo: filters.escalated_to });
    }

    if (filters.review_decision) {
      QueryHelper.applyInFilter(queryBuilder, 'risk_analysis.review_decision', filters.review_decision);
    }

    if (filters.risk_methodology) {
      queryBuilder.andWhere('risk_analysis.risk_methodology = :riskMethodology', { riskMethodology: filters.risk_methodology });
    }

    if (filters.analysis_model) {
      queryBuilder.andWhere('risk_analysis.analysis_model = :analysisModel', { analysisModel: filters.analysis_model });
    }

    if (filters.jurisdiction) {
      queryBuilder.andWhere('risk_analysis.jurisdiction = :jurisdiction', { jurisdiction: filters.jurisdiction });
    }

    if (filters.regulatory_framework) {
      queryBuilder.andWhere('risk_analysis.regulatory_framework = :regulatoryFramework', { regulatoryFramework: filters.regulatory_framework });
    }

    // Score filters
    if (filters.min_risk_score !== undefined) {
      queryBuilder.andWhere('risk_analysis.risk_score >= :minRiskScore', { minRiskScore: filters.min_risk_score });
    }

    if (filters.max_risk_score !== undefined) {
      queryBuilder.andWhere('risk_analysis.risk_score <= :maxRiskScore', { maxRiskScore: filters.max_risk_score });
    }

    if (filters.min_inherent_risk_score !== undefined) {
      queryBuilder.andWhere('risk_analysis.inherent_risk_score >= :minInherentRiskScore', { minInherentRiskScore: filters.min_inherent_risk_score });
    }

    if (filters.max_inherent_risk_score !== undefined) {
      queryBuilder.andWhere('risk_analysis.inherent_risk_score <= :maxInherentRiskScore', { maxInherentRiskScore: filters.max_inherent_risk_score });
    }

    if (filters.min_residual_risk_score !== undefined) {
      queryBuilder.andWhere('risk_analysis.residual_risk_score >= :minResidualRiskScore', { minResidualRiskScore: filters.min_residual_risk_score });
    }

    if (filters.max_residual_risk_score !== undefined) {
      queryBuilder.andWhere('risk_analysis.residual_risk_score <= :maxResidualRiskScore', { maxResidualRiskScore: filters.max_residual_risk_score });
    }

    if (filters.min_confidence_level !== undefined) {
      queryBuilder.andWhere('risk_analysis.confidence_level >= :minConfidenceLevel', { minConfidenceLevel: filters.min_confidence_level });
    }

    if (filters.max_confidence_level !== undefined) {
      queryBuilder.andWhere('risk_analysis.confidence_level <= :maxConfidenceLevel', { maxConfidenceLevel: filters.max_confidence_level });
    }

    if (filters.min_control_effectiveness !== undefined) {
      queryBuilder.andWhere('risk_analysis.control_effectiveness_score >= :minControlEffectiveness', { minControlEffectiveness: filters.min_control_effectiveness });
    }

    if (filters.max_control_effectiveness !== undefined) {
      queryBuilder.andWhere('risk_analysis.control_effectiveness_score <= :maxControlEffectiveness', { maxControlEffectiveness: filters.max_control_effectiveness });
    }

    // Date range filters
    if (filters.analysis_date_from) {
      queryBuilder.andWhere('risk_analysis.analysis_date >= :analysisDateFrom', { analysisDateFrom: filters.analysis_date_from });
    }

    if (filters.analysis_date_to) {
      queryBuilder.andWhere('risk_analysis.analysis_date <= :analysisDateTo', { analysisDateTo: filters.analysis_date_to });
    }

    if (filters.completed_date_from) {
      queryBuilder.andWhere('risk_analysis.completed_date >= :completedDateFrom', { completedDateFrom: filters.completed_date_from });
    }

    if (filters.completed_date_to) {
      queryBuilder.andWhere('risk_analysis.completed_date <= :completedDateTo', { completedDateTo: filters.completed_date_to });
    }

    if (filters.review_date_from) {
      queryBuilder.andWhere('risk_analysis.review_date >= :reviewDateFrom', { reviewDateFrom: filters.review_date_from });
    }

    if (filters.review_date_to) {
      queryBuilder.andWhere('risk_analysis.review_date <= :reviewDateTo', { reviewDateTo: filters.review_date_to });
    }

    if (filters.next_review_date_from) {
      queryBuilder.andWhere('risk_analysis.next_review_date >= :nextReviewDateFrom', { nextReviewDateFrom: filters.next_review_date_from });
    }

    if (filters.next_review_date_to) {
      queryBuilder.andWhere('risk_analysis.next_review_date <= :nextReviewDateTo', { nextReviewDateTo: filters.next_review_date_to });
    }

    if (filters.data_as_of_date_from) {
      queryBuilder.andWhere('risk_analysis.data_as_of_date >= :dataAsOfDateFrom', { dataAsOfDateFrom: filters.data_as_of_date_from });
    }

    if (filters.data_as_of_date_to) {
      queryBuilder.andWhere('risk_analysis.data_as_of_date <= :dataAsOfDateTo', { dataAsOfDateTo: filters.data_as_of_date_to });
    }

    // Text search filters
    if (filters.tags) {
      const tags = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
      const tagConditions = tags.map((_, index) => `risk_analysis.tags ILIKE :tag${index}`).join(' OR ');
      const tagParams = tags.reduce((params, tag, index) => {
        params[`tag${index}`] = `%${tag}%`;
        return params;
      }, {});
      
      queryBuilder.andWhere(`(${tagConditions})`, tagParams);
    }

    if (filters.data_sources) {
      const sources = Array.isArray(filters.data_sources) ? filters.data_sources : [filters.data_sources];
      const sourceConditions = sources.map((_, index) => `risk_analysis.data_sources ILIKE :source${index}`).join(' OR ');
      const sourceParams = sources.reduce((params, source, index) => {
        params[`source${index}`] = `%${source}%`;
        return params;
      }, {});
      
      queryBuilder.andWhere(`(${sourceConditions})`, sourceParams);
    }

    return queryBuilder;
  }

  private async getCountByField(field: string, filters: RiskAnalysisFilter): Promise<Record<string, number>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select(`risk_analysis.${field}`, 'field_value');
    queryBuilder.addSelect('COUNT(*)', 'count');
    queryBuilder.groupBy(`risk_analysis.${field}`);

    const results = await queryBuilder.getRawMany();
    return results.reduce((acc, result) => {
      acc[result.field_value] = parseInt(result.count);
      return acc;
    }, {});
  }

  private async getCountWithCondition(filters: RiskAnalysisFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    return queryBuilder.getCount();
  }

  private async getPendingReviewCount(filters: RiskAnalysisFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('(risk_analysis.requires_review = :requiresReview OR risk_analysis.risk_level IN (:...highRiskLevels) OR risk_analysis.exceeds_risk_appetite = :exceedsAppetite OR risk_analysis.exceeds_risk_tolerance = :exceedsTolerance)', {
      requiresReview: true,
      highRiskLevels: ['high', 'critical'],
      exceedsAppetite: true,
      exceedsTolerance: true,
    });
    queryBuilder.andWhere('risk_analysis.reviewed_by IS NULL');
    return queryBuilder.getCount();
  }

  private async getUnapprovedHighRiskCount(filters: RiskAnalysisFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('risk_analysis.risk_level IN (:...highRiskLevels)', { highRiskLevels: ['high', 'critical'] });
    queryBuilder.andWhere('risk_analysis.is_approved = :isApproved', { isApproved: false });
    return queryBuilder.getCount();
  }

  private async getOverdueReviewCount(filters: RiskAnalysisFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('risk_analysis.next_review_date < :currentDate', { currentDate: new Date() });
    return queryBuilder.getCount();
  }

  private async getStaleCount(maxAgeDays: number, filters: RiskAnalysisFilter): Promise<number> {
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - maxAgeDays);

    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('risk_analysis.completed_date < :staleDate', { staleDate });
    return queryBuilder.getCount();
  }

  private async getAverageRiskScore(filters: RiskAnalysisFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select('AVG(risk_analysis.risk_score)', 'avg_risk_score');
    queryBuilder.andWhere('risk_analysis.risk_score IS NOT NULL');
    
    const result = await queryBuilder.getRawOne();
    return parseFloat(result.avg_risk_score) || 0;
  }

  private async getAverageInherentRiskScore(filters: RiskAnalysisFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select('AVG(risk_analysis.inherent_risk_score)', 'avg_inherent_risk_score');
    queryBuilder.andWhere('risk_analysis.inherent_risk_score IS NOT NULL');
    
    const result = await queryBuilder.getRawOne();
    return parseFloat(result.avg_inherent_risk_score) || 0;
  }

  private async getAverageResidualRiskScore(filters: RiskAnalysisFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select('AVG(risk_analysis.residual_risk_score)', 'avg_residual_risk_score');
    queryBuilder.andWhere('risk_analysis.residual_risk_score IS NOT NULL');
    
    const result = await queryBuilder.getRawOne();
    return parseFloat(result.avg_residual_risk_score) || 0;
  }

  private async getAverageControlEffectiveness(filters: RiskAnalysisFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select('AVG(risk_analysis.control_effectiveness_score)', 'avg_control_effectiveness');
    queryBuilder.andWhere('risk_analysis.control_effectiveness_score IS NOT NULL');
    
    const result = await queryBuilder.getRawOne();
    return parseFloat(result.avg_control_effectiveness) || 0;
  }

  private async getAverageConfidenceLevel(filters: RiskAnalysisFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select('AVG(risk_analysis.confidence_level)', 'avg_confidence_level');
    queryBuilder.andWhere('risk_analysis.confidence_level IS NOT NULL');
    
    const result = await queryBuilder.getRawOne();
    return parseFloat(result.avg_confidence_level) || 0;
  }

  private async getAverageProcessingTime(filters: RiskAnalysisFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select('AVG(risk_analysis.processing_time_seconds)', 'avg_processing_time');
    queryBuilder.andWhere('risk_analysis.processing_time_seconds IS NOT NULL');
    
    const result = await queryBuilder.getRawOne();
    return parseFloat(result.avg_processing_time) || 0;
  }

  private async getRiskDistribution(filters: RiskAnalysisFilter): Promise<Record<string, number>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select('CASE WHEN risk_analysis.risk_score < 25 THEN \'low\' WHEN risk_analysis.risk_score < 50 THEN \'medium\' WHEN risk_analysis.risk_score < 75 THEN \'high\' ELSE \'critical\' END', 'risk_bucket');
    queryBuilder.addSelect('COUNT(*)', 'count');
    queryBuilder.andWhere('risk_analysis.risk_score IS NOT NULL');
    queryBuilder.groupBy('risk_bucket');

    const results = await queryBuilder.getRawMany();
    return results.reduce((acc, result) => {
      acc[result.risk_bucket] = parseInt(result.count);
      return acc;
    }, {});
  }
}