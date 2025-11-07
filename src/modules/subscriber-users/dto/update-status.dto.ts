import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum SubscriberUserStatus {
  active = 'active',
  inactive = 'inactive',
  pending = 'pending',
  suspended = 'suspended',
}

export class UpdateStatusDto {
  @ApiProperty({ enum: ['active', 'inactive', 'pending', 'suspended'] })
  @IsEnum(['active', 'inactive', 'pending', 'suspended'])
  status!: 'active' | 'inactive' | 'pending' | 'suspended';
}