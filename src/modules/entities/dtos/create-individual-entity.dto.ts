import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional, IsString, IsUUID, IsArray } from 'class-validator';

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

  @ApiPropertyOptional({ description: 'National ID number' })
  @IsOptional()
  @IsString()
  national_id?: string;

  @ApiPropertyOptional({ description: 'ID type (passport, national_id, etc.)' })
  @IsOptional()
  @IsString()
  id_type?: string;

  @ApiPropertyOptional({ description: 'ID expiry date (ISO date)' })
  @IsOptional()
  @IsDateString()
  id_expiry_date?: string;

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