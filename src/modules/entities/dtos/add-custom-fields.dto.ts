import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CustomFieldItemDto {
  @ApiProperty({ description: 'Field name', example: 'occupation' })
  @IsString()
  field_name!: string;

  @ApiProperty({ description: 'Field value', example: 'Software Engineer' })
  @IsString()
  field_value!: string;

  @ApiPropertyOptional({ 
    description: 'Field type', 
    enum: ['text', 'number', 'boolean', 'date', 'datetime', 'email', 'url', 'phone', 'json', 'array'],
    default: 'text',
    example: 'text'
  })
  @IsOptional()
  @IsEnum(['text', 'number', 'boolean', 'date', 'datetime', 'email', 'url', 'phone', 'json', 'array'])
  field_type?: 'text' | 'number' | 'boolean' | 'date' | 'datetime' | 'email' | 'url' | 'phone' | 'json' | 'array';

  @ApiPropertyOptional({ description: 'Field value for non-string types (JSON, arrays, etc.)', example: '{"key": "value"}' })
  @IsOptional()
  field_value_json?: any;

  @ApiPropertyOptional({ description: 'Field group for organization', example: 'basic_info' })
  @IsOptional()
  @IsString()
  field_group?: string;
}

export class AddCustomFieldsDto {
  @ApiProperty({ 
    description: 'Array of custom fields to add', 
    type: [CustomFieldItemDto] 
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomFieldItemDto)
  custom_fields!: CustomFieldItemDto[];
}