import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsString } from 'class-validator';

export enum UpdatePermissionMode {
  REPLACE = 'REPLACE',
  ADD = 'ADD',
  REMOVE = 'REMOVE',
}

export class UpdatePermissionsDto {
  @ApiProperty({ enum: ['REPLACE', 'ADD', 'REMOVE'] })
  @IsEnum(['REPLACE', 'ADD', 'REMOVE'])
  mode!: 'REPLACE' | 'ADD' | 'REMOVE';

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  permissions: string[] = [];
}