import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsInt, IsOptional, IsString, IsArray } from 'class-validator';

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
}