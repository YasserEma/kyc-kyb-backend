import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class IdentityDocumentDto {
  @ApiProperty({ description: 'ID type', example: 'PASSPORT' })
  @IsString()
  id_type!: string;

  @ApiProperty({ description: 'Nationality code (ISO alpha-2)', example: 'US' })
  @IsString()
  nationality!: string;

  @ApiProperty({ description: 'ID number' })
  @IsString()
  id_number!: string;

  @ApiPropertyOptional({ description: 'Expiry date (ISO date)' })
  @IsOptional()
  @IsDateString()
  expiry_date?: string;

  @ApiProperty({ description: 'Document file payload (base64 or multipart key)' })
  @IsString()
  file!: string;
}

export class CreateIndividualEntityDto {
  @ApiProperty({ description: 'Entity display name (full name)', example: 'John Doe' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Date of birth (ISO date)', example: '1990-01-01' })
  @IsDateString()
  date_of_birth!: string;

  @ApiProperty({ description: 'Nationality codes', type: [String], example: ['US'] })
  @IsArray()
  nationality!: string[];

  @ApiPropertyOptional({ description: 'Country of residence codes', type: [String], example: ['US'] })
  @IsOptional()
  @IsArray()
  country_of_residence?: string[];

  @ApiPropertyOptional({ description: 'Gender' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Occupation' })
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiPropertyOptional({ description: 'Identity documents', type: [IdentityDocumentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IdentityDocumentDto)
  identity_documents?: IdentityDocumentDto[];

  @ApiPropertyOptional({ description: 'Custom fields', type: 'array' })
  @IsOptional()
  @IsArray()
  custom_fields?: CustomFieldDto[];

  @ApiPropertyOptional({ description: 'Source of income' })
  @IsOptional()
  @IsString()
  source_of_income?: string;

  @ApiProperty({ description: 'Is Politically Exposed Person (PEP)', default: false })
  @IsBoolean()
  is_pep!: boolean;

  @ApiProperty({ description: 'Has criminal record', default: false })
  @IsBoolean()
  has_criminal_record!: boolean;

  @ApiPropertyOptional({ description: 'PEP details' })
  @IsOptional()
  @IsString()
  pep_details?: string;

  @ApiPropertyOptional({ description: 'Criminal record details' })
  @IsOptional()
  @IsString()
  criminal_record_details?: string;
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