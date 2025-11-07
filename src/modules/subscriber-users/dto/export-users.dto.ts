import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class ExportUsersDto {
  @ApiPropertyOptional({ enum: ['csv', 'xlsx'], default: 'csv' })
  @IsOptional()
  @IsEnum(['csv', 'xlsx'])
  format?: 'csv' | 'xlsx' = 'csv';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: ['admin', 'manager', 'analyst', 'viewer'] })
  @IsOptional()
  @IsEnum(['admin', 'manager', 'analyst', 'viewer'])
  role?: 'admin' | 'manager' | 'analyst' | 'viewer';

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'pending', 'suspended'] })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'pending', 'suspended'])
  status?: 'active' | 'inactive' | 'pending' | 'suspended';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  job_title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  two_factor_enabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  email_verified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_locked?: boolean;
}