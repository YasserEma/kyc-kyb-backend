import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsString, IsOptional, IsNumber, Min, Max, IsDateString, IsBoolean } from 'class-validator';

export enum OrganizationRelationshipType {
  SUBSIDIARY = 'subsidiary',
  PARENT = 'parent',
  SISTER = 'sister',
  AFFILIATE = 'affiliate',
  JOINT_VENTURE = 'joint_venture',
  PARTNER = 'partner',
  SUPPLIER = 'supplier',
  CUSTOMER = 'customer',
  COMPETITOR = 'competitor',
  OTHER = 'other',
}

export class CreateOrganizationRelationshipDto {
  @ApiProperty({ description: 'Primary organization ID' })
  @IsNotEmpty()
  @IsUUID()
  primary_organization_id: string;

  @ApiProperty({ description: 'Related organization ID' })
  @IsNotEmpty()
  @IsUUID()
  related_organization_id: string;

  @ApiProperty({ 
    description: 'Type of relationship',
    enum: OrganizationRelationshipType,
    example: OrganizationRelationshipType.SUBSIDIARY
  })
  @IsNotEmpty()
  @IsString()
  relationship_type: OrganizationRelationshipType;

  @ApiPropertyOptional({ description: 'Ownership percentage (if applicable)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  ownership_percentage?: number;

  @ApiPropertyOptional({ description: 'Description of the relationship' })
  @IsOptional()
  @IsString()
  relationship_description?: string;

  @ApiProperty({ description: 'Effective from date' })
  @IsNotEmpty()
  @IsDateString()
  effective_from: Date;

  @ApiPropertyOptional({ description: 'Effective to date' })
  @IsOptional()
  @IsDateString()
  effective_to?: Date;

  @ApiPropertyOptional({ description: 'Whether the relationship is verified', default: false })
  @IsOptional()
  @IsBoolean()
  verified?: boolean;

  @ApiPropertyOptional({ description: 'User ID who created this relationship' })
  @IsOptional()
  @IsUUID()
  created_by?: string;
}