import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class BulkActionDto {
  @ApiProperty({ description: 'Bulk action to perform', enum: ['activate', 'suspend', 'archive', 'restore', 'delete'] })
  @IsString()
  @IsIn(['activate', 'suspend', 'archive', 'restore', 'delete'])
  action!: 'activate' | 'suspend' | 'archive' | 'restore' | 'delete';

  @ApiProperty({ description: 'Entity IDs to apply the action to', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  entityIds!: string[];

  @ApiPropertyOptional({ description: 'Optional reason for audit/history' })
  @IsOptional()
  @IsString()
  reason?: string;
}