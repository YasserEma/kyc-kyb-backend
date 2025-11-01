import { Repository, SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { RiskConfigurationEntity } from '../entities/risk-configuration.entity';
import { BaseFilter, PaginationOptions, PaginationResult } from '../../common/interfaces';
import { QueryHelper } from '../../../utils/database/query.helper';

export interface RiskConfigurationFilter extends BaseFilter {
  subscriber_id?: string;
  config_key?: string;
  config_category?: string | string[];
  config_subcategory?: string;
  config_name?: string;
  config_type?: string | string[];
  risk_type?: string | string[];
  risk_level?: string | string[];
  risk_category?: string;
  risk_subcategory?: string;
  model_type?: string | string[];
  calculation_method?: string | string[];
  status?: string | string[];
  priority?: string | string[];
  is_active?: boolean;
  is_system_config?: boolean;
  is_readonly?: boolean;
  is_encrypted?: boolean;
  is_sensitive?: boolean;
  requires_approval?: boolean;
  requires_restart?: boolean;
  affects_scoring?: boolean;
  affects_thresholds?: boolean;
  affects_models?: boolean;
  affects_reporting?: boolean;
  affects_compliance?: boolean;
  is_approved?: boolean;
  is_expired?: boolean;
  is_effective?: boolean;
  is_future_effective?: boolean;
  is_pending_approval?: boolean;
  is_overdue_review?: boolean;
  is_due_review?: boolean;
  is_expiring_soon?: boolean;
  is_stale?: boolean;
  is_unused?: boolean;
  is_frequently_used?: boolean;
  is_high_impact?: boolean;
  is_high_priority?: boolean;
  is_high_risk?: boolean;
  is_secure?: boolean;
  is_business_critical?: boolean;
  is_compliance_related?: boolean;
  has_validation?: boolean;
  has_dependencies?: boolean;
  has_dependents?: boolean;
  has_custom_value?: boolean;
  is_using_default?: boolean;
  has_null_value?: boolean;
  is_sync_overdue?: boolean;
  is_sync_failed?: boolean;
  validation_type?: string | string[];
  data_source?: string;
  provider?: string;
  provider_version?: string;
  data_feed?: string;
  update_frequency?: string | string[];
  sync_status?: string | string[];
  environment?: string | string[];
  region?: string;
  jurisdiction?: string;
  regulatory_framework?: string;
  compliance_requirement?: string;
  impact_level?: string | string[];
  config_group?: string;
  config_hierarchy?: string;
  ui_component?: string;
  data_classification?: string | string[];
  version?: string;
  created_by?: string;
  updated_by?: string;
  approved_by?: string;
  reviewed_by?: string;
  last_modified_by?: string;
  min_usage_count?: number;
  max_usage_count?: number;
  min_age_days?: number;
  max_age_days?: number;
  min_days_since_use?: number;
  max_days_since_use?: number;
  min_days_since_modified?: number;
  max_days_since_modified?: number;
  effective_date_from?: Date;
  effective_date_to?: Date;
  expiry_date_from?: Date;
  expiry_date_to?: Date;
  approved_date_from?: Date;
  approved_date_to?: Date;
  reviewed_date_from?: Date;
  reviewed_date_to?: Date;
  next_review_date_from?: Date;
  next_review_date_to?: Date;
  last_used_date_from?: Date;
  last_used_date_to?: Date;
  last_modified_date_from?: Date;
  last_modified_date_to?: Date;
  last_sync_date_from?: Date;
  last_sync_date_to?: Date;
  tags?: string | string[];
}

@Injectable()
export class RiskConfigurationRepository extends BaseRepository<RiskConfigurationEntity> {
  constructor(
    @InjectRepository(RiskConfigurationEntity)
    private readonly repository: Repository<RiskConfigurationEntity>,
  ) {
    super(repository);
  }

  async findWithFilters(
    filters: RiskConfigurationFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findBySubscriberId(
    subscriberId: string,
    filters: Omit<RiskConfigurationFilter, 'subscriber_id'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    return this.findWithFilters({ ...filters, subscriber_id: subscriberId }, pagination);
  }

  async findByConfigKey(
    configKey: string,
    subscriberId?: string,
    filters: Omit<RiskConfigurationFilter, 'config_key' | 'subscriber_id'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    const filterParams: RiskConfigurationFilter = { ...filters, config_key: configKey };
    if (subscriberId) filterParams.subscriber_id = subscriberId;
    return this.findWithFilters(filterParams, pagination);
  }

  async findByRiskType(
    riskType: string | string[],
    filters: Omit<RiskConfigurationFilter, 'risk_type'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    return this.findWithFilters({ ...filters, risk_type: riskType }, pagination);
  }

  async findByRiskLevel(
    riskLevel: string | string[],
    filters: Omit<RiskConfigurationFilter, 'risk_level'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    return this.findWithFilters({ ...filters, risk_level: riskLevel }, pagination);
  }

  async findByConfigType(
    configType: string | string[],
    filters: Omit<RiskConfigurationFilter, 'config_type'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    return this.findWithFilters({ ...filters, config_type: configType }, pagination);
  }

  async findByModelType(
    modelType: string | string[],
    filters: Omit<RiskConfigurationFilter, 'model_type'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    return this.findWithFilters({ ...filters, model_type: modelType }, pagination);
  }

  async findByCalculationMethod(
    calculationMethod: string | string[],
    filters: Omit<RiskConfigurationFilter, 'calculation_method'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    return this.findWithFilters({ ...filters, calculation_method: calculationMethod }, pagination);
  }

  async findActiveConfigs(
    filters: Omit<RiskConfigurationFilter, 'is_active' | 'status'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    return this.findWithFilters({ 
      ...filters, 
      is_active: true, 
      status: 'active' 
    }, pagination);
  }

  async findEffectiveConfigs(
    filters: RiskConfigurationFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    const now = new Date();
    
    queryBuilder.andWhere('config.is_active = :isActive', { isActive: true });
    queryBuilder.andWhere('config.status = :status', { status: 'active' });
    queryBuilder.andWhere('(config.effective_date IS NULL OR config.effective_date <= :now)', { now });
    queryBuilder.andWhere('(config.expiry_date IS NULL OR config.expiry_date > :now)', { now });
    
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findSystemConfigs(
    filters: Omit<RiskConfigurationFilter, 'is_system_config'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    return this.findWithFilters({ ...filters, is_system_config: true }, pagination);
  }

  async findCustomConfigs(
    filters: Omit<RiskConfigurationFilter, 'is_system_config'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    return this.findWithFilters({ ...filters, is_system_config: false }, pagination);
  }

  async findSensitiveConfigs(
    filters: Omit<RiskConfigurationFilter, 'is_sensitive'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    return this.findWithFilters({ ...filters, is_sensitive: true }, pagination);
  }

  async findEncryptedConfigs(
    filters: Omit<RiskConfigurationFilter, 'is_encrypted'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    return this.findWithFilters({ ...filters, is_encrypted: true }, pagination);
  }

  async findHighRiskConfigs(
    filters: Omit<RiskConfigurationFilter, 'risk_level'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    return this.findWithFilters({ ...filters, risk_level: ['high', 'critical'] }, pagination);
  }

  async findHighImpactConfigs(
    filters: Omit<RiskConfigurationFilter, 'impact_level'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    return this.findWithFilters({ ...filters, impact_level: ['high', 'critical'] }, pagination);
  }

  async findHighPriorityConfigs(
    filters: Omit<RiskConfigurationFilter, 'priority'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    return this.findWithFilters({ ...filters, priority: ['high', 'critical'] }, pagination);
  }

  async findBusinessCriticalConfigs(
    filters: RiskConfigurationFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('(config.affects_scoring = :affectsScoring OR config.affects_thresholds = :affectsThresholds OR config.affects_models = :affectsModels OR config.affects_compliance = :affectsCompliance)', {
      affectsScoring: true,
      affectsThresholds: true,
      affectsModels: true,
      affectsCompliance: true,
    });
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findComplianceRelatedConfigs(
    filters: RiskConfigurationFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('(config.regulatory_framework IS NOT NULL OR config.compliance_requirement IS NOT NULL OR config.affects_compliance = :affectsCompliance)', {
      affectsCompliance: true,
    });
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findPendingApproval(
    filters: RiskConfigurationFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('config.requires_approval = :requiresApproval', { requiresApproval: true });
    queryBuilder.andWhere('config.approved_by IS NULL');
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findExpiredConfigs(
    filters: RiskConfigurationFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('config.expiry_date < :currentDate', { currentDate: new Date() });
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findExpiringConfigs(
    daysAhead: number = 30,
    filters: RiskConfigurationFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('config.expiry_date BETWEEN :currentDate AND :futureDate', { 
      currentDate: new Date(), 
      futureDate 
    });
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findOverdueForReview(
    filters: RiskConfigurationFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('config.next_review_date < :currentDate', { currentDate: new Date() });
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findDueForReview(
    daysAhead: number = 30,
    filters: RiskConfigurationFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('config.next_review_date BETWEEN :currentDate AND :futureDate', { 
      currentDate: new Date(), 
      futureDate 
    });
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findCustomizedConfigs(
    filters: RiskConfigurationFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('config.config_value IS NOT NULL');
    queryBuilder.andWhere('config.config_value != config.default_value');
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findDefaultConfigs(
    filters: RiskConfigurationFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('(config.config_value IS NULL OR config.config_value = config.default_value)');
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findNullValueConfigs(
    filters: RiskConfigurationFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('config.config_value IS NULL');
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findConfigsWithValidation(
    filters: RiskConfigurationFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('config.validation_rules IS NOT NULL');
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findConfigsWithDependencies(
    filters: RiskConfigurationFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('config.dependencies IS NOT NULL');
    queryBuilder.andWhere('jsonb_array_length(config.dependencies) > 0');
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findConfigsWithDependents(
    filters: RiskConfigurationFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('config.dependent_configs IS NOT NULL');
    queryBuilder.andWhere('jsonb_array_length(config.dependent_configs) > 0');
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findStaleConfigs(
    daysBack: number = 90,
    filters: RiskConfigurationFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - daysBack);

    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('(config.last_used_date IS NULL OR config.last_used_date < :staleDate)', { staleDate });
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findUnusedConfigs(
    filters: Omit<RiskConfigurationFilter, 'min_usage_count' | 'max_usage_count'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    return this.findWithFilters({ 
      ...filters, 
      min_usage_count: 0, 
      max_usage_count: 0 
    }, pagination);
  }

  async findFrequentlyUsedConfigs(
    minUsage: number = 100,
    filters: Omit<RiskConfigurationFilter, 'min_usage_count'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    return this.findWithFilters({ ...filters, min_usage_count: minUsage }, pagination);
  }

  async findSyncOverdueConfigs(
    filters: RiskConfigurationFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    const now = new Date();
    
    queryBuilder.andWhere('config.last_sync_date IS NOT NULL');
    queryBuilder.andWhere('config.update_frequency IS NOT NULL');
    queryBuilder.andWhere(`
      CASE 
        WHEN config.update_frequency = 'real_time' THEN config.last_sync_date < :realTimeThreshold
        WHEN config.update_frequency = 'hourly' THEN config.last_sync_date < :hourlyThreshold
        WHEN config.update_frequency = 'daily' THEN config.last_sync_date < :dailyThreshold
        WHEN config.update_frequency = 'weekly' THEN config.last_sync_date < :weeklyThreshold
        WHEN config.update_frequency = 'monthly' THEN config.last_sync_date < :monthlyThreshold
        ELSE FALSE
      END
    `, {
      realTimeThreshold: new Date(now.getTime() - 60 * 60 * 1000), // 1 hour ago
      hourlyThreshold: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      dailyThreshold: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      weeklyThreshold: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
      monthlyThreshold: new Date(now.getTime() - 32 * 24 * 60 * 60 * 1000), // 32 days ago
    });
    
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findSyncFailedConfigs(
    filters: Omit<RiskConfigurationFilter, 'sync_status'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    return this.findWithFilters({ ...filters, sync_status: 'failed' }, pagination);
  }

  async findByEnvironment(
    environment: string | string[],
    filters: Omit<RiskConfigurationFilter, 'environment'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    return this.findWithFilters({ ...filters, environment }, pagination);
  }

  async findByProvider(
    provider: string,
    filters: Omit<RiskConfigurationFilter, 'provider'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    return this.findWithFilters({ ...filters, provider }, pagination);
  }

  async findByJurisdiction(
    jurisdiction: string,
    filters: Omit<RiskConfigurationFilter, 'jurisdiction'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    return this.findWithFilters({ ...filters, jurisdiction }, pagination);
  }

  async findByRegulatoryFramework(
    framework: string,
    filters: Omit<RiskConfigurationFilter, 'regulatory_framework'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    return this.findWithFilters({ ...filters, regulatory_framework: framework }, pagination);
  }

  async findByConfigGroup(
    configGroup: string,
    filters: Omit<RiskConfigurationFilter, 'config_group'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    return this.findWithFilters({ ...filters, config_group: configGroup }, pagination);
  }

  async findRecentlyCreatedConfigs(
    daysBack: number = 7,
    filters: RiskConfigurationFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - daysBack);

    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('config.created_at >= :fromDate', { fromDate });
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findRecentlyUpdatedConfigs(
    daysBack: number = 7,
    filters: RiskConfigurationFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - daysBack);

    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('config.updated_at >= :fromDate', { fromDate });
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findRecentlyUsedConfigs(
    daysBack: number = 7,
    filters: RiskConfigurationFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<RiskConfigurationEntity>> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - daysBack);

    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('config.last_used_date >= :fromDate', { fromDate });
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async getConfigValue(
    subscriberId: string,
    configKey: string,
  ): Promise<any> {
    const config = await this.repository.findOne({
      where: {
        subscriber_id: subscriberId,
        config_key: configKey,
        is_active: true,
        status: 'active',
      },
    });

    if (!config) return null;

    // Check if config is effective
    const now = new Date();
    if (config.effective_date && config.effective_date > now) return null;
    if (config.expiry_date && config.expiry_date <= now) return null;

    return config.config_value || config.default_value;
  }

  async setConfigValue(
    subscriberId: string,
    configKey: string,
    value: any,
    updatedBy?: string,
  ): Promise<void> {
    const config = await this.repository.findOne({
      where: {
        subscriber_id: subscriberId,
        config_key: configKey,
      },
    });

    if (!config) {
      throw new Error(`Risk configuration key '${configKey}' not found for subscriber`);
    }

    if (config.is_readonly) {
      throw new Error(`Risk configuration key '${configKey}' is read-only`);
    }

    const updateData: any = {
      config_value: value,
      updated_at: new Date(),
      last_modified_date: new Date(),
    };

    if (updatedBy) {
      updateData.updated_by = updatedBy;
      updateData.last_modified_by = updatedBy;
    }

    await this.repository.update(config.id, updateData);
  }

  async updateConfigStatus(
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

  async updatePriority(
    id: string,
    priority: string,
    updatedBy?: string,
  ): Promise<void> {
    const updateData: any = {
      priority,
      updated_at: new Date(),
    };
    
    if (updatedBy) updateData.updated_by = updatedBy;
    
    await this.repository.update(id, updateData);
  }

  async updateImpactLevel(
    id: string,
    impactLevel: string,
    updatedBy?: string,
  ): Promise<void> {
    const updateData: any = {
      impact_level: impactLevel,
      updated_at: new Date(),
    };
    
    if (updatedBy) updateData.updated_by = updatedBy;
    
    await this.repository.update(id, updateData);
  }

  async markAsApproved(
    id: string,
    approvedBy: string,
    approvalNotes?: string,
  ): Promise<void> {
    const updateData: any = {
      approved_by: approvedBy,
      approved_date: new Date(),
      updated_at: new Date(),
    };
    
    if (approvalNotes) updateData.approval_notes = approvalNotes;
    
    await this.repository.update(id, updateData);
  }

  async markAsReviewed(
    id: string,
    reviewedBy: string,
    reviewNotes?: string,
    nextReviewDate?: Date,
  ): Promise<void> {
    const updateData: any = {
      reviewed_by: reviewedBy,
      reviewed_date: new Date(),
      updated_at: new Date(),
    };
    
    if (reviewNotes) updateData.review_notes = reviewNotes;
    if (nextReviewDate) updateData.next_review_date = nextReviewDate;
    
    await this.repository.update(id, updateData);
  }

  async updateUsageTracking(
    id: string,
  ): Promise<void> {
    await this.repository.update(id, {
      last_used_date: new Date(),
      usage_count: () => 'usage_count + 1',
      updated_at: new Date(),
    });
  }

  async updateValidationRules(
    id: string,
    validationType: string,
    validationRules: any,
    errorMessage?: string,
  ): Promise<void> {
    const updateData: any = {
      validation_type: validationType,
      validation_rules: validationRules,
      updated_at: new Date(),
    };
    
    if (errorMessage) updateData.validation_error_message = errorMessage;
    
    await this.repository.update(id, updateData);
  }

  async updateConstraints(
    id: string,
    constraints: any,
    businessRules?: any,
  ): Promise<void> {
    const updateData: any = {
      constraints,
      updated_at: new Date(),
    };
    
    if (businessRules) updateData.business_rules = businessRules;
    
    await this.repository.update(id, updateData);
  }

  async updateModelParameters(
    id: string,
    modelParameters: any,
    scoringWeights?: any,
    thresholdValues?: any,
  ): Promise<void> {
    const updateData: any = {
      model_parameters: modelParameters,
      updated_at: new Date(),
    };
    
    if (scoringWeights) updateData.scoring_weights = scoringWeights;
    if (thresholdValues) updateData.threshold_values = thresholdValues;
    
    await this.repository.update(id, updateData);
  }

  async updateRiskFactors(
    id: string,
    riskFactors: any,
    calculationFormula?: any,
  ): Promise<void> {
    const updateData: any = {
      risk_factors: riskFactors,
      updated_at: new Date(),
    };
    
    if (calculationFormula) updateData.calculation_formula = calculationFormula;
    
    await this.repository.update(id, updateData);
  }

  async updateAggregationRules(
    id: string,
    aggregationRules: any,
    normalizationRules?: any,
  ): Promise<void> {
    const updateData: any = {
      aggregation_rules: aggregationRules,
      updated_at: new Date(),
    };
    
    if (normalizationRules) updateData.normalization_rules = normalizationRules;
    
    await this.repository.update(id, updateData);
  }

  async updateDependencies(
    id: string,
    dependencies: string[],
    dependentConfigs?: string[],
    relatedConfigs?: string[],
  ): Promise<void> {
    const updateData: any = {
      dependencies,
      updated_at: new Date(),
    };
    
    if (dependentConfigs) updateData.dependent_configs = dependentConfigs;
    if (relatedConfigs) updateData.related_configs = relatedConfigs;
    
    await this.repository.update(id, updateData);
  }

  async updateSyncStatus(
    id: string,
    syncStatus: string,
    lastSyncDate?: Date,
  ): Promise<void> {
    const updateData: any = {
      sync_status: syncStatus,
      updated_at: new Date(),
    };
    
    if (lastSyncDate) updateData.last_sync_date = lastSyncDate;
    
    await this.repository.update(id, updateData);
  }

  async updatePerformanceMetrics(
    id: string,
    performanceMetrics: any,
    usageStatistics?: any,
  ): Promise<void> {
    const updateData: any = {
      performance_metrics: performanceMetrics,
      updated_at: new Date(),
    };
    
    if (usageStatistics) updateData.usage_statistics = usageStatistics;
    
    await this.repository.update(id, updateData);
  }

  async updateVersionHistory(
    id: string,
    version: string,
    changeDescription: string,
    updatedBy?: string,
  ): Promise<void> {
    const config = await this.repository.findOne({ where: { id } });
    if (!config) return;

    const versionEntry = {
      version,
      changed_at: new Date().toISOString(),
      changed_by: updatedBy,
      description: changeDescription,
      previous_value: config.config_value,
    };

    const changeLogEntry = {
      timestamp: new Date().toISOString(),
      user: updatedBy,
      action: 'version_update',
      description: changeDescription,
      version,
    };

    const versionHistory = config.version_history || [];
    const changeLog = config.change_log || [];

    await this.repository.update(id, {
      version,
      version_history: [...versionHistory, versionEntry],
      change_log: [...changeLog, changeLogEntry],
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

  async updateUIProperties(
    id: string,
    uiComponent: string,
    uiProperties: any,
    displayOrder?: number,
  ): Promise<void> {
    const updateData: any = {
      ui_component: uiComponent,
      ui_properties: uiProperties,
      updated_at: new Date(),
    };
    
    if (displayOrder !== undefined) updateData.display_order = displayOrder;
    
    await this.repository.update(id, updateData);
  }

  async updateBackupConfig(
    id: string,
    backupConfig: any,
    recoveryConfig?: any,
  ): Promise<void> {
    const updateData: any = {
      backup_config: backupConfig,
      last_backup_date: new Date(),
      backup_status: 'completed',
      updated_at: new Date(),
    };
    
    if (recoveryConfig) updateData.recovery_config = recoveryConfig;
    
    await this.repository.update(id, updateData);
  }

  async updateComplianceFlags(
    id: string,
    complianceFlags: any,
    regulatoryNotes?: string,
    riskAssessment?: any,
  ): Promise<void> {
    const updateData: any = {
      compliance_flags: complianceFlags,
      updated_at: new Date(),
    };
    
    if (regulatoryNotes) updateData.regulatory_notes = regulatoryNotes;
    if (riskAssessment) updateData.risk_assessment = riskAssessment;
    
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

  async bulkMarkAsApproved(
    ids: string[],
    approvedBy: string,
  ): Promise<void> {
    await this.repository.update(ids, {
      approved_by: approvedBy,
      approved_date: new Date(),
      updated_at: new Date(),
    });
  }

  async bulkUpdateRiskLevel(
    ids: string[],
    riskLevel: string,
    updatedBy?: string,
  ): Promise<void> {
    const updateData: any = {
      risk_level: riskLevel,
      updated_at: new Date(),
    };
    
    if (updatedBy) updateData.updated_by = updatedBy;
    
    await this.repository.update(ids, updateData);
  }

  async bulkUpdateEnvironment(
    ids: string[],
    environment: string,
    updatedBy?: string,
  ): Promise<void> {
    const updateData: any = {
      environment,
      updated_at: new Date(),
    };
    
    if (updatedBy) updateData.updated_by = updatedBy;
    
    await this.repository.update(ids, updateData);
  }

  async getRiskConfigurationStatistics(filters: RiskConfigurationFilter = {}): Promise<{
    total: number;
    by_risk_type: Record<string, number>;
    by_risk_level: Record<string, number>;
    by_config_type: Record<string, number>;
    by_model_type: Record<string, number>;
    by_calculation_method: Record<string, number>;
    by_status: Record<string, number>;
    by_priority: Record<string, number>;
    by_impact_level: Record<string, number>;
    by_environment: Record<string, number>;
    by_provider: Record<string, number>;
    by_jurisdiction: Record<string, number>;
    by_regulatory_framework: Record<string, number>;
    active_count: number;
    inactive_count: number;
    effective_count: number;
    system_configs_count: number;
    custom_configs_count: number;
    sensitive_configs_count: number;
    encrypted_configs_count: number;
    readonly_configs_count: number;
    pending_approval_count: number;
    expired_count: number;
    expiring_soon_count: number;
    overdue_review_count: number;
    due_review_count: number;
    customized_count: number;
    default_count: number;
    null_value_count: number;
    with_validation_count: number;
    with_dependencies_count: number;
    with_dependents_count: number;
    high_risk_count: number;
    high_impact_count: number;
    high_priority_count: number;
    business_critical_count: number;
    compliance_related_count: number;
    stale_count: number;
    unused_count: number;
    frequently_used_count: number;
    sync_overdue_count: number;
    sync_failed_count: number;
    total_usage_count: number;
    average_usage_count: number;
    average_age_days: number;
    average_risk_score: number;
    average_completeness_score: number;
    average_data_quality_score: number;
  }> {
    const queryBuilder = this.createFilteredQuery(filters);
    
    const [
      total,
      byRiskType,
      byRiskLevel,
      byConfigType,
      byModelType,
      byCalculationMethod,
      byStatus,
      byPriority,
      byImpactLevel,
      byEnvironment,
      byProvider,
      byJurisdiction,
      byRegulatoryFramework,
      activeCount,
      inactiveCount,
      effectiveCount,
      systemConfigsCount,
      customConfigsCount,
      sensitiveConfigsCount,
      encryptedConfigsCount,
      readonlyConfigsCount,
      pendingApprovalCount,
      expiredCount,
      expiringSoonCount,
      overdueReviewCount,
      dueReviewCount,
      customizedCount,
      defaultCount,
      nullValueCount,
      withValidationCount,
      withDependenciesCount,
      withDependentsCount,
      highRiskCount,
      highImpactCount,
      highPriorityCount,
      businessCriticalCount,
      complianceRelatedCount,
      staleCount,
      unusedCount,
      frequentlyUsedCount,
      syncOverdueCount,
      syncFailedCount,
      totalUsageCount,
      avgUsageCount,
      avgAgeDays,
      avgRiskScore,
      avgCompletenessScore,
      avgDataQualityScore,
    ] = await Promise.all([
      queryBuilder.getCount(),
      this.getCountByField('risk_type', filters),
      this.getCountByField('risk_level', filters),
      this.getCountByField('config_type', filters),
      this.getCountByField('model_type', filters),
      this.getCountByField('calculation_method', filters),
      this.getCountByField('status', filters),
      this.getCountByField('priority', filters),
      this.getCountByField('impact_level', filters),
      this.getCountByField('environment', filters),
      this.getCountByField('provider', filters),
      this.getCountByField('jurisdiction', filters),
      this.getCountByField('regulatory_framework', filters),
      this.getCountWithCondition({ ...filters, is_active: true }),
      this.getCountWithCondition({ ...filters, is_active: false }),
      this.getEffectiveCount(filters),
      this.getCountWithCondition({ ...filters, is_system_config: true }),
      this.getCountWithCondition({ ...filters, is_system_config: false }),
      this.getCountWithCondition({ ...filters, is_sensitive: true }),
      this.getCountWithCondition({ ...filters, is_encrypted: true }),
      this.getCountWithCondition({ ...filters, is_readonly: true }),
      this.getPendingApprovalCount(filters),
      this.getExpiredCount(filters),
      this.getExpiringSoonCount(30, filters),
      this.getOverdueReviewCount(filters),
      this.getDueReviewCount(30, filters),
      this.getCustomizedCount(filters),
      this.getDefaultCount(filters),
      this.getNullValueCount(filters),
      this.getWithValidationCount(filters),
      this.getWithDependenciesCount(filters),
      this.getWithDependentsCount(filters),
      this.getCountWithCondition({ ...filters, risk_level: ['high', 'critical'] }),
      this.getCountWithCondition({ ...filters, impact_level: ['high', 'critical'] }),
      this.getCountWithCondition({ ...filters, priority: ['high', 'critical'] }),
      this.getBusinessCriticalCount(filters),
      this.getComplianceRelatedCount(filters),
      this.getStaleCount(90, filters),
      this.getCountWithCondition({ ...filters, min_usage_count: 0, max_usage_count: 0 }),
      this.getCountWithCondition({ ...filters, min_usage_count: 100 }),
      this.getSyncOverdueCount(filters),
      this.getCountWithCondition({ ...filters, sync_status: 'failed' }),
      this.getSumByField('usage_count', filters),
      this.getAverageUsageCount(filters),
      this.getAverageAgeDays(filters),
      this.getAverageRiskScore(filters),
      this.getAverageCompletenessScore(filters),
      this.getAverageDataQualityScore(filters),
    ]);

    return {
      total,
      by_risk_type: byRiskType,
      by_risk_level: byRiskLevel,
      by_config_type: byConfigType,
      by_model_type: byModelType,
      by_calculation_method: byCalculationMethod,
      by_status: byStatus,
      by_priority: byPriority,
      by_impact_level: byImpactLevel,
      by_environment: byEnvironment,
      by_provider: byProvider,
      by_jurisdiction: byJurisdiction,
      by_regulatory_framework: byRegulatoryFramework,
      active_count: activeCount,
      inactive_count: inactiveCount,
      effective_count: effectiveCount,
      system_configs_count: systemConfigsCount,
      custom_configs_count: customConfigsCount,
      sensitive_configs_count: sensitiveConfigsCount,
      encrypted_configs_count: encryptedConfigsCount,
      readonly_configs_count: readonlyConfigsCount,
      pending_approval_count: pendingApprovalCount,
      expired_count: expiredCount,
      expiring_soon_count: expiringSoonCount,
      overdue_review_count: overdueReviewCount,
      due_review_count: dueReviewCount,
      customized_count: customizedCount,
      default_count: defaultCount,
      null_value_count: nullValueCount,
      with_validation_count: withValidationCount,
      with_dependencies_count: withDependenciesCount,
      with_dependents_count: withDependentsCount,
      high_risk_count: highRiskCount,
      high_impact_count: highImpactCount,
      high_priority_count: highPriorityCount,
      business_critical_count: businessCriticalCount,
      compliance_related_count: complianceRelatedCount,
      stale_count: staleCount,
      unused_count: unusedCount,
      frequently_used_count: frequentlyUsedCount,
      sync_overdue_count: syncOverdueCount,
      sync_failed_count: syncFailedCount,
      total_usage_count: totalUsageCount,
      average_usage_count: avgUsageCount,
      average_age_days: avgAgeDays,
      average_risk_score: avgRiskScore,
      average_completeness_score: avgCompletenessScore,
      average_data_quality_score: avgDataQualityScore,
    };
  }

  private createFilteredQuery(filters: RiskConfigurationFilter): SelectQueryBuilder<RiskConfigurationEntity> {
    const queryBuilder = this.repository.createQueryBuilder('config');

    // Apply base filters
    QueryHelper.applyBaseFilters(queryBuilder, filters, 'config');

    // Apply specific filters
    if (filters.subscriber_id) {
      queryBuilder.andWhere('config.subscriber_id = :subscriberId', { subscriberId: filters.subscriber_id });
    }

    if (filters.config_key) {
      queryBuilder.andWhere('config.config_key = :configKey', { configKey: filters.config_key });
    }

    if (filters.config_category) {
      QueryHelper.applyInFilter(queryBuilder, 'config.config_category', filters.config_category);
    }

    if (filters.config_subcategory) {
      queryBuilder.andWhere('config.config_subcategory = :configSubcategory', { configSubcategory: filters.config_subcategory });
    }

    if (filters.config_name) {
      queryBuilder.andWhere('config.config_name ILIKE :configName', { configName: `%${filters.config_name}%` });
    }

    if (filters.config_type) {
      QueryHelper.applyInFilter(queryBuilder, 'config.config_type', filters.config_type);
    }

    if (filters.risk_type) {
      QueryHelper.applyInFilter(queryBuilder, 'config.risk_type', filters.risk_type);
    }

    if (filters.risk_level) {
      QueryHelper.applyInFilter(queryBuilder, 'config.risk_level', filters.risk_level);
    }

    if (filters.risk_category) {
      queryBuilder.andWhere('config.risk_category = :riskCategory', { riskCategory: filters.risk_category });
    }

    if (filters.risk_subcategory) {
      queryBuilder.andWhere('config.risk_subcategory = :riskSubcategory', { riskSubcategory: filters.risk_subcategory });
    }

    if (filters.model_type) {
      QueryHelper.applyInFilter(queryBuilder, 'config.model_type', filters.model_type);
    }

    if (filters.calculation_method) {
      QueryHelper.applyInFilter(queryBuilder, 'config.calculation_method', filters.calculation_method);
    }

    if (filters.status) {
      QueryHelper.applyInFilter(queryBuilder, 'config.status', filters.status);
    }

    if (filters.priority) {
      QueryHelper.applyInFilter(queryBuilder, 'config.priority', filters.priority);
    }

    if (filters.is_active !== undefined) {
      queryBuilder.andWhere('config.is_active = :isActive', { isActive: filters.is_active });
    }

    if (filters.is_system_config !== undefined) {
      queryBuilder.andWhere('config.is_system_config = :isSystemConfig', { isSystemConfig: filters.is_system_config });
    }

    if (filters.is_readonly !== undefined) {
      queryBuilder.andWhere('config.is_readonly = :isReadonly', { isReadonly: filters.is_readonly });
    }

    if (filters.is_encrypted !== undefined) {
      queryBuilder.andWhere('config.is_encrypted = :isEncrypted', { isEncrypted: filters.is_encrypted });
    }

    if (filters.is_sensitive !== undefined) {
      queryBuilder.andWhere('config.is_sensitive = :isSensitive', { isSensitive: filters.is_sensitive });
    }

    if (filters.requires_approval !== undefined) {
      queryBuilder.andWhere('config.requires_approval = :requiresApproval', { requiresApproval: filters.requires_approval });
    }

    if (filters.requires_restart !== undefined) {
      queryBuilder.andWhere('config.requires_restart = :requiresRestart', { requiresRestart: filters.requires_restart });
    }

    if (filters.affects_scoring !== undefined) {
      queryBuilder.andWhere('config.affects_scoring = :affectsScoring', { affectsScoring: filters.affects_scoring });
    }

    if (filters.affects_thresholds !== undefined) {
      queryBuilder.andWhere('config.affects_thresholds = :affectsThresholds', { affectsThresholds: filters.affects_thresholds });
    }

    if (filters.affects_models !== undefined) {
      queryBuilder.andWhere('config.affects_models = :affectsModels', { affectsModels: filters.affects_models });
    }

    if (filters.affects_reporting !== undefined) {
      queryBuilder.andWhere('config.affects_reporting = :affectsReporting', { affectsReporting: filters.affects_reporting });
    }

    if (filters.affects_compliance !== undefined) {
      queryBuilder.andWhere('config.affects_compliance = :affectsCompliance', { affectsCompliance: filters.affects_compliance });
    }

    if (filters.is_approved !== undefined) {
      if (filters.is_approved) {
        queryBuilder.andWhere('config.approved_by IS NOT NULL');
      } else {
        queryBuilder.andWhere('config.approved_by IS NULL');
      }
    }

    if (filters.is_expired !== undefined) {
      if (filters.is_expired) {
        queryBuilder.andWhere('config.expiry_date < :currentDate', { currentDate: new Date() });
      } else {
        queryBuilder.andWhere('(config.expiry_date IS NULL OR config.expiry_date >= :currentDate)', { currentDate: new Date() });
      }
    }

    if (filters.is_effective !== undefined) {
      const now = new Date();
      if (filters.is_effective) {
        queryBuilder.andWhere('config.is_active = :isActive', { isActive: true });
        queryBuilder.andWhere('config.status = :status', { status: 'active' });
        queryBuilder.andWhere('(config.effective_date IS NULL OR config.effective_date <= :now)', { now });
        queryBuilder.andWhere('(config.expiry_date IS NULL OR config.expiry_date > :now)', { now });
      } else {
        queryBuilder.andWhere('(config.is_active = :isActiveFalse OR config.status != :statusActive OR config.effective_date > :now OR config.expiry_date <= :now)', { 
          isActiveFalse: false, 
          statusActive: 'active',
          now 
        });
      }
    }

    if (filters.is_future_effective !== undefined) {
      if (filters.is_future_effective) {
        queryBuilder.andWhere('config.effective_date > :currentDate', { currentDate: new Date() });
      } else {
        queryBuilder.andWhere('(config.effective_date IS NULL OR config.effective_date <= :currentDate)', { currentDate: new Date() });
      }
    }

    if (filters.is_pending_approval !== undefined) {
      if (filters.is_pending_approval) {
        queryBuilder.andWhere('config.requires_approval = :requiresApproval', { requiresApproval: true });
        queryBuilder.andWhere('config.approved_by IS NULL');
      } else {
        queryBuilder.andWhere('(config.requires_approval = :requiresApprovalFalse OR config.approved_by IS NOT NULL)', { 
          requiresApprovalFalse: false 
        });
      }
    }

    if (filters.is_overdue_review !== undefined) {
      if (filters.is_overdue_review) {
        queryBuilder.andWhere('config.next_review_date < :currentDate', { currentDate: new Date() });
      } else {
        queryBuilder.andWhere('(config.next_review_date IS NULL OR config.next_review_date >= :currentDate)', { currentDate: new Date() });
      }
    }

    if (filters.is_due_review !== undefined) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      
      if (filters.is_due_review) {
        queryBuilder.andWhere('config.next_review_date BETWEEN :currentDate AND :futureDate', { 
          currentDate: new Date(), 
          futureDate 
        });
      } else {
        queryBuilder.andWhere('(config.next_review_date IS NULL OR config.next_review_date < :currentDate OR config.next_review_date > :futureDate)', { 
          currentDate: new Date(), 
          futureDate 
        });
      }
    }

    if (filters.is_expiring_soon !== undefined) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      
      if (filters.is_expiring_soon) {
        queryBuilder.andWhere('config.expiry_date BETWEEN :currentDate AND :futureDate', { 
          currentDate: new Date(), 
          futureDate 
        });
      } else {
        queryBuilder.andWhere('(config.expiry_date IS NULL OR config.expiry_date < :currentDate OR config.expiry_date > :futureDate)', { 
          currentDate: new Date(), 
          futureDate 
        });
      }
    }

    if (filters.is_stale !== undefined) {
      const staleDate = new Date();
      staleDate.setDate(staleDate.getDate() - 90);
      
      if (filters.is_stale) {
        queryBuilder.andWhere('(config.last_used_date IS NULL OR config.last_used_date < :staleDate)', { staleDate });
      } else {
        queryBuilder.andWhere('config.last_used_date >= :staleDate', { staleDate });
      }
    }

    if (filters.is_unused !== undefined) {
      if (filters.is_unused) {
        queryBuilder.andWhere('config.usage_count = 0');
      } else {
        queryBuilder.andWhere('config.usage_count > 0');
      }
    }

    if (filters.is_frequently_used !== undefined) {
      if (filters.is_frequently_used) {
        queryBuilder.andWhere('config.usage_count >= 100');
      } else {
        queryBuilder.andWhere('config.usage_count < 100');
      }
    }

    if (filters.is_high_impact !== undefined) {
      if (filters.is_high_impact) {
        queryBuilder.andWhere('config.impact_level IN (:...highImpactLevels)', { highImpactLevels: ['high', 'critical'] });
      } else {
        queryBuilder.andWhere('config.impact_level NOT IN (:...highImpactLevels)', { highImpactLevels: ['high', 'critical'] });
      }
    }

    if (filters.is_high_priority !== undefined) {
      if (filters.is_high_priority) {
        queryBuilder.andWhere('config.priority IN (:...highPriorities)', { highPriorities: ['high', 'critical'] });
      } else {
        queryBuilder.andWhere('config.priority NOT IN (:...highPriorities)', { highPriorities: ['high', 'critical'] });
      }
    }

    if (filters.is_high_risk !== undefined) {
      if (filters.is_high_risk) {
        queryBuilder.andWhere('config.risk_level IN (:...highRiskLevels)', { highRiskLevels: ['high', 'critical'] });
      } else {
        queryBuilder.andWhere('config.risk_level NOT IN (:...highRiskLevels)', { highRiskLevels: ['high', 'critical'] });
      }
    }

    if (filters.is_secure !== undefined) {
      if (filters.is_secure) {
        queryBuilder.andWhere('(config.is_sensitive = :isSensitive OR config.is_encrypted = :isEncrypted)', {
          isSensitive: true,
          isEncrypted: true,
        });
      } else {
        queryBuilder.andWhere('config.is_sensitive = :isSensitiveFalse AND config.is_encrypted = :isEncryptedFalse', {
          isSensitiveFalse: false,
          isEncryptedFalse: false,
        });
      }
    }

    if (filters.is_business_critical !== undefined) {
      if (filters.is_business_critical) {
        queryBuilder.andWhere('(config.affects_scoring = :affectsScoring OR config.affects_thresholds = :affectsThresholds OR config.affects_models = :affectsModels OR config.affects_compliance = :affectsCompliance)', {
          affectsScoring: true,
          affectsThresholds: true,
          affectsModels: true,
          affectsCompliance: true,
        });
      } else {
        queryBuilder.andWhere('config.affects_scoring = :affectsScoringFalse AND config.affects_thresholds = :affectsThresholdsFalse AND config.affects_models = :affectsModelsFalse AND config.affects_compliance = :affectsComplianceFalse', {
          affectsScoringFalse: false,
          affectsThresholdsFalse: false,
          affectsModelsFalse: false,
          affectsComplianceFalse: false,
        });
      }
    }

    if (filters.is_compliance_related !== undefined) {
      if (filters.is_compliance_related) {
        queryBuilder.andWhere('(config.regulatory_framework IS NOT NULL OR config.compliance_requirement IS NOT NULL OR config.affects_compliance = :affectsCompliance)', {
          affectsCompliance: true,
        });
      } else {
        queryBuilder.andWhere('config.regulatory_framework IS NULL AND config.compliance_requirement IS NULL AND config.affects_compliance = :affectsComplianceFalse', {
          affectsComplianceFalse: false,
        });
      }
    }

    if (filters.has_validation !== undefined) {
      if (filters.has_validation) {
        queryBuilder.andWhere('config.validation_rules IS NOT NULL');
      } else {
        queryBuilder.andWhere('config.validation_rules IS NULL');
      }
    }

    if (filters.has_dependencies !== undefined) {
      if (filters.has_dependencies) {
        queryBuilder.andWhere('config.dependencies IS NOT NULL');
        queryBuilder.andWhere('jsonb_array_length(config.dependencies) > 0');
      } else {
        queryBuilder.andWhere('(config.dependencies IS NULL OR jsonb_array_length(config.dependencies) = 0)');
      }
    }

    if (filters.has_dependents !== undefined) {
      if (filters.has_dependents) {
        queryBuilder.andWhere('config.dependent_configs IS NOT NULL');
        queryBuilder.andWhere('jsonb_array_length(config.dependent_configs) > 0');
      } else {
        queryBuilder.andWhere('(config.dependent_configs IS NULL OR jsonb_array_length(config.dependent_configs) = 0)');
      }
    }

    if (filters.has_custom_value !== undefined) {
      if (filters.has_custom_value) {
        queryBuilder.andWhere('config.config_value IS NOT NULL');
        queryBuilder.andWhere('config.config_value != config.default_value');
      } else {
        queryBuilder.andWhere('(config.config_value IS NULL OR config.config_value = config.default_value)');
      }
    }

    if (filters.is_using_default !== undefined) {
      if (filters.is_using_default) {
        queryBuilder.andWhere('(config.config_value IS NULL OR config.config_value = config.default_value)');
      } else {
        queryBuilder.andWhere('config.config_value IS NOT NULL');
        queryBuilder.andWhere('config.config_value != config.default_value');
      }
    }

    if (filters.has_null_value !== undefined) {
      if (filters.has_null_value) {
        queryBuilder.andWhere('config.config_value IS NULL');
      } else {
        queryBuilder.andWhere('config.config_value IS NOT NULL');
      }
    }

    if (filters.is_sync_overdue !== undefined) {
      const now = new Date();
      if (filters.is_sync_overdue) {
        queryBuilder.andWhere('config.last_sync_date IS NOT NULL');
        queryBuilder.andWhere('config.update_frequency IS NOT NULL');
        queryBuilder.andWhere(`
          CASE 
            WHEN config.update_frequency = 'real_time' THEN config.last_sync_date < :realTimeThreshold
            WHEN config.update_frequency = 'hourly' THEN config.last_sync_date < :hourlyThreshold
            WHEN config.update_frequency = 'daily' THEN config.last_sync_date < :dailyThreshold
            WHEN config.update_frequency = 'weekly' THEN config.last_sync_date < :weeklyThreshold
            WHEN config.update_frequency = 'monthly' THEN config.last_sync_date < :monthlyThreshold
            ELSE FALSE
          END
        `, {
          realTimeThreshold: new Date(now.getTime() - 60 * 60 * 1000),
          hourlyThreshold: new Date(now.getTime() - 2 * 60 * 60 * 1000),
          dailyThreshold: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
          weeklyThreshold: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
          monthlyThreshold: new Date(now.getTime() - 32 * 24 * 60 * 60 * 1000),
        });
      }
    }

    if (filters.is_sync_failed !== undefined) {
      if (filters.is_sync_failed) {
        queryBuilder.andWhere('config.sync_status = :syncStatusFailed', { syncStatusFailed: 'failed' });
      } else {
        queryBuilder.andWhere('config.sync_status != :syncStatusFailed', { syncStatusFailed: 'failed' });
      }
    }

    if (filters.validation_type) {
      QueryHelper.applyInFilter(queryBuilder, 'config.validation_type', filters.validation_type);
    }

    if (filters.data_source) {
      queryBuilder.andWhere('config.data_source = :dataSource', { dataSource: filters.data_source });
    }

    if (filters.provider) {
      queryBuilder.andWhere('config.provider = :provider', { provider: filters.provider });
    }

    if (filters.provider_version) {
      queryBuilder.andWhere('config.provider_version = :providerVersion', { providerVersion: filters.provider_version });
    }

    if (filters.data_feed) {
      queryBuilder.andWhere('config.data_feed = :dataFeed', { dataFeed: filters.data_feed });
    }

    if (filters.update_frequency) {
      QueryHelper.applyInFilter(queryBuilder, 'config.update_frequency', filters.update_frequency);
    }

    if (filters.sync_status) {
      QueryHelper.applyInFilter(queryBuilder, 'config.sync_status', filters.sync_status);
    }

    if (filters.environment) {
      QueryHelper.applyInFilter(queryBuilder, 'config.environment', filters.environment);
    }

    if (filters.region) {
      queryBuilder.andWhere('config.region = :region', { region: filters.region });
    }

    if (filters.jurisdiction) {
      queryBuilder.andWhere('config.jurisdiction = :jurisdiction', { jurisdiction: filters.jurisdiction });
    }

    if (filters.regulatory_framework) {
      queryBuilder.andWhere('config.regulatory_framework = :regulatoryFramework', { regulatoryFramework: filters.regulatory_framework });
    }

    if (filters.compliance_requirement) {
      queryBuilder.andWhere('config.compliance_requirement = :complianceRequirement', { complianceRequirement: filters.compliance_requirement });
    }

    if (filters.impact_level) {
      QueryHelper.applyInFilter(queryBuilder, 'config.impact_level', filters.impact_level);
    }

    if (filters.config_group) {
      queryBuilder.andWhere('config.config_group = :configGroup', { configGroup: filters.config_group });
    }

    if (filters.config_hierarchy) {
      queryBuilder.andWhere('config.config_hierarchy = :configHierarchy', { configHierarchy: filters.config_hierarchy });
    }

    if (filters.ui_component) {
      queryBuilder.andWhere('config.ui_component = :uiComponent', { uiComponent: filters.ui_component });
    }

    if (filters.data_classification) {
      QueryHelper.applyInFilter(queryBuilder, 'config.data_classification', filters.data_classification);
    }

    if (filters.version) {
      queryBuilder.andWhere('config.version = :version', { version: filters.version });
    }

    // User filters
    if (filters.created_by) {
      queryBuilder.andWhere('config.created_by = :createdBy', { createdBy: filters.created_by });
    }

    if (filters.updated_by) {
      queryBuilder.andWhere('config.updated_by = :updatedBy', { updatedBy: filters.updated_by });
    }

    if (filters.approved_by) {
      queryBuilder.andWhere('config.approved_by = :approvedBy', { approvedBy: filters.approved_by });
    }

    if (filters.reviewed_by) {
      queryBuilder.andWhere('config.reviewed_by = :reviewedBy', { reviewedBy: filters.reviewed_by });
    }

    if (filters.last_modified_by) {
      queryBuilder.andWhere('config.last_modified_by = :lastModifiedBy', { lastModifiedBy: filters.last_modified_by });
    }

    // Numeric range filters
    if (filters.min_usage_count !== undefined) {
      queryBuilder.andWhere('config.usage_count >= :minUsageCount', { minUsageCount: filters.min_usage_count });
    }

    if (filters.max_usage_count !== undefined) {
      queryBuilder.andWhere('config.usage_count <= :maxUsageCount', { maxUsageCount: filters.max_usage_count });
    }

    if (filters.min_age_days !== undefined) {
      const minDate = new Date();
      minDate.setDate(minDate.getDate() - filters.min_age_days);
      queryBuilder.andWhere('config.created_at <= :minDate', { minDate });
    }

    if (filters.max_age_days !== undefined) {
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() - filters.max_age_days);
      queryBuilder.andWhere('config.created_at >= :maxDate', { maxDate });
    }

    if (filters.min_days_since_use !== undefined) {
      const minUseDate = new Date();
      minUseDate.setDate(minUseDate.getDate() - filters.min_days_since_use);
      queryBuilder.andWhere('config.last_used_date <= :minUseDate', { minUseDate });
    }

    if (filters.max_days_since_use !== undefined) {
      const maxUseDate = new Date();
      maxUseDate.setDate(maxUseDate.getDate() - filters.max_days_since_use);
      queryBuilder.andWhere('config.last_used_date >= :maxUseDate', { maxUseDate });
    }

    if (filters.min_days_since_modified !== undefined) {
      const minModDate = new Date();
      minModDate.setDate(minModDate.getDate() - filters.min_days_since_modified);
      queryBuilder.andWhere('config.last_modified_date <= :minModDate', { minModDate });
    }

    if (filters.max_days_since_modified !== undefined) {
      const maxModDate = new Date();
      maxModDate.setDate(maxModDate.getDate() - filters.max_days_since_modified);
      queryBuilder.andWhere('config.last_modified_date >= :maxModDate', { maxModDate });
    }

    // Date range filters
    QueryHelper.applyDateRangeFilter(queryBuilder, 'config.effective_date', filters.effective_date_from, filters.effective_date_to);
    QueryHelper.applyDateRangeFilter(queryBuilder, 'config.expiry_date', filters.expiry_date_from, filters.expiry_date_to);
    QueryHelper.applyDateRangeFilter(queryBuilder, 'config.approved_date', filters.approved_date_from, filters.approved_date_to);
    QueryHelper.applyDateRangeFilter(queryBuilder, 'config.reviewed_date', filters.reviewed_date_from, filters.reviewed_date_to);
    QueryHelper.applyDateRangeFilter(queryBuilder, 'config.next_review_date', filters.next_review_date_from, filters.next_review_date_to);
    QueryHelper.applyDateRangeFilter(queryBuilder, 'config.last_used_date', filters.last_used_date_from, filters.last_used_date_to);
    QueryHelper.applyDateRangeFilter(queryBuilder, 'config.last_modified_date', filters.last_modified_date_from, filters.last_modified_date_to);
    QueryHelper.applyDateRangeFilter(queryBuilder, 'config.last_sync_date', filters.last_sync_date_from, filters.last_sync_date_to);

    // Tags filter
    if (filters.tags) {
      QueryHelper.applyTagsFilter(queryBuilder, 'config.tags', filters.tags);
    }

    return queryBuilder;
  }

  private async getCountByField(field: string, filters: RiskConfigurationFilter): Promise<Record<string, number>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select(`config.${field}`, 'field_value');
    queryBuilder.addSelect('COUNT(*)', 'count');
    queryBuilder.groupBy(`config.${field}`);
    queryBuilder.having(`config.${field} IS NOT NULL`);

    const results = await queryBuilder.getRawMany();
    return results.reduce((acc, row) => {
      acc[row.field_value] = parseInt(row.count);
      return acc;
    }, {});
  }

  private async getCountWithCondition(filters: RiskConfigurationFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    return queryBuilder.getCount();
  }

  private async getEffectiveCount(filters: RiskConfigurationFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    const now = new Date();
    
    queryBuilder.andWhere('config.is_active = :isActive', { isActive: true });
    queryBuilder.andWhere('config.status = :status', { status: 'active' });
    queryBuilder.andWhere('(config.effective_date IS NULL OR config.effective_date <= :now)', { now });
    queryBuilder.andWhere('(config.expiry_date IS NULL OR config.expiry_date > :now)', { now });
    
    return queryBuilder.getCount();
  }

  private async getPendingApprovalCount(filters: RiskConfigurationFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('config.requires_approval = :requiresApproval', { requiresApproval: true });
    queryBuilder.andWhere('config.approved_by IS NULL');
    return queryBuilder.getCount();
  }

  private async getExpiredCount(filters: RiskConfigurationFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('config.expiry_date < :currentDate', { currentDate: new Date() });
    return queryBuilder.getCount();
  }

  private async getExpiringSoonCount(daysAhead: number, filters: RiskConfigurationFilter): Promise<number> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('config.expiry_date BETWEEN :currentDate AND :futureDate', { 
      currentDate: new Date(), 
      futureDate 
    });
    return queryBuilder.getCount();
  }

  private async getOverdueReviewCount(filters: RiskConfigurationFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('config.next_review_date < :currentDate', { currentDate: new Date() });
    return queryBuilder.getCount();
  }

  private async getDueReviewCount(daysAhead: number, filters: RiskConfigurationFilter): Promise<number> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('config.next_review_date BETWEEN :currentDate AND :futureDate', { 
      currentDate: new Date(), 
      futureDate 
    });
    return queryBuilder.getCount();
  }

  private async getCustomizedCount(filters: RiskConfigurationFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('config.config_value IS NOT NULL');
    queryBuilder.andWhere('config.config_value != config.default_value');
    return queryBuilder.getCount();
  }

  private async getDefaultCount(filters: RiskConfigurationFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('(config.config_value IS NULL OR config.config_value = config.default_value)');
    return queryBuilder.getCount();
  }

  private async getNullValueCount(filters: RiskConfigurationFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('config.config_value IS NULL');
    return queryBuilder.getCount();
  }

  private async getWithValidationCount(filters: RiskConfigurationFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('config.validation_rules IS NOT NULL');
    return queryBuilder.getCount();
  }

  private async getWithDependenciesCount(filters: RiskConfigurationFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('config.dependencies IS NOT NULL');
    queryBuilder.andWhere('jsonb_array_length(config.dependencies) > 0');
    return queryBuilder.getCount();
  }

  private async getWithDependentsCount(filters: RiskConfigurationFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('config.dependent_configs IS NOT NULL');
    queryBuilder.andWhere('jsonb_array_length(config.dependent_configs) > 0');
    return queryBuilder.getCount();
  }

  private async getBusinessCriticalCount(filters: RiskConfigurationFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('(config.affects_scoring = :affectsScoring OR config.affects_thresholds = :affectsThresholds OR config.affects_models = :affectsModels OR config.affects_compliance = :affectsCompliance)', {
      affectsScoring: true,
      affectsThresholds: true,
      affectsModels: true,
      affectsCompliance: true,
    });
    return queryBuilder.getCount();
  }

  private async getComplianceRelatedCount(filters: RiskConfigurationFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('(config.regulatory_framework IS NOT NULL OR config.compliance_requirement IS NOT NULL OR config.affects_compliance = :affectsCompliance)', {
      affectsCompliance: true,
    });
    return queryBuilder.getCount();
  }

  private async getStaleCount(daysBack: number, filters: RiskConfigurationFilter): Promise<number> {
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - daysBack);

    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('(config.last_used_date IS NULL OR config.last_used_date < :staleDate)', { staleDate });
    return queryBuilder.getCount();
  }

  private async getSyncOverdueCount(filters: RiskConfigurationFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    const now = new Date();
    
    queryBuilder.andWhere('config.last_sync_date IS NOT NULL');
    queryBuilder.andWhere('config.update_frequency IS NOT NULL');
    queryBuilder.andWhere(`
      CASE 
        WHEN config.update_frequency = 'real_time' THEN config.last_sync_date < :realTimeThreshold
        WHEN config.update_frequency = 'hourly' THEN config.last_sync_date < :hourlyThreshold
        WHEN config.update_frequency = 'daily' THEN config.last_sync_date < :dailyThreshold
        WHEN config.update_frequency = 'weekly' THEN config.last_sync_date < :weeklyThreshold
        WHEN config.update_frequency = 'monthly' THEN config.last_sync_date < :monthlyThreshold
        ELSE FALSE
      END
    `, {
      realTimeThreshold: new Date(now.getTime() - 60 * 60 * 1000),
      hourlyThreshold: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      dailyThreshold: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      weeklyThreshold: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      monthlyThreshold: new Date(now.getTime() - 32 * 24 * 60 * 60 * 1000),
    });
    
    return queryBuilder.getCount();
  }

  private async getSumByField(field: string, filters: RiskConfigurationFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select(`SUM(config.${field})`, 'total');
    const result = await queryBuilder.getRawOne();
    return parseInt(result?.total || '0');
  }

  private async getAverageUsageCount(filters: RiskConfigurationFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select('AVG(config.usage_count)', 'average');
    const result = await queryBuilder.getRawOne();
    return parseFloat(result?.average || '0');
  }

  private async getAverageAgeDays(filters: RiskConfigurationFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select('AVG(EXTRACT(DAY FROM (NOW() - config.created_at)))', 'average');
    const result = await queryBuilder.getRawOne();
    return parseFloat(result?.average || '0');
  }

  private async getAverageRiskScore(filters: RiskConfigurationFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select(`
      AVG(
        CASE config.risk_level
          WHEN 'low' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'high' THEN 3
          WHEN 'critical' THEN 4
          ELSE 0
        END
      )
    `, 'average');
    const result = await queryBuilder.getRawOne();
    return parseFloat(result?.average || '0');
  }

  private async getAverageCompletenessScore(filters: RiskConfigurationFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select(`
      AVG(
        (CASE WHEN config.config_value IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN config.validation_rules IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN config.dependencies IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN config.model_parameters IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN config.risk_factors IS NOT NULL THEN 1 ELSE 0 END) * 20
      )
    `, 'average');
    const result = await queryBuilder.getRawOne();
    return parseFloat(result?.average || '0');
  }

  private async getAverageDataQualityScore(filters: RiskConfigurationFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select(`
      AVG(
        (CASE WHEN config.config_value IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN config.last_sync_date IS NOT NULL AND config.last_sync_date > NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END +
         CASE WHEN config.sync_status = 'success' THEN 1 ELSE 0 END +
         CASE WHEN config.validation_rules IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN config.usage_count > 0 THEN 1 ELSE 0 END) * 20
      )
    `, 'average');
    const result = await queryBuilder.getRawOne();
    return parseFloat(result?.average || '0');
  }
}