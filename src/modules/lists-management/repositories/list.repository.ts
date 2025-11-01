import { Repository, SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { ListEntity } from '../entities/list.entity';
import { BaseFilter, PaginationOptions, PaginationResult } from '../../common/interfaces';
import { QueryHelper } from '../../../utils/database/query.helper';

export interface ListFilter extends BaseFilter {
  subscriber_id?: string;
  list_name?: string;
  list_type?: string | string[];
  status?: string | string[];
  category?: string;
  subcategory?: string;
  priority?: string | string[];
  risk_level?: string | string[];
  is_active?: boolean;
  is_system_list?: boolean;
  is_readonly?: boolean;
  is_encrypted?: boolean;
  is_sensitive?: boolean;
  requires_approval?: boolean;
  auto_update?: boolean;
  data_source?: string;
  sync_status?: string | string[];
  is_approved?: boolean;
  is_expired?: boolean;
  is_effective?: boolean;
  is_sync_overdue?: boolean;
  is_sync_failed?: boolean;
  jurisdiction?: string;
  regulatory_framework?: string;
  compliance_requirement?: string;
  requires_enhanced_due_diligence?: boolean;
  triggers_alert?: boolean;
  blocks_transaction?: boolean;
  alert_severity?: string | string[];
  action_required?: string | string[];
  created_by?: string;
  updated_by?: string;
  approved_by?: string;
  min_total_entries?: number;
  max_total_entries?: number;
  min_active_entries?: number;
  max_active_entries?: number;
  min_utilization_rate?: number;
  max_utilization_rate?: number;
  effective_date_from?: Date;
  effective_date_to?: Date;
  expiry_date_from?: Date;
  expiry_date_to?: Date;
  last_sync_date_from?: Date;
  last_sync_date_to?: Date;
  next_sync_date_from?: Date;
  next_sync_date_to?: Date;
  approved_date_from?: Date;
  approved_date_to?: Date;
  tags?: string | string[];
}

@Injectable()
export class ListRepository extends BaseRepository<ListEntity> {
  constructor(
    @InjectRepository(ListEntity)
    private readonly repository: Repository<ListEntity>,
  ) {
    super(repository);
  }

  async findWithFilters(
    filters: ListFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findBySubscriberId(
    subscriberId: string,
    filters: Omit<ListFilter, 'subscriber_id'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListEntity>> {
    return this.findWithFilters({ ...filters, subscriber_id: subscriberId }, pagination);
  }

  async findByListType(
    listType: string | string[],
    filters: Omit<ListFilter, 'list_type'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListEntity>> {
    return this.findWithFilters({ ...filters, list_type: listType }, pagination);
  }

  async findByRiskLevel(
    riskLevel: string | string[],
    filters: Omit<ListFilter, 'risk_level'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListEntity>> {
    return this.findWithFilters({ ...filters, risk_level: riskLevel }, pagination);
  }

  async findActiveLists(
    filters: Omit<ListFilter, 'is_active' | 'status'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListEntity>> {
    return this.findWithFilters({ 
      ...filters, 
      is_active: true, 
      status: 'active' 
    }, pagination);
  }

  async findSystemLists(
    filters: Omit<ListFilter, 'is_system_list'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListEntity>> {
    return this.findWithFilters({ ...filters, is_system_list: true }, pagination);
  }

  async findCustomLists(
    filters: Omit<ListFilter, 'is_system_list'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListEntity>> {
    return this.findWithFilters({ ...filters, is_system_list: false }, pagination);
  }

  async findSensitiveLists(
    filters: Omit<ListFilter, 'is_sensitive'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListEntity>> {
    return this.findWithFilters({ ...filters, is_sensitive: true }, pagination);
  }

  async findEncryptedLists(
    filters: Omit<ListFilter, 'is_encrypted'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListEntity>> {
    return this.findWithFilters({ ...filters, is_encrypted: true }, pagination);
  }

  async findPendingApproval(
    filters: ListFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('list.requires_approval = :requiresApproval', { requiresApproval: true });
    queryBuilder.andWhere('list.approved_by IS NULL');
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findExpiredLists(
    filters: ListFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('list.expiry_date < :currentDate', { currentDate: new Date() });
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findExpiringLists(
    daysAhead: number = 30,
    filters: ListFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListEntity>> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('list.expiry_date BETWEEN :currentDate AND :futureDate', { 
      currentDate: new Date(), 
      futureDate 
    });
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findSyncOverdueLists(
    filters: ListFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('list.auto_update = :autoUpdate', { autoUpdate: true });
    queryBuilder.andWhere('list.next_sync_date < :currentDate', { currentDate: new Date() });
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findFailedSyncLists(
    filters: Omit<ListFilter, 'sync_status'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListEntity>> {
    return this.findWithFilters({ ...filters, sync_status: 'failed' }, pagination);
  }

  async findHighRiskLists(
    filters: Omit<ListFilter, 'risk_level'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListEntity>> {
    return this.findWithFilters({ ...filters, risk_level: ['high', 'critical'] }, pagination);
  }

  async findAlertTriggeringLists(
    filters: Omit<ListFilter, 'triggers_alert'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListEntity>> {
    return this.findWithFilters({ ...filters, triggers_alert: true }, pagination);
  }

  async findTransactionBlockingLists(
    filters: Omit<ListFilter, 'blocks_transaction'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListEntity>> {
    return this.findWithFilters({ ...filters, blocks_transaction: true }, pagination);
  }

  async findByJurisdiction(
    jurisdiction: string,
    filters: Omit<ListFilter, 'jurisdiction'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListEntity>> {
    return this.findWithFilters({ ...filters, jurisdiction }, pagination);
  }

  async findByRegulatoryFramework(
    framework: string,
    filters: Omit<ListFilter, 'regulatory_framework'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListEntity>> {
    return this.findWithFilters({ ...filters, regulatory_framework: framework }, pagination);
  }

  async findLowUtilizationLists(
    maxUtilization: number = 20,
    filters: ListFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('list.total_entries > 0');
    queryBuilder.andWhere('(list.active_entries::float / list.total_entries::float * 100) <= :maxUtilization', { 
      maxUtilization 
    });
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findEmptyLists(
    filters: Omit<ListFilter, 'min_total_entries' | 'max_total_entries'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListEntity>> {
    return this.findWithFilters({ 
      ...filters, 
      min_total_entries: 0, 
      max_total_entries: 0 
    }, pagination);
  }

  async findRecentlyCreatedLists(
    daysBack: number = 7,
    filters: ListFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListEntity>> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - daysBack);

    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('list.created_at >= :fromDate', { fromDate });
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findRecentlyUpdatedLists(
    daysBack: number = 7,
    filters: ListFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<ListEntity>> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - daysBack);

    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('list.updated_at >= :fromDate', { fromDate });
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async updateListStatus(
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

  async updateSyncStatus(
    id: string,
    syncStatus: string,
    syncError?: string,
  ): Promise<void> {
    const updateData: any = {
      sync_status: syncStatus,
      updated_at: new Date(),
    };
    
    if (syncStatus === 'completed') {
      updateData.last_sync_date = new Date();
      updateData.sync_error = null;
      updateData.sync_retry_count = 0;
    } else if (syncStatus === 'failed') {
      updateData.sync_error = syncError;
    }
    
    await this.repository.update(id, updateData);
  }

  async incrementSyncRetryCount(id: string): Promise<void> {
    await this.repository.update(id, {
      sync_retry_count: () => 'sync_retry_count + 1',
      updated_at: new Date(),
    });
  }

  async updateNextSyncDate(
    id: string,
    nextSyncDate: Date,
    syncFrequencyHours?: number,
  ): Promise<void> {
    const updateData: any = {
      next_sync_date: nextSyncDate,
      updated_at: new Date(),
    };
    
    if (syncFrequencyHours) updateData.sync_frequency_hours = syncFrequencyHours;
    
    await this.repository.update(id, updateData);
  }

  async updateEntryCounts(
    id: string,
    totalEntries: number,
    activeEntries: number,
    inactiveEntries: number,
    pendingEntries: number,
  ): Promise<void> {
    await this.repository.update(id, {
      total_entries: totalEntries,
      active_entries: activeEntries,
      inactive_entries: inactiveEntries,
      pending_entries: pendingEntries,
      updated_at: new Date(),
    });
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

  async updateAccessTracking(
    id: string,
  ): Promise<void> {
    await this.repository.update(id, {
      last_accessed_date: new Date(),
      access_count: () => 'access_count + 1',
      updated_at: new Date(),
    });
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

  async updateComplianceSettings(
    id: string,
    requiresEnhancedDueDiligence?: boolean,
    triggersAlert?: boolean,
    blocksTransaction?: boolean,
    alertSeverity?: string,
    actionRequired?: string,
  ): Promise<void> {
    const updateData: any = {
      updated_at: new Date(),
    };
    
    if (requiresEnhancedDueDiligence !== undefined) updateData.requires_enhanced_due_diligence = requiresEnhancedDueDiligence;
    if (triggersAlert !== undefined) updateData.triggers_alert = triggersAlert;
    if (blocksTransaction !== undefined) updateData.blocks_transaction = blocksTransaction;
    if (alertSeverity) updateData.alert_severity = alertSeverity;
    if (actionRequired) updateData.action_required = actionRequired;
    
    await this.repository.update(id, updateData);
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

  async incrementVersion(id: string): Promise<void> {
    await this.repository.update(id, {
      version: () => 'version + 1',
      updated_at: new Date(),
    });
  }

  async getListStatistics(filters: ListFilter = {}): Promise<{
    total: number;
    by_type: Record<string, number>;
    by_status: Record<string, number>;
    by_category: Record<string, number>;
    by_priority: Record<string, number>;
    by_risk_level: Record<string, number>;
    by_jurisdiction: Record<string, number>;
    active_count: number;
    inactive_count: number;
    system_lists_count: number;
    custom_lists_count: number;
    sensitive_lists_count: number;
    encrypted_lists_count: number;
    pending_approval_count: number;
    expired_count: number;
    expiring_soon_count: number;
    sync_overdue_count: number;
    sync_failed_count: number;
    high_risk_count: number;
    alert_triggering_count: number;
    transaction_blocking_count: number;
    empty_lists_count: number;
    low_utilization_count: number;
    total_entries_sum: number;
    active_entries_sum: number;
    average_utilization_rate: number;
    average_entries_per_list: number;
  }> {
    const queryBuilder = this.createFilteredQuery(filters);
    
    const [
      total,
      byType,
      byStatus,
      byCategory,
      byPriority,
      byRiskLevel,
      byJurisdiction,
      activeCount,
      inactiveCount,
      systemListsCount,
      customListsCount,
      sensitiveListsCount,
      encryptedListsCount,
      pendingApprovalCount,
      expiredCount,
      expiringSoonCount,
      syncOverdueCount,
      syncFailedCount,
      highRiskCount,
      alertTriggeringCount,
      transactionBlockingCount,
      emptyListsCount,
      lowUtilizationCount,
      totalEntriesSum,
      activeEntriesSum,
      avgUtilizationRate,
      avgEntriesPerList,
    ] = await Promise.all([
      queryBuilder.getCount(),
      this.getCountByField('list_type', filters),
      this.getCountByField('status', filters),
      this.getCountByField('category', filters),
      this.getCountByField('priority', filters),
      this.getCountByField('risk_level', filters),
      this.getCountByField('jurisdiction', filters),
      this.getCountWithCondition({ ...filters, is_active: true }),
      this.getCountWithCondition({ ...filters, is_active: false }),
      this.getCountWithCondition({ ...filters, is_system_list: true }),
      this.getCountWithCondition({ ...filters, is_system_list: false }),
      this.getCountWithCondition({ ...filters, is_sensitive: true }),
      this.getCountWithCondition({ ...filters, is_encrypted: true }),
      this.getPendingApprovalCount(filters),
      this.getExpiredCount(filters),
      this.getExpiringSoonCount(30, filters),
      this.getSyncOverdueCount(filters),
      this.getCountWithCondition({ ...filters, sync_status: 'failed' }),
      this.getCountWithCondition({ ...filters, risk_level: ['high', 'critical'] }),
      this.getCountWithCondition({ ...filters, triggers_alert: true }),
      this.getCountWithCondition({ ...filters, blocks_transaction: true }),
      this.getCountWithCondition({ ...filters, min_total_entries: 0, max_total_entries: 0 }),
      this.getLowUtilizationCount(20, filters),
      this.getSumByField('total_entries', filters),
      this.getSumByField('active_entries', filters),
      this.getAverageUtilizationRate(filters),
      this.getAverageEntriesPerList(filters),
    ]);

    return {
      total,
      by_type: byType,
      by_status: byStatus,
      by_category: byCategory,
      by_priority: byPriority,
      by_risk_level: byRiskLevel,
      by_jurisdiction: byJurisdiction,
      active_count: activeCount,
      inactive_count: inactiveCount,
      system_lists_count: systemListsCount,
      custom_lists_count: customListsCount,
      sensitive_lists_count: sensitiveListsCount,
      encrypted_lists_count: encryptedListsCount,
      pending_approval_count: pendingApprovalCount,
      expired_count: expiredCount,
      expiring_soon_count: expiringSoonCount,
      sync_overdue_count: syncOverdueCount,
      sync_failed_count: syncFailedCount,
      high_risk_count: highRiskCount,
      alert_triggering_count: alertTriggeringCount,
      transaction_blocking_count: transactionBlockingCount,
      empty_lists_count: emptyListsCount,
      low_utilization_count: lowUtilizationCount,
      total_entries_sum: totalEntriesSum,
      active_entries_sum: activeEntriesSum,
      average_utilization_rate: avgUtilizationRate,
      average_entries_per_list: avgEntriesPerList,
    };
  }

  private createFilteredQuery(filters: ListFilter): SelectQueryBuilder<ListEntity> {
    const queryBuilder = this.repository.createQueryBuilder('list');

    // Apply base filters
    QueryHelper.applyBaseFilters(queryBuilder, filters, 'list');

    // Apply specific filters
    if (filters.subscriber_id) {
      queryBuilder.andWhere('list.subscriber_id = :subscriberId', { subscriberId: filters.subscriber_id });
    }

    if (filters.list_name) {
      queryBuilder.andWhere('list.list_name ILIKE :listName', { listName: `%${filters.list_name}%` });
    }

    if (filters.list_type) {
      QueryHelper.applyInFilter(queryBuilder, 'list.list_type', filters.list_type);
    }

    if (filters.status) {
      QueryHelper.applyInFilter(queryBuilder, 'list.status', filters.status);
    }

    if (filters.category) {
      queryBuilder.andWhere('list.category = :category', { category: filters.category });
    }

    if (filters.subcategory) {
      queryBuilder.andWhere('list.subcategory = :subcategory', { subcategory: filters.subcategory });
    }

    if (filters.priority) {
      QueryHelper.applyInFilter(queryBuilder, 'list.priority', filters.priority);
    }

    if (filters.risk_level) {
      QueryHelper.applyInFilter(queryBuilder, 'list.risk_level', filters.risk_level);
    }

    if (filters.is_active !== undefined) {
      queryBuilder.andWhere('list.is_active = :isActive', { isActive: filters.is_active });
    }

    if (filters.is_system_list !== undefined) {
      queryBuilder.andWhere('list.is_system_list = :isSystemList', { isSystemList: filters.is_system_list });
    }

    if (filters.is_readonly !== undefined) {
      queryBuilder.andWhere('list.is_readonly = :isReadonly', { isReadonly: filters.is_readonly });
    }

    if (filters.is_encrypted !== undefined) {
      queryBuilder.andWhere('list.is_encrypted = :isEncrypted', { isEncrypted: filters.is_encrypted });
    }

    if (filters.is_sensitive !== undefined) {
      queryBuilder.andWhere('list.is_sensitive = :isSensitive', { isSensitive: filters.is_sensitive });
    }

    if (filters.requires_approval !== undefined) {
      queryBuilder.andWhere('list.requires_approval = :requiresApproval', { requiresApproval: filters.requires_approval });
    }

    if (filters.auto_update !== undefined) {
      queryBuilder.andWhere('list.auto_update = :autoUpdate', { autoUpdate: filters.auto_update });
    }

    if (filters.data_source) {
      queryBuilder.andWhere('list.data_source = :dataSource', { dataSource: filters.data_source });
    }

    if (filters.sync_status) {
      QueryHelper.applyInFilter(queryBuilder, 'list.sync_status', filters.sync_status);
    }

    if (filters.is_approved !== undefined) {
      if (filters.is_approved) {
        queryBuilder.andWhere('list.approved_by IS NOT NULL');
      } else {
        queryBuilder.andWhere('list.approved_by IS NULL');
      }
    }

    if (filters.is_expired !== undefined) {
      if (filters.is_expired) {
        queryBuilder.andWhere('list.expiry_date < :currentDate', { currentDate: new Date() });
      } else {
        queryBuilder.andWhere('(list.expiry_date IS NULL OR list.expiry_date >= :currentDate)', { currentDate: new Date() });
      }
    }

    if (filters.is_effective !== undefined) {
      const now = new Date();
      if (filters.is_effective) {
        queryBuilder.andWhere('(list.effective_date IS NULL OR list.effective_date <= :now)', { now });
        queryBuilder.andWhere('(list.expiry_date IS NULL OR list.expiry_date > :now)', { now });
      } else {
        queryBuilder.andWhere('(list.effective_date > :now OR list.expiry_date <= :now)', { now });
      }
    }

    if (filters.is_sync_overdue !== undefined) {
      if (filters.is_sync_overdue) {
        queryBuilder.andWhere('list.auto_update = :autoUpdate', { autoUpdate: true });
        queryBuilder.andWhere('list.next_sync_date < :currentDate', { currentDate: new Date() });
      } else {
        queryBuilder.andWhere('(list.auto_update = :autoUpdateFalse OR list.next_sync_date IS NULL OR list.next_sync_date >= :currentDate)', { 
          autoUpdateFalse: false, 
          currentDate: new Date() 
        });
      }
    }

    if (filters.is_sync_failed !== undefined) {
      if (filters.is_sync_failed) {
        queryBuilder.andWhere('list.sync_status = :syncStatus', { syncStatus: 'failed' });
      } else {
        queryBuilder.andWhere('list.sync_status != :syncStatus', { syncStatus: 'failed' });
      }
    }

    if (filters.jurisdiction) {
      queryBuilder.andWhere('list.jurisdiction = :jurisdiction', { jurisdiction: filters.jurisdiction });
    }

    if (filters.regulatory_framework) {
      queryBuilder.andWhere('list.regulatory_framework = :regulatoryFramework', { regulatoryFramework: filters.regulatory_framework });
    }

    if (filters.compliance_requirement) {
      queryBuilder.andWhere('list.compliance_requirement = :complianceRequirement', { complianceRequirement: filters.compliance_requirement });
    }

    if (filters.requires_enhanced_due_diligence !== undefined) {
      queryBuilder.andWhere('list.requires_enhanced_due_diligence = :requiresEnhancedDueDiligence', { requiresEnhancedDueDiligence: filters.requires_enhanced_due_diligence });
    }

    if (filters.triggers_alert !== undefined) {
      queryBuilder.andWhere('list.triggers_alert = :triggersAlert', { triggersAlert: filters.triggers_alert });
    }

    if (filters.blocks_transaction !== undefined) {
      queryBuilder.andWhere('list.blocks_transaction = :blocksTransaction', { blocksTransaction: filters.blocks_transaction });
    }

    if (filters.alert_severity) {
      QueryHelper.applyInFilter(queryBuilder, 'list.alert_severity', filters.alert_severity);
    }

    if (filters.action_required) {
      QueryHelper.applyInFilter(queryBuilder, 'list.action_required', filters.action_required);
    }

    if (filters.created_by) {
      queryBuilder.andWhere('list.created_by = :createdBy', { createdBy: filters.created_by });
    }

    if (filters.updated_by) {
      queryBuilder.andWhere('list.updated_by = :updatedBy', { updatedBy: filters.updated_by });
    }

    if (filters.approved_by) {
      queryBuilder.andWhere('list.approved_by = :approvedBy', { approvedBy: filters.approved_by });
    }

    // Numeric range filters
    if (filters.min_total_entries !== undefined) {
      queryBuilder.andWhere('list.total_entries >= :minTotalEntries', { minTotalEntries: filters.min_total_entries });
    }

    if (filters.max_total_entries !== undefined) {
      queryBuilder.andWhere('list.total_entries <= :maxTotalEntries', { maxTotalEntries: filters.max_total_entries });
    }

    if (filters.min_active_entries !== undefined) {
      queryBuilder.andWhere('list.active_entries >= :minActiveEntries', { minActiveEntries: filters.min_active_entries });
    }

    if (filters.max_active_entries !== undefined) {
      queryBuilder.andWhere('list.active_entries <= :maxActiveEntries', { maxActiveEntries: filters.max_active_entries });
    }

    if (filters.min_utilization_rate !== undefined) {
      queryBuilder.andWhere('list.total_entries > 0');
      queryBuilder.andWhere('(list.active_entries::float / list.total_entries::float * 100) >= :minUtilizationRate', { 
        minUtilizationRate: filters.min_utilization_rate 
      });
    }

    if (filters.max_utilization_rate !== undefined) {
      queryBuilder.andWhere('list.total_entries > 0');
      queryBuilder.andWhere('(list.active_entries::float / list.total_entries::float * 100) <= :maxUtilizationRate', { 
        maxUtilizationRate: filters.max_utilization_rate 
      });
    }

    // Date range filters
    if (filters.effective_date_from) {
      queryBuilder.andWhere('list.effective_date >= :effectiveDateFrom', { effectiveDateFrom: filters.effective_date_from });
    }

    if (filters.effective_date_to) {
      queryBuilder.andWhere('list.effective_date <= :effectiveDateTo', { effectiveDateTo: filters.effective_date_to });
    }

    if (filters.expiry_date_from) {
      queryBuilder.andWhere('list.expiry_date >= :expiryDateFrom', { expiryDateFrom: filters.expiry_date_from });
    }

    if (filters.expiry_date_to) {
      queryBuilder.andWhere('list.expiry_date <= :expiryDateTo', { expiryDateTo: filters.expiry_date_to });
    }

    if (filters.last_sync_date_from) {
      queryBuilder.andWhere('list.last_sync_date >= :lastSyncDateFrom', { lastSyncDateFrom: filters.last_sync_date_from });
    }

    if (filters.last_sync_date_to) {
      queryBuilder.andWhere('list.last_sync_date <= :lastSyncDateTo', { lastSyncDateTo: filters.last_sync_date_to });
    }

    if (filters.next_sync_date_from) {
      queryBuilder.andWhere('list.next_sync_date >= :nextSyncDateFrom', { nextSyncDateFrom: filters.next_sync_date_from });
    }

    if (filters.next_sync_date_to) {
      queryBuilder.andWhere('list.next_sync_date <= :nextSyncDateTo', { nextSyncDateTo: filters.next_sync_date_to });
    }

    if (filters.approved_date_from) {
      queryBuilder.andWhere('list.approved_date >= :approvedDateFrom', { approvedDateFrom: filters.approved_date_from });
    }

    if (filters.approved_date_to) {
      queryBuilder.andWhere('list.approved_date <= :approvedDateTo', { approvedDateTo: filters.approved_date_to });
    }

    // Text search filters
    if (filters.tags) {
      const tags = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
      const tagConditions = tags.map((_, index) => `list.tags ILIKE :tag${index}`).join(' OR ');
      const tagParams = tags.reduce((params, tag, index) => {
        params[`tag${index}`] = `%${tag}%`;
        return params;
      }, {});
      
      queryBuilder.andWhere(`(${tagConditions})`, tagParams);
    }

    return queryBuilder;
  }

  private async getCountByField(field: string, filters: ListFilter): Promise<Record<string, number>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select(`list.${field}`, 'field_value');
    queryBuilder.addSelect('COUNT(*)', 'count');
    queryBuilder.groupBy(`list.${field}`);

    const results = await queryBuilder.getRawMany();
    return results.reduce((acc, result) => {
      acc[result.field_value] = parseInt(result.count);
      return acc;
    }, {});
  }

  private async getCountWithCondition(filters: ListFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    return queryBuilder.getCount();
  }

  private async getSumByField(field: string, filters: ListFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select(`SUM(list.${field})`, 'sum_value');
    
    const result = await queryBuilder.getRawOne();
    return parseInt(result.sum_value) || 0;
  }

  private async getPendingApprovalCount(filters: ListFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('list.requires_approval = :requiresApproval', { requiresApproval: true });
    queryBuilder.andWhere('list.approved_by IS NULL');
    return queryBuilder.getCount();
  }

  private async getExpiredCount(filters: ListFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('list.expiry_date < :currentDate', { currentDate: new Date() });
    return queryBuilder.getCount();
  }

  private async getExpiringSoonCount(daysAhead: number, filters: ListFilter): Promise<number> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('list.expiry_date BETWEEN :currentDate AND :futureDate', { 
      currentDate: new Date(), 
      futureDate 
    });
    return queryBuilder.getCount();
  }

  private async getSyncOverdueCount(filters: ListFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('list.auto_update = :autoUpdate', { autoUpdate: true });
    queryBuilder.andWhere('list.next_sync_date < :currentDate', { currentDate: new Date() });
    return queryBuilder.getCount();
  }

  private async getLowUtilizationCount(maxUtilization: number, filters: ListFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('list.total_entries > 0');
    queryBuilder.andWhere('(list.active_entries::float / list.total_entries::float * 100) <= :maxUtilization', { 
      maxUtilization 
    });
    return queryBuilder.getCount();
  }

  private async getAverageUtilizationRate(filters: ListFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select('AVG(CASE WHEN list.total_entries > 0 THEN (list.active_entries::float / list.total_entries::float * 100) ELSE 0 END)', 'avg_utilization');
    
    const result = await queryBuilder.getRawOne();
    return parseFloat(result.avg_utilization) || 0;
  }

  private async getAverageEntriesPerList(filters: ListFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select('AVG(list.total_entries)', 'avg_entries');
    
    const result = await queryBuilder.getRawOne();
    return parseFloat(result.avg_entries) || 0;
  }
}