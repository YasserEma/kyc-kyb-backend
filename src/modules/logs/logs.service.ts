import { Injectable, NotFoundException } from '@nestjs/common';
import { LogRepository, ExtendedLogFilter } from './repositories/log.repository';
import { GetLogsQueryDto } from './dto/get-logs-query.dto';
import { FilterOptions } from '../common/interfaces/filter.interface';
import { PaginationOptions } from '../common/interfaces/pagination.interface';

@Injectable()
export class LogsService {
  constructor(private readonly logRepository: LogRepository) {}

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
