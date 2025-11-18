import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsInt, IsOptional, IsString, IsArray, ValidateNested, IsUUID, IsBoolean, IsNumber } from 'class-validator';

export class CreateOrganizationEntityDto {
  @ApiProperty({ description: 'Legal name of the organization' })
  @IsString()
  legal_name!: string;

  @ApiPropertyOptional({ description: 'Trade name of the organization' })
  @IsOptional()
  @IsString()
  trade_name?: string;

  @ApiProperty({ description: 'Country of incorporation (ISO code)' })
  @IsString()
  country_of_incorporation!: string;

  @ApiProperty({ description: 'Date of incorporation (ISO date)' })
  @IsDateString()
  date_of_incorporation!: string;

  @ApiPropertyOptional({ description: 'Organization type' })
  @IsOptional()
  @IsString()
  organization_type?: string;

  @ApiPropertyOptional({ description: 'Legal structure' })
  @IsOptional()
  @IsString()
  legal_structure?: string;

  @ApiPropertyOptional({ description: 'Tax identification number' })
  @IsOptional()
  @IsString()
  tax_identification_number?: string;

  @ApiPropertyOptional({ description: 'Commercial registration number' })
  @IsOptional()
  @IsString()
  commercial_registration_number?: string;

  @ApiPropertyOptional({ description: 'Registered address' })
  @IsOptional()
  @IsString()
  registered_address?: string;

  @ApiPropertyOptional({ description: 'Operating address' })
  @IsOptional()
  @IsString()
  operating_address?: string;

  @ApiPropertyOptional({ description: 'Contact email' })
  @IsOptional()
  @IsEmail()
  contact_email?: string;

  @ApiPropertyOptional({ description: 'Contact phone' })
  @IsOptional()
  @IsString()
  contact_phone?: string;

  @ApiPropertyOptional({ description: 'Industry sector' })
  @IsOptional()
  @IsString()
  industry_sector?: string;

  @ApiPropertyOptional({ description: 'Number of employees' })
  @IsOptional()
  @IsInt()
  number_of_employees?: number;

  @ApiPropertyOptional({ description: 'Annual revenue (string or formatted decimal)' })
  @IsOptional()
  @IsString()
  annual_revenue?: string;

  @ApiProperty({ description: 'Entity display name (used for base entity record)' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Custom fields', type: 'array' })
  @IsOptional()
  @IsArray()
  custom_fields?: CustomFieldDto[];

  }

export class CustomFieldDto {
  @ApiProperty({ description: 'Field name' })
  @IsString()
  field_name!: string;

  @ApiPropertyOptional({ description: 'Field type', example: 'text' })
  @IsOptional()
  @IsString()
  field_type?: string;

  @ApiPropertyOptional({ description: 'Field value as string' })
  @IsOptional()
  @IsString()
  field_value?: string;

  @ApiPropertyOptional({ description: 'Field value as JSON' })
  @IsOptional()
  field_value_json?: any;

  @ApiPropertyOptional({ description: 'Field group name' })
  @IsOptional()
  @IsString()
  field_group?: string;

  @ApiPropertyOptional({ description: 'Is required' })
  @IsOptional()
  is_required?: boolean;

  @ApiPropertyOptional({ description: 'Is searchable' })
  @IsOptional()
  is_searchable?: boolean;

  @ApiPropertyOptional({ description: 'Is visible' })
  @IsOptional()
  is_visible?: boolean;

  @ApiPropertyOptional({ description: 'Is editable' })
  @IsOptional()
  is_editable?: boolean;

  @ApiPropertyOptional({ description: 'Is encrypted' })
  @IsOptional()
  is_encrypted?: boolean;

  @ApiPropertyOptional({ description: 'Is PII' })
  @IsOptional()
  is_pii?: boolean;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  display_order?: number;
}