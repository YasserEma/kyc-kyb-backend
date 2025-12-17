import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsInt,
  IsString,
  IsEnum,
  IsUUID,
  IsBoolean,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class GetLogsQueryDto {
  // ========== PAGINATION ==========

  @ApiPropertyOptional({ description: 'Page number', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  // ========== SEARCH ==========

  @ApiPropertyOptional({ description: 'Text search across description, action_type, module, endpoint, error_message' })
  @IsOptional()
  @IsString()
  search?: string;

  // ========== FILTERS ==========

  @ApiPropertyOptional({ description: 'Filter by severity', enum: ['info', 'warning', 'error', 'critical'] })
  @IsOptional()
  @IsEnum(['info', 'warning', 'error', 'critical'])
  severity?: 'info' | 'warning' | 'error' | 'critical';

  @ApiPropertyOptional({ description: 'Filter by status', enum: ['success', 'failure', 'pending'] })
  @IsOptional()
  @IsEnum(['success', 'failure', 'pending'])
  status?: 'success' | 'failure' | 'pending';

  @ApiPropertyOptional({ description: 'Filter by user ID (UUID)' })
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @ApiPropertyOptional({ description: 'Filter by entity ID (UUID)' })
  @IsOptional()
  @IsUUID()
  entity_id?: string;

  @ApiPropertyOptional({ description: 'Filter by subscriber ID (UUID)' })
  @IsOptional()
  @IsUUID()
  subscriber_id?: string;

  @ApiPropertyOptional({ description: 'Filter by action type' })
  @IsOptional()
  @IsString()
  action_type?: string;

  @ApiPropertyOptional({ description: 'Filter by module' })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiPropertyOptional({ description: 'Filter by endpoint' })
  @IsOptional()
  @IsString()
  endpoint?: string;

  @ApiPropertyOptional({ description: 'Filter by HTTP method', enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] })
  @IsOptional()
  @IsString()
  http_method?: string;

  @ApiPropertyOptional({ description: 'Filter by correlation ID' })
  @IsOptional()
  @IsString()
  correlation_id?: string;

  @ApiPropertyOptional({ description: 'Filter by session ID' })
  @IsOptional()
  @IsString()
  session_id?: string;

  @ApiPropertyOptional({ description: 'Filter logs with errors only' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  has_error?: boolean;

  // ========== DATE RANGE ==========

  @ApiPropertyOptional({ description: 'Filter from date (ISO format)', example: '2024-01-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiPropertyOptional({ description: 'Filter to date (ISO format)', example: '2024-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  to_date?: string;

  // ========== DURATION RANGE ==========

  @ApiPropertyOptional({ description: 'Minimum duration in milliseconds' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  duration_min?: number;

  @ApiPropertyOptional({ description: 'Maximum duration in milliseconds' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  duration_max?: number;

  // ========== SORTING ==========

  @ApiPropertyOptional({
    description: 'Sort by column',
    enum: ['created_at', 'severity', 'status', 'action_type', 'duration_ms'],
    default: 'created_at',
  })
  @IsOptional()
  @IsString()
  sort_by?: string = 'created_at';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sort_order?: 'ASC' | 'DESC' = 'DESC';
}
