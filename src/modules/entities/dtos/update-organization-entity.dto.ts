import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsNumber, IsBoolean, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for updating organization entity profile details
 * All fields are optional - only provided fields will be updated
 */
export class UpdateOrganizationEntityDto {
  @ApiPropertyOptional({ description: 'Entity display name', example: 'Acme Corporation' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Official registered legal name' })
  @IsOptional()
  @IsString()
  legal_name?: string;

  @ApiPropertyOptional({ description: 'Trading name or DBA (Doing Business As)' })
  @IsOptional()
  @IsString()
  trade_name?: string;

  @ApiPropertyOptional({ description: 'Country of incorporation (ISO 3166-1 alpha-2)', example: 'SA' })
  @IsOptional()
  @IsString()
  country_of_incorporation?: string;

  @ApiPropertyOptional({ description: 'Date of incorporation (ISO date)', example: '2015-06-01' })
  @IsOptional()
  @IsDateString()
  date_of_incorporation?: string;

  @ApiPropertyOptional({ 
    description: 'Organization type', 
    enum: ['CORPORATION', 'LLC', 'PARTNERSHIP', 'SOLE_PROPRIETORSHIP', 'NGO', 'TRUST', 'FOUNDATION', 'GOVERNMENT', 'OTHER'] 
  })
  @IsOptional()
  @IsString()
  organization_type?: string;

  @ApiPropertyOptional({ description: 'Detailed legal structure information' })
  @IsOptional()
  @IsString()
  legal_structure?: string;

  @ApiPropertyOptional({ description: 'Tax identification number (encrypted)' })
  @IsOptional()
  @IsString()
  tax_identification_number?: string;

  @ApiPropertyOptional({ description: 'Commercial registration number' })
  @IsOptional()
  @IsString()
  commercial_registration_number?: string;

  @ApiPropertyOptional({ description: 'Official registered address' })
  @IsOptional()
  @IsString()
  registered_address?: string;

  @ApiPropertyOptional({ description: 'Actual operating/business address' })
  @IsOptional()
  @IsString()
  operating_address?: string;

  @ApiPropertyOptional({ description: 'Primary business contact email' })
  @IsOptional()
  @IsEmail()
  contact_email?: string;

  @ApiPropertyOptional({ description: 'Primary business contact phone' })
  @IsOptional()
  @IsString()
  contact_phone?: string;

  @ApiPropertyOptional({ description: 'Business sector/industry classification' })
  @IsOptional()
  @IsString()
  industry_sector?: string;

  @ApiPropertyOptional({ description: 'Number of employees', example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  number_of_employees?: number;

  @ApiPropertyOptional({ description: 'Annual revenue in base currency', example: 1000000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  annual_revenue?: number;

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
