import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListEntitiesQueryDto {
  @ApiPropertyOptional({ description: 'Filter by entity type', enum: ['individual', 'organization'] })
  @IsOptional()
  @IsIn(['individual', 'organization'])
  entity_type?: 'individual' | 'organization';

  @ApiPropertyOptional({ description: 'Filter by status (workflow state)' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by risk level' })
  @IsOptional()
  @IsString()
  risk_level?: string;

  @ApiPropertyOptional({ description: 'Filter by screening status' })
  @IsOptional()
  @IsString()
  screening_status?: string;

  @ApiPropertyOptional({ description: 'Filter by onboarding completed' })
  @IsOptional()
  @IsBoolean()
  onboarding_completed?: boolean;

  @ApiPropertyOptional({ description: 'Filter by entity name (exact match)' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Filter by reference number (exact match)' })
  @IsOptional()
  @IsString()
  reference_number?: string;

  @ApiPropertyOptional({ description: 'Text search across key fields' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Sort by column', example: 'created_at' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}