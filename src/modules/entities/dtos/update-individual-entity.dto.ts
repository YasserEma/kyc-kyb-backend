import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsArray, IsBoolean } from 'class-validator';

/**
 * DTO for updating individual entity profile details
 * All fields are optional - only provided fields will be updated
 */
export class UpdateIndividualEntityDto {
  @ApiPropertyOptional({ description: 'Entity display name (full name)', example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Date of birth (ISO date)', example: '1990-01-01' })
  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @ApiPropertyOptional({ description: 'Nationality codes (ISO 3166-1 alpha-2)', type: [String], example: ['SA', 'US'] })
  @IsOptional()
  @IsArray()
  nationality?: string[];

  @ApiPropertyOptional({ description: 'Country of residence codes', type: [String], example: ['SA'] })
  @IsOptional()
  @IsArray()
  country_of_residence?: string[];

  @ApiPropertyOptional({ description: 'Gender', enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'] })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ description: 'Current residential address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Current occupation or profession' })
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiPropertyOptional({ description: 'Primary source of income' })
  @IsOptional()
  @IsString()
  source_of_income?: string;

  @ApiPropertyOptional({ description: 'Is Politically Exposed Person (PEP)' })
  @IsOptional()
  @IsBoolean()
  is_pep?: boolean;

  @ApiPropertyOptional({ description: 'PEP details (required if is_pep is true)' })
  @IsOptional()
  @IsString()
  pep_details?: string;

  @ApiPropertyOptional({ description: 'Has criminal record' })
  @IsOptional()
  @IsBoolean()
  has_criminal_record?: boolean;

  @ApiPropertyOptional({ description: 'Criminal record details (required if has_criminal_record is true)' })
  @IsOptional()
  @IsString()
  criminal_record_details?: string;

  // Entity-level fields that can also be updated
  @ApiPropertyOptional({ description: 'Risk level', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  @IsOptional()
  @IsString()
  risk_level?: string;

  @ApiPropertyOptional({ description: 'Screening status', enum: ['CLEAR', 'MATCH', 'PENDING_REVIEW', 'APPROVED', 'REJECTED'] })
  @IsOptional()
  @IsString()
  screening_status?: string;

  @ApiPropertyOptional({ description: 'Onboarding completed flag' })
  @IsOptional()
  @IsBoolean()
  onboarding_completed?: boolean;
}
