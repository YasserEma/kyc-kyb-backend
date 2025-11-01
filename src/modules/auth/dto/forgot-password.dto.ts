import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength, Matches } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'User email address',
    example: 'admin@acme.com',
    format: 'email'
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({ 
    allow_display_name: false,
    require_display_name: false,
    allow_utf8_local_part: false,
    require_tld: true
  }, { message: 'Email must be a valid email address' })
  @Matches(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    { message: 'Email format is invalid' }
  )
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email: string;
}