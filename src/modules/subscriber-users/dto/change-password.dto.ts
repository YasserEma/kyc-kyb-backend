import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, IsBoolean } from 'class-validator';

export class ChangePasswordDto {
  @ApiPropertyOptional({ description: 'Required when user changes own password' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  current_password?: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  new_password: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  send_invitation_email?: boolean = false;
}