import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  first_name: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  last_name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ enum: ['admin', 'manager', 'analyst', 'viewer'] })
  @IsEnum(['admin', 'manager', 'analyst', 'viewer'])
  role: 'admin' | 'manager' | 'analyst' | 'viewer';

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'pending', 'suspended'], default: 'pending' })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'pending', 'suspended'])
  status?: 'active' | 'inactive' | 'pending' | 'suspended' = 'pending';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  job_title?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  send_invitation_email?: boolean = true;
}