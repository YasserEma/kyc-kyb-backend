import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class ExportEntitiesDto {
  @ApiPropertyOptional({ description: 'Export format', enum: ['csv', 'xlsx'], default: 'csv' })
  @IsOptional()
  @IsIn(['csv', 'xlsx'])
  format?: 'csv' | 'xlsx' = 'csv';

  @ApiPropertyOptional({ description: 'Filter by entity type', enum: ['individual', 'organization'] })
  @IsOptional()
  @IsIn(['individual', 'organization'])
  entity_type?: 'individual' | 'organization';

  @ApiPropertyOptional({ description: 'Filter by status' })
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

  @ApiPropertyOptional({ description: 'Text search' })
  @IsOptional()
  @IsString()
  search?: string;
}