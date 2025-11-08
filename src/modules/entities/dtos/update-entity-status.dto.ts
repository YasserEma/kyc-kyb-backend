import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateEntityStatusDto {
  @ApiProperty({ description: 'New status value', example: 'ACTIVE' })
  @IsString()
  status!: string;

  @ApiPropertyOptional({ description: 'Reason for status change' })
  @IsOptional()
  @IsString()
  reason?: string;
}