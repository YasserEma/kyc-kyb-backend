import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min, IsDateString, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ListEntitiesQueryDto {
  @ApiPropertyOptional({ description: 'Filter by entity type', enum: ['individual', 'organization'] })
  @IsOptional()
  @IsIn(['individual', 'organization'])
  entity_type?: 'individual' | 'organization';

  @ApiPropertyOptional({ description: 'Filter by single status (workflow state)', example: 'ACTIVE' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by multiple statuses (OR logic)', 
    type: [String], 
    example: ['ACTIVE', 'PENDING'],
    isArray: true
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',') : value))
  @IsArray()
  statuses?: string[];

  @ApiPropertyOptional({ description: 'Filter by risk level', example: 'HIGH' })
  @IsOptional()
  @IsString()
  risk_level?: string;

  @ApiPropertyOptional({ description: 'Filter by screening status', example: 'CLEAR' })
  @IsOptional()
  @IsString()
  screening_status?: string;

  @ApiPropertyOptional({ description: 'Filter by onboarding completed' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  onboarding_completed?: boolean;

  @ApiPropertyOptional({ description: 'Filter by entity name (partial match)' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Filter by reference number (exact match)' })
  @IsOptional()
  @IsString()
  reference_number?: string;

  @ApiPropertyOptional({ description: 'Full-text search across name, reference, address, occupation' })
  @IsOptional()
  @IsString()
  search?: string;

  // ENHANCED FILTERS

  @ApiPropertyOptional({ description: 'Filter by nationality code (ISO 3166-1 alpha-2)', example: 'SA' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({ description: 'Filter by multiple nationalities', type: [String], example: ['SA', 'AE'] })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',') : value))
  @IsArray()
  nationalities?: string[];

  @ApiPropertyOptional({ description: 'Filter by country of residence (ISO code)', example: 'SA' })
  @IsOptional()
  @IsString()
  country_of_residence?: string;

  @ApiPropertyOptional({ description: 'Filter by country of incorporation (organizations)', example: 'SA' })
  @IsOptional()
  @IsString()
  country_of_incorporation?: string;

  @ApiPropertyOptional({ description: 'Filter by PEP (Politically Exposed Person) status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  is_pep?: boolean;

  @ApiPropertyOptional({ description: 'Filter by criminal record status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  has_criminal_record?: boolean;

  @ApiPropertyOptional({ description: 'Filter entities that have at least one document' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  has_documents?: boolean;

  @ApiPropertyOptional({ description: 'Filter by organization type', example: 'CORPORATION' })
  @IsOptional()
  @IsString()
  organization_type?: string;

  @ApiPropertyOptional({ description: 'Filter by industry sector' })
  @IsOptional()
  @IsString()
  industry_sector?: string;

  @ApiPropertyOptional({ description: 'Filter entities created on or after this date (ISO format)', example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  created_from?: string;

  @ApiPropertyOptional({ description: 'Filter entities created on or before this date (ISO format)', example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  created_to?: string;

  @ApiPropertyOptional({ description: 'Filter entities onboarded on or after this date', example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  onboarded_from?: string;

  @ApiPropertyOptional({ description: 'Filter entities onboarded on or before this date', example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  onboarded_to?: string;

  @ApiPropertyOptional({ description: 'Filter entities screened on or after this date', example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  last_screened_from?: string;

  @ApiPropertyOptional({ description: 'Filter entities screened on or before this date', example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  last_screened_to?: string;

  // PAGINATION & SORTING

  @ApiPropertyOptional({ description: 'Page number', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ 
    description: 'Sort by column', 
    example: 'created_at',
    enum: ['created_at', 'updated_at', 'name', 'reference_number', 'status', 'risk_level', 'onboarded_at', 'last_screened_at']
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}