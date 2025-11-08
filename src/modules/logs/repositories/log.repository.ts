import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder , IsNull} from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { LogEntity } from '../entities/log.entity';
import { PaginationOptions, PaginationResult } from '../../common/interfaces/pagination.interface';
import { LogFilter, FilterOptions } from '../../common/interfaces/filter.interface';
import { QueryHelper } from '../../../utils/database/query.helper';

export interface ExtendedLogFilter extends LogFilter {
  entity_id?: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  status?: 'success' | 'failure' | 'pending';
  module?: string;
  function_name?: string;
  endpoint?: string;
  http_method?: string;
  http_status_code?: number;
  has_error?: boolean;
  correlation_id?: string;
  session_id?: string;
  tags?: string[];
  duration_min?: number;
  duration_max?: number;
}

@Injectable()
export class LogRepository extends BaseRepository<LogEntity> {
  constructor(
    @InjectRepository(LogEntity)
    private readonly logRepository: Repository<LogEntity>,
  ) {
    super(logRepository);
  }

  /**
   * Find logs with advanced filtering and pagination
   */
  async findWithFilters(
    filters: ExtendedLogFilter = {},
    options: FilterOptions = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginationResult<LogEntity>> {
    const queryBuilder = this.createFilteredQuery(filters, options);
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  /**
   * Find logs by correlation ID
   */
  async findByCorrelationId(correlationId: string): Promise<LogEntity[]> {
    return this.logRepository.find({
      where: { 
        correlation_id: correlationId,
        is_active: true,
        deleted_at: IsNull()
      },
      order: { created_at: 'ASC' },
      relations: ['user', 'entity']
    });
  }

  /**
   * Find error logs
   */
  async findErrorLogs(
    subscriberId?: string,
    limit: number = 100
  ): Promise<LogEntity[]> {
    const queryBuilder = this.logRepository
      .createQueryBuilder('log')
      .where('log.severity IN (:...severities)', { severities: ['error', 'critical'] })
      .orWhere('log.status = :status', { status: 'failure' })
      .andWhere('log.is_active = :isActive', { isActive: true })
      .andWhere('log.deleted_at IS NULL')
      .orderBy('log.created_at', 'DESC')
      .limit(limit);

    if (subscriberId) {
      queryBuilder.andWhere('log.subscriber_id = :subscriberId', { subscriberId });
    }

    return queryBuilder.getMany();
  }

  /**
   * Find recent activity logs
   */
  async findRecentActivity(
    subscriberId: string,
    hours: number = 24,
    limit: number = 50
  ): Promise<LogEntity[]> {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    return this.logRepository.find({
      where: {
        subscriber_id: subscriberId,
        created_at: { $gte: since } as any,
        is_active: true,
        deleted_at: IsNull()
      },
      order: { created_at: 'DESC' },
      take: limit,
      relations: ['user', 'entity']
    });
  }

  /**
   * Get log statistics
   */
  async getLogStats(
    subscriberId?: string,
    fromDate?: Date,
    toDate?: Date
  ): Promise<{
    total: number;
    bySeverity: Record<string, number>;
    byStatus: Record<string, number>;
    byActionType: Record<string, number>;
    errorRate: number;
    avgDuration: number;
  }> {
    const queryBuilder = this.logRepository.createQueryBuilder('log');
    
    queryBuilder.where('log.is_active = :isActive', { isActive: true });
    queryBuilder.andWhere('log.deleted_at IS NULL');

    if (subscriberId) {
      queryBuilder.andWhere('log.subscriber_id = :subscriberId', { subscriberId });
    }

    if (fromDate) {
      queryBuilder.andWhere('log.created_at >= :fromDate', { fromDate });
    }

    if (toDate) {
      queryBuilder.andWhere('log.created_at <= :toDate', { toDate });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Get stats by severity
    const severityStats = await queryBuilder
      .clone()
      .select('log.severity', 'severity')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.severity')
      .getRawMany();

    // Get stats by status
    const statusStats = await queryBuilder
      .clone()
      .select('log.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.status')
      .getRawMany();

    // Get stats by action type
    const actionTypeStats = await queryBuilder
      .clone()
      .select('log.action_type', 'action_type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.action_type')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // Get error count
    const errorCount = await queryBuilder
      .clone()
      .where('log.severity IN (:...severities)', { severities: ['error', 'critical'] })
      .orWhere('log.status = :status', { status: 'failure' })
      .getCount();

    // Get average duration
    const durationResult = await queryBuilder
      .clone()
      .select('AVG(log.duration_ms)', 'avg_duration')
      .where('log.duration_ms IS NOT NULL')
      .getRawOne();

    const bySeverity = severityStats.reduce((acc, stat) => {
      acc[stat.severity] = parseInt(stat.count);
      return acc;
    }, {});

    const byStatus = statusStats.reduce((acc, stat) => {
      acc[stat.status] = parseInt(stat.count);
      return acc;
    }, {});

    const byActionType = actionTypeStats.reduce((acc, stat) => {
      acc[stat.action_type] = parseInt(stat.count);
      return acc;
    }, {});

    return {
      total,
      bySeverity,
      byStatus,
      byActionType,
      errorRate: total > 0 ? (errorCount / total) * 100 : 0,
      avgDuration: parseFloat(durationResult?.avg_duration || '0')
    };
  }

  /**
   * Create audit log entry
   */
  async createAuditLog(data: {
    subscriber_id: string;
    user_id?: string;
    entity_id?: string;
    action_type: string;
    description: string;
    severity?: 'info' | 'warning' | 'error' | 'critical';
    status?: 'success' | 'failure' | 'pending';
    metadata?: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
    session_id?: string;
    correlation_id?: string;
  }): Promise<LogEntity> {
    const log = this.logRepository.create({
      ...data,
      severity: data.severity || 'info',
      status: data.status || 'success'
    });

    return this.logRepository.save(log);
  }

  /**
   * Cleanup old logs
   */
  async cleanupOldLogs(retentionDays: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.logRepository
      .createQueryBuilder()
      .delete()
      .where('created_at < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }

  /**
   * Create filtered query builder
   */
  private createFilteredQuery(
    filters: ExtendedLogFilter,
    options: FilterOptions
  ): SelectQueryBuilder<LogEntity> {
    const queryBuilder = this.logRepository.createQueryBuilder('log');

    // Apply base filters
    QueryHelper.applyBaseFilters(queryBuilder, filters, 'log');
    QueryHelper.applySoftDeleteFilter(queryBuilder, 'log');

    // Apply specific filters
    if (filters.subscriber_id) {
      queryBuilder.andWhere('log.subscriber_id = :subscriberId', { 
        subscriberId: filters.subscriber_id 
      });
    }

    if (filters.user_id) {
      queryBuilder.andWhere('log.user_id = :userId', { userId: filters.user_id });
    }

    if (filters.entity_id) {
      queryBuilder.andWhere('log.entity_id = :entityId', { entityId: filters.entity_id });
    }

    if (filters.action_type) {
      queryBuilder.andWhere('log.action_type = :actionType', { actionType: filters.action_type });
    }

    if (filters.severity) {
      queryBuilder.andWhere('log.severity = :severity', { severity: filters.severity });
    }

    if (filters.status) {
      queryBuilder.andWhere('log.status = :status', { status: filters.status });
    }

    if (filters.module) {
      queryBuilder.andWhere('log.module = :module', { module: filters.module });
    }

    if (filters.function_name) {
      queryBuilder.andWhere('log.function_name = :functionName', { functionName: filters.function_name });
    }

    if (filters.endpoint) {
      queryBuilder.andWhere('log.endpoint ILIKE :endpoint', { 
        endpoint: QueryHelper.buildLikeQuery(filters.endpoint) 
      });
    }

    if (filters.http_method) {
      queryBuilder.andWhere('log.http_method = :httpMethod', { httpMethod: filters.http_method });
    }

    if (filters.http_status_code) {
      queryBuilder.andWhere('log.http_status_code = :httpStatusCode', { 
        httpStatusCode: filters.http_status_code 
      });
    }

    if (filters.correlation_id) {
      queryBuilder.andWhere('log.correlation_id = :correlationId', { 
        correlationId: filters.correlation_id 
      });
    }

    if (filters.session_id) {
      queryBuilder.andWhere('log.session_id = :sessionId', { sessionId: filters.session_id });
    }

    if (filters.has_error !== undefined) {
      if (filters.has_error) {
        queryBuilder.andWhere(
          '(log.severity IN (:...errorSeverities) OR log.status = :failureStatus OR log.error_code IS NOT NULL)',
          { errorSeverities: ['error', 'critical'], failureStatus: 'failure' }
        );
      } else {
        queryBuilder.andWhere(
          '(log.severity NOT IN (:...errorSeverities) AND log.status != :failureStatus AND log.error_code IS NULL)',
          { errorSeverities: ['error', 'critical'], failureStatus: 'failure' }
        );
      }
    }

    if (filters.duration_min !== undefined) {
      queryBuilder.andWhere('log.duration_ms >= :durationMin', { durationMin: filters.duration_min });
    }

    if (filters.duration_max !== undefined) {
      queryBuilder.andWhere('log.duration_ms <= :durationMax', { durationMax: filters.duration_max });
    }

    if (filters.tags && filters.tags.length > 0) {
      queryBuilder.andWhere('log.tags && :tags', { tags: filters.tags });
    }

    // Apply search
    if (options.search) {
      QueryHelper.applySearch(
        queryBuilder,
        options.search,
        ['description', 'action_type', 'module', 'function_name', 'endpoint', 'error_message'],
        'log'
      );
    }

    // Apply sorting
    QueryHelper.applySorting(
      queryBuilder,
      options,
      'log',
      ['created_at', 'severity', 'status', 'action_type', 'duration_ms']
    );

    return queryBuilder;
  }
}