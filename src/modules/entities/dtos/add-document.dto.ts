import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class AddDocumentDto {
  @ApiProperty({ description: 'Document type', example: 'PASSPORT' })
  @IsString()
  document_type!: string;

  @ApiProperty({ description: 'Document name/title', example: 'Passport Document' })
  @IsString()
  document_name!: string;

  @ApiProperty({ description: 'Document number', example: 'A12345678' })
  @IsString()
  @IsOptional()
  document_number?: string;

  @ApiPropertyOptional({ description: 'Expiry date (ISO date)', example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  expiry_date?: string;

  @ApiPropertyOptional({ description: 'Issuing authority', example: 'Department of State' })
  @IsOptional()
  @IsString()
  issuing_authority?: string;

  @ApiPropertyOptional({ description: 'Issuing country code (ISO alpha-2)', example: 'US' })
  @IsOptional()
  @IsString()
  issuing_country?: string;

  @ApiPropertyOptional({ description: 'Document file payload (base64); optional when multipart upload is used' })
  @IsOptional()
  @IsString()
  file?: string;

  @ApiPropertyOptional({ description: 'Original file name for base64 uploads', example: 'document.pdf' })
  @IsOptional()
  @IsString()
  original_file_name?: string;

  @ApiPropertyOptional({ description: 'MIME type', example: 'application/pdf' })
  @IsOptional()
  @IsString()
  mime_type?: string;

  @ApiPropertyOptional({ description: 'Document description', example: 'Customer identification document' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Issue date (ISO date)', example: '2023-01-15' })
  @IsOptional()
  @IsDateString()
  issue_date?: string;

  @ApiPropertyOptional({ description: 'Document category', example: 'identity' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Document section/group for organization', example: 'compliance_documents' })
  @IsOptional()
  @IsString()
  section?: string;

  @ApiPropertyOptional({ description: 'Document tags (comma-separated)', example: 'identity,passport' })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({ description: 'Additional metadata as JSON string' })
  @IsOptional()
  @IsString()
  metadata?: string;
}