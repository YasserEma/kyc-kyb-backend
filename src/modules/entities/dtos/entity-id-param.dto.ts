import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class EntityIdParamDto {
  @ApiProperty({ description: 'Entity ID (UUID v4)' })
  @IsUUID('4')
  entityId!: string;
}