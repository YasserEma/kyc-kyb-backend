import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateEntityDto {
  @ApiPropertyOptional({ description: 'Entity name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Risk level' })
  @IsOptional()
  @IsString()
  risk_level?: string;

  @ApiPropertyOptional({ description: 'Screening status' })
  @IsOptional()
  @IsString()
  screening_status?: string;

  @ApiPropertyOptional({ description: 'Onboarding completed flag' })
  @IsOptional()
  @IsBoolean()
  onboarding_completed?: boolean;
}