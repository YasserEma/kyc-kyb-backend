import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsObject,
  IsArray,
  MaxLength,
  MinLength,
  IsIn,
} from 'class-validator';

/**
 * DTO for adding a new value to a list
 */
export class CreateListValueDto {
  @ApiProperty({
    description: 'The display value',
    example: 'Saudi Arabia',
    maxLength: 500,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  value: string;

  @ApiPropertyOptional({
    description: 'Type of the value',
    example: 'custom',
    enum: ['name', 'email', 'phone', 'address', 'id_number', 'account_number', 'ip_address', 'domain', 'custom'],
    default: 'custom',
  })
  @IsOptional()
  @IsString()
  @IsIn(['name', 'email', 'phone', 'address', 'id_number', 'account_number', 'ip_address', 'domain', 'custom'])
  value_type?: string;

  @ApiPropertyOptional({
    description: 'Normalized/code value (e.g., ISO code)',
    example: 'SA',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  normalized_value?: string;

  @ApiPropertyOptional({
    description: 'Status of the value',
    example: 'active',
    enum: ['active', 'inactive', 'pending', 'expired', 'flagged'],
    default: 'active',
  })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive', 'pending', 'expired', 'flagged'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Category of the value',
    example: 'middle_east',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({
    description: 'Description of the value',
    example: 'Kingdom of Saudi Arabia',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Risk level of this specific value',
    example: 'low',
    enum: ['low', 'medium', 'high', 'critical'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['low', 'medium', 'high', 'critical'])
  risk_level?: string;

  @ApiPropertyOptional({
    description: 'Whether the value is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Additional metadata as JSON object',
    example: { region: 'GCC', continent: 'Asia' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Aliases for this value',
    example: ['KSA', 'Kingdom of Saudi Arabia'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aliases?: string[];

  @ApiPropertyOptional({
    description: 'Tags for the value',
    example: ['gcc', 'middle-east'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
