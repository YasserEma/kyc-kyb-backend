import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class UploadDocumentDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  document_configuration_id!: string;

  @ApiPropertyOptional({ type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  expiry_date?: string;
}