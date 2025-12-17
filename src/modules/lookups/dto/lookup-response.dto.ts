import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LookupItemDto {
  @ApiProperty({ description: 'Unique value/code for the lookup item', example: 'ACTIVE' })
  value: string;

  @ApiProperty({ description: 'Display label for UI', example: 'Active' })
  label: string;

  @ApiPropertyOptional({ description: 'Optional description', example: 'Entity is verified and active' })
  description?: string;
}

export class LookupResponseDto {
  @ApiProperty({ description: 'Request success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Array of lookup items', type: [LookupItemDto] })
  data: LookupItemDto[];

  @ApiPropertyOptional({ description: 'Metadata about the response' })
  meta?: {
    total: number;
    timestamp: string;
  };
}
