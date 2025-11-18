import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsDateString, IsOptional, IsNumber, IsBoolean, IsEnum } from 'class-validator';

export enum IndividualRelationshipType {
  FAMILY = 'family',
  BUSINESS = 'business',
  FINANCIAL = 'financial',
  LEGAL = 'legal',
  PERSONAL = 'personal',
  EMPLOYMENT = 'employment',
  DIRECTORSHIP = 'directorship',
  OWNERSHIP = 'ownership',
  PARTNERSHIP = 'partnership',
  TRUST = 'trust',
  OTHER = 'other'
}

export enum IndividualRelationshipStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  TERMINATED = 'terminated',
  SUSPENDED = 'suspended'
}

export class CreateIndividualRelationshipDto {
  @ApiProperty({ description: 'ID of the primary individual in the relationship' })
  @IsUUID()
  primary_individual_id: string;

  @ApiProperty({ description: 'ID of the related individual in the relationship' })
  @IsUUID()
  related_individual_id: string;

  @ApiProperty({ 
    description: 'Type of relationship between individuals',
    enum: IndividualRelationshipType,
    example: IndividualRelationshipType.FAMILY
  })
  @IsEnum(IndividualRelationshipType)
  relationship_type: IndividualRelationshipType;

  @ApiProperty({ description: 'Description of the relationship', required: false })
  @IsOptional()
  @IsString()
  relationship_description?: string;

  @ApiProperty({ 
    description: 'Status of the relationship',
    enum: IndividualRelationshipStatus,
    example: IndividualRelationshipStatus.ACTIVE,
    required: false
  })
  @IsOptional()
  @IsEnum(IndividualRelationshipStatus)
  relationship_status?: IndividualRelationshipStatus;

  @ApiProperty({ description: 'Date when the relationship becomes effective', required: false })
  @IsOptional()
  @IsDateString()
  effective_from?: Date;

  @ApiProperty({ description: 'Date when the relationship ends (if applicable)', required: false })
  @IsOptional()
  @IsDateString()
  effective_to?: Date;

  @ApiProperty({ description: 'Start date of the relationship', required: false })
  @IsOptional()
  @IsDateString()
  relationship_start_date?: Date;

  @ApiProperty({ description: 'End date of the relationship (if applicable)', required: false })
  @IsOptional()
  @IsDateString()
  relationship_end_date?: Date;

  @ApiProperty({ description: 'Whether this individual is the primary party in the relationship', required: false })
  @IsOptional()
  @IsBoolean()
  is_primary?: boolean;

  @ApiProperty({ description: 'Whether the relationship is reciprocal', required: false })
  @IsOptional()
  @IsBoolean()
  is_reciprocal?: boolean;

  @ApiProperty({ description: 'Whether the relationship involves a PEP (Politically Exposed Person)', required: false })
  @IsOptional()
  @IsBoolean()
  is_pep_related?: boolean;

  @ApiProperty({ description: 'Whether the relationship involves sanctions', required: false })
  @IsOptional()
  @IsBoolean()
  is_sanctions_related?: boolean;

  @ApiProperty({ description: 'Whether enhanced due diligence is required', required: false })
  @IsOptional()
  @IsBoolean()
  requires_enhanced_due_diligence?: boolean;

  @ApiProperty({ description: 'Risk level assessment for the relationship', required: false })
  @IsOptional()
  @IsString()
  risk_level?: string;

  @ApiProperty({ description: 'Factors contributing to the risk assessment', required: false })
  @IsOptional()
  @IsString()
  risk_factors?: string;

  @ApiProperty({ description: 'Whether the relationship is considered high risk', required: false })
  @IsOptional()
  @IsBoolean()
  is_high_risk?: boolean;

  @ApiProperty({ description: 'Date for next review of the relationship', required: false })
  @IsOptional()
  @IsDateString()
  next_review_date?: Date;

  @ApiProperty({ description: 'Ownership percentage (if applicable)', required: false })
  @IsOptional()
  @IsNumber()
  ownership_percentage?: number;

  @ApiProperty({ description: 'Legal basis for the relationship', required: false })
  @IsOptional()
  @IsString()
  legal_basis?: string;

  @ApiProperty({ description: 'Additional notes about the relationship', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}