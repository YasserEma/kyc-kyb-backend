import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CustomFieldItemDto {
  @ApiProperty({ description: 'Field name', example: 'occupation' })
  @IsString()
  field_name!: string;

  @ApiProperty({ description: 'Field value', example: 'Software Engineer' })
  @IsString()
  field_value!: string;

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