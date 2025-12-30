import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum } from 'class-validator';

export class UpdateCustomFieldDto {
  @ApiPropertyOptional({ description: 'Field value', example: 'Updated value' })
  @IsOptional()
  @IsString()
  field_value?: string;

  @ApiPropertyOptional({ description: 'Field value as JSON object' })
  @IsOptional()
  field_value_json?: any;

  @ApiPropertyOptional({ description: 'Field group name', example: 'contact_info' })
  @IsOptional()
  @IsString()
  field_group?: string;

  @ApiPropertyOptional({ 
    description: 'Field type', 
    enum: ['text', 'number', 'boolean', 'date', 'datetime', 'email', 'url', 'phone', 'json', 'array'],
    example: 'text' 
  })
  @IsOptional()
  @IsString()
  field_type?: string;

  @ApiPropertyOptional({ description: 'Field label for display' })
  @IsOptional()
  @IsString()
  field_label?: string;

  @ApiPropertyOptional({ description: 'Is field required' })
  @IsOptional()
  @IsBoolean()
  is_required?: boolean;

  @ApiPropertyOptional({ description: 'Is field searchable' })
  @IsOptional()
  @IsBoolean()
  is_searchable?: boolean;

  @ApiPropertyOptional({ description: 'Is field visible' })
  @IsOptional()
  @IsBoolean()
  is_visible?: boolean;

  @ApiPropertyOptional({ description: 'Is field editable' })
  @IsOptional()
  @IsBoolean()
  is_editable?: boolean;

  @ApiPropertyOptional({ description: 'Display order', example: 1 })
  @IsOptional()
  @IsNumber()
  display_order?: number;
}
