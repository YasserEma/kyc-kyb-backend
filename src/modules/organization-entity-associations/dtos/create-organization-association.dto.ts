import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsDateString, IsNumber, Min, Max } from 'class-validator';

export class CreateOrganizationAssociationDto {
  @ApiProperty({ description: 'Organization ID (entity_id)', example: 'org-entity-uuid' })
  @IsString()
  organization_id: string;

  @ApiProperty({ description: 'Individual ID (entity_id)', example: 'individual-entity-uuid' })
  @IsString()
  individual_id: string;

  @ApiProperty({ 
    description: 'Relationship type', 
    enum: ['director', 'shareholder', 'beneficial_owner', 'authorized_signatory', 'employee', 'agent', 'trustee', 'partner', 'manager'],
    example: 'director'
  })
  @IsEnum(['director', 'shareholder', 'beneficial_owner', 'authorized_signatory', 'employee', 'agent', 'trustee', 'partner', 'manager'])
  relationship_type: string;

  @ApiProperty({ description: 'Ownership percentage (for shareholders)', example: 25.5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  ownership_percentage?: number;

  @ApiProperty({ description: 'Role description', example: 'Chief Executive Officer', required: false })
  @IsOptional()
  @IsString()
  role_description?: string;

  @ApiProperty({ description: 'Start date of relationship', example: '2020-01-15', required: false })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiProperty({ description: 'End date of relationship', example: '2023-12-31', required: false })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiProperty({ description: 'Is this person currently active in this role?', example: true, required: false })
  @IsOptional()
  is_active?: boolean;

  @ApiProperty({ description: 'Additional notes about the relationship', example: 'Primary contact for compliance matters', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}