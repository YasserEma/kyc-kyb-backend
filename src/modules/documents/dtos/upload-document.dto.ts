import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID, IsString } from 'class-validator';

export class UploadDocumentDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  document_configuration_id!: string;

  @ApiPropertyOptional({ description: 'Document name/title', example: 'Passport Document' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Document description', example: 'Customer identification document' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  expiry_date?: string;
}