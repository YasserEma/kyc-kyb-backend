import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsObject,
  MaxLength,
  MinLength,
  IsIn,
} from 'class-validator';

/**
 * DTO for creating a new list category
 */
export class CreateListDto {
  @ApiProperty({
    description: 'Name of the list',
    example: 'Nationalities',
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  list_name: string;

  @ApiProperty({
    description: 'Type of the list',
    example: 'custom',
    enum: ['whitelist', 'blacklist', 'greylist', 'watchlist', 'sanctions', 'pep', 'custom'],
  })
  @IsString()
  @IsIn(['whitelist', 'blacklist', 'greylist', 'watchlist', 'sanctions', 'pep', 'custom'])
  list_type: string;

  @ApiPropertyOptional({
    description: 'Description of the list',
    example: 'List of all nationalities for dropdown selection',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiPropertyOptional({
    description: 'Category of the list',
    example: 'regulatory',
    enum: ['regulatory', 'internal', 'external', 'customer', 'vendor'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['regulatory', 'internal', 'external', 'customer', 'vendor'])
  category?: string;

  @ApiPropertyOptional({
    description: 'Subcategory of the list',
    example: 'compliance',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  subcategory?: string;

  @ApiPropertyOptional({
    description: 'Priority level of the list',
    example: 'medium',
    enum: ['low', 'medium', 'high', 'critical'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['low', 'medium', 'high', 'critical'])
  priority?: string;

  @ApiPropertyOptional({
    description: 'Risk level associated with the list',
    example: 'low',
    enum: ['low', 'medium', 'high', 'critical'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['low', 'medium', 'high', 'critical'])
  risk_level?: string;

  @ApiPropertyOptional({
    description: 'Whether the list is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Additional metadata as JSON object',
    example: { source: 'manual', version: '1.0' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Tags for the list',
    example: ['lookup', 'dropdown'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
