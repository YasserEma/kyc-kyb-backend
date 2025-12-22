import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsInt, Min, Max, IsIn } from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * DTO for querying lists with filters and pagination
 */
export class ListQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (1-indexed)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filter by list type',
    example: 'custom',
    enum: ['whitelist', 'blacklist', 'greylist', 'watchlist', 'sanctions', 'pep', 'custom'],
  })
  @IsOptional()
  @IsString()
  list_type?: string;

  @ApiPropertyOptional({
    description: 'Filter by category',
    example: 'regulatory',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Search by list name',
    example: 'Nationalities',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'created_at',
    enum: ['list_name', 'list_type', 'created_at', 'updated_at'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['list_name', 'list_type', 'created_at', 'updated_at'])
  sort_by?: string = 'created_at';

  @ApiPropertyOptional({
    description: 'Sort direction',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sort_order?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({
    description: 'Include list values in response',
    example: false,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  include_values?: boolean = false;
}

/**
 * DTO for toggling status
 */
export class ToggleStatusDto {
  @ApiPropertyOptional({
    description: 'Set active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
