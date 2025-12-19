import { Injectable, NotFoundException } from '@nestjs/common';
import { LogRepository, ExtendedLogFilter } from './repositories/log.repository';
import { GetLogsQueryDto } from './dto/get-logs-query.dto';
import { FilterOptions } from '../common/interfaces/filter.interface';
import { PaginationOptions } from '../common/interfaces/pagination.interface';
import { LogEntity } from './entities/log.entity';

export interface CreateLogDto {
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
  module?: string;
  function_name?: string;
  endpoint?: string;
  http_method?: string;
  http_status_code?: number;
  duration_ms?: number;
  error_code?: string;
  error_message?: string;
}

@Injectable()
export class LogsService {
  constructor(private readonly logRepository: LogRepository) {}

  /**
   * Create a new log entry
   */
  async createLog(data: CreateLogDto): Promise<LogEntity> {
    return this.logRepository.createAuditLog(data);
  }

  /**
   * Log entity-related actions (create, update, delete, status change)
   */
  async logEntityAction(params: {
    subscriberId: string;
    userId: string;
    entityId: string;
    actionType: 'ENTITY_CREATED' | 'ENTITY_UPDATED' | 'ENTITY_DELETED' | 'ENTITY_STATUS_CHANGED' | 'ENTITY_VERIFIED' | 'ENTITY_REJECTED';
    entityType: 'individual' | 'organization';
    entityName?: string;
    description?: string;
    metadata?: Record<string, any>;
    status?: 'success' | 'failure';
  }): Promise<LogEntity> {
    const { subscriberId, userId, entityId, actionType, entityType, entityName, description, metadata, status } = params;
    
    const defaultDescription = this.getEntityActionDescription(actionType, entityType, entityName);
    
    return this.createLog({
      subscriber_id: subscriberId,
      user_id: userId,
      entity_id: entityId,
      action_type: actionType,
      description: description || defaultDescription,
      severity: 'info',
      status: status || 'success',
      metadata: {
        entity_type: entityType,
        entity_name: entityName,
        ...metadata,
      },
      module: 'entities',
      function_name: actionType.toLowerCase(),
    });
  }

  /**
   * Log authentication-related actions
   */
  async logAuthAction(params: {
    subscriberId: string;
    userId?: string;
    actionType: 'USER_REGISTERED' | 'USER_LOGIN' | 'USER_LOGIN_FAILED' | 'USER_LOGOUT' | 'PASSWORD_RESET_REQUESTED' | 'PASSWORD_RESET_COMPLETED' | 'TOKEN_REFRESHED';
    email?: string;
    description?: string;
    metadata?: Record<string, any>;
    status?: 'success' | 'failure';
    ipAddress?: string;
    userAgent?: string;
  }): Promise<LogEntity> {
    const { subscriberId, userId, actionType, email, description, metadata, status, ipAddress, userAgent } = params;
    
    const defaultDescription = this.getAuthActionDescription(actionType, email);
    
    return this.createLog({
      subscriber_id: subscriberId,
      user_id: userId,
      action_type: actionType,
      description: description || defaultDescription,
      severity: actionType === 'USER_LOGIN_FAILED' ? 'warning' : 'info',
      status: status || 'success',
      metadata: {
        email,
        ...metadata,
      },
      module: 'auth',
      function_name: actionType.toLowerCase(),
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  }

  /**
   * Log system/general actions
   */
  async logSystemAction(params: {
    subscriberId: string;
    userId?: string;
    actionType: string;
    description: string;
    metadata?: Record<string, any>;
    severity?: 'info' | 'warning' | 'error' | 'critical';
    status?: 'success' | 'failure';
    module?: string;
  }): Promise<LogEntity> {
    return this.createLog({
      subscriber_id: params.subscriberId,
      user_id: params.userId,
      action_type: params.actionType,
      description: params.description,
      severity: params.severity || 'info',
      status: params.status || 'success',
      metadata: params.metadata,
      module: params.module || 'system',
    });
  }

  private getEntityActionDescription(actionType: string, entityType: string, entityName?: string): string {
    const name = entityName || 'Unknown';
    switch (actionType) {
      case 'ENTITY_CREATED':
        return `Created new ${entityType} entity: ${name}`;
      case 'ENTITY_UPDATED':
        return `Updated ${entityType} entity: ${name}`;
      case 'ENTITY_DELETED':
        return `Deleted ${entityType} entity: ${name}`;
      case 'ENTITY_STATUS_CHANGED':
        return `Changed status of ${entityType} entity: ${name}`;
      case 'ENTITY_VERIFIED':
        return `Verified ${entityType} entity: ${name}`;
      case 'ENTITY_REJECTED':
        return `Rejected ${entityType} entity: ${name}`;
      default:
        return `${actionType} on ${entityType} entity: ${name}`;
    }
  }

  private getAuthActionDescription(actionType: string, email?: string): string {
    switch (actionType) {
      case 'USER_REGISTERED':
        return `New user registered: ${email || 'unknown'}`;
      case 'USER_LOGIN':
        return `User logged in: ${email || 'unknown'}`;
      case 'USER_LOGIN_FAILED':
        return `Failed login attempt: ${email || 'unknown'}`;
      case 'USER_LOGOUT':
        return `User logged out: ${email || 'unknown'}`;
      case 'PASSWORD_RESET_REQUESTED':
        return `Password reset requested for: ${email || 'unknown'}`;
      case 'PASSWORD_RESET_COMPLETED':
        return `Password reset completed for: ${email || 'unknown'}`;
      case 'TOKEN_REFRESHED':
        return `Token refreshed for: ${email || 'unknown'}`;
      default:
        return `${actionType}: ${email || 'unknown'}`;
    }
  }

  /**
   * Find all logs with filters and pagination
   */
  async findAll(subscriberId: string, query: GetLogsQueryDto) {
    // Build ExtendedLogFilter
    const filters: ExtendedLogFilter = {
      subscriber_id: query.subscriber_id || subscriberId,
      user_id: query.user_id,
      entity_id: query.entity_id,
      action_type: query.action_type,
      severity: query.severity,
      status: query.status,
      module: query.module,
      endpoint: query.endpoint,
      http_method: query.http_method,
      correlation_id: query.correlation_id,
      session_id: query.session_id,
      has_error: query.has_error,
      duration_min: query.duration_min,
      duration_max: query.duration_max,
      created_at_from: query.from_date ? new Date(query.from_date) : undefined,
      created_at_to: query.to_date ? new Date(query.to_date) : undefined,
    };

    // Build FilterOptions
    const options: FilterOptions = {
      search: query.search,
      sort_by: query.sort_by,
      sort_order: query.sort_order,
    };

    // Build PaginationOptions
    const pagination: PaginationOptions = {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    };

    return this.logRepository.findWithFilters(filters, options, pagination);
  }

  /**
   * Get log statistics
   */
  async getStats(subscriberId: string, query: GetLogsQueryDto) {
    const fromDate = query.from_date ? new Date(query.from_date) : undefined;
    const toDate = query.to_date ? new Date(query.to_date) : undefined;
    const targetSubscriberId = query.subscriber_id || subscriberId;

    return this.logRepository.getLogStats(targetSubscriberId, fromDate, toDate);
  }

  /**
   * Find a single log by ID
   */
  async findOne(subscriberId: string, id: string) {
    const log = await this.logRepository.findOne({
      where: {
        id,
        subscriber_id: subscriberId,
        is_active: true,
      } as any,
      relations: ['user', 'entity'],
    });

    if (!log) {
      throw new NotFoundException(`Log with ID ${id} not found`);
    }

    return log;
  }

  /**
   * Find logs by correlation ID
   */
  async findByCorrelationId(correlationId: string) {
    return this.logRepository.findByCorrelationId(correlationId);
  }

  /**
   * Find error logs
   */
  async findErrorLogs(subscriberId: string, limit: number = 100) {
    return this.logRepository.findErrorLogs(subscriberId, limit);
  }

  /**
   * Find recent activity logs
   */
  async findRecentActivity(subscriberId: string, hours: number = 24, limit: number = 50) {
    return this.logRepository.findRecentActivity(subscriberId, hours, limit);
  }
}

