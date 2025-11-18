import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  first_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  last_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

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
}