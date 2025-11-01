import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsPhoneNumber, IsOptional, Matches } from 'class-validator';

export class RegisterSubscriberDto {
  @ApiProperty({
    description: 'Company name',
    example: 'Acme Corporation',
    maxLength: 255
  })
  @IsNotEmpty({ message: 'Company name is required' })
  @IsString({ message: 'Company name must be a string' })
  @MaxLength(255, { message: 'Company name must not exceed 255 characters' })
  companyName: string;

  @ApiProperty({
    description: 'Company type',
    example: 'LLC',
    maxLength: 100
  })
  @IsNotEmpty({ message: 'Company type is required' })
  @IsString({ message: 'Company type must be a string' })
  @MaxLength(100, { message: 'Company type must not exceed 100 characters' })
  companyType: string;

  @ApiProperty({
    description: 'Company jurisdiction',
    example: 'Delaware',
    maxLength: 100
  })
  @IsNotEmpty({ message: 'Jurisdiction is required' })
  @IsString({ message: 'Jurisdiction must be a string' })
  @MaxLength(100, { message: 'Jurisdiction must not exceed 100 characters' })
  jurisdiction: string;

  @ApiProperty({
    description: 'Company contact phone number',
    example: '+1234567890',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Company contact phone must be a string' })
  @MaxLength(20, { message: 'Company contact phone must not exceed 20 characters' })
  companyContactPhone?: string;

  @ApiProperty({
    description: 'Administrator full name',
    example: 'John Doe',
    maxLength: 200
  })
  @IsNotEmpty({ message: 'Administrator name is required' })
  @IsString({ message: 'Administrator name must be a string' })
  @MaxLength(200, { message: 'Administrator name must not exceed 200 characters' })
  adminName: string;

  @ApiProperty({
    description: 'Administrator email address',
    example: 'admin@acme.com',
    format: 'email'
  })
  @IsNotEmpty({ message: 'Administrator email is required' })
  @IsEmail({ 
    allow_display_name: false,
    require_display_name: false,
    allow_utf8_local_part: false,
    require_tld: true
  }, { message: 'Administrator email must be a valid email address' })
  @Matches(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    { message: 'Administrator email format is invalid' }
  )
  @MaxLength(255, { message: 'Administrator email must not exceed 255 characters' })
  adminEmail: string;

  @ApiProperty({
    description: 'Administrator password',
    example: 'SecurePassword123!',
    minLength: 8
  })
  @IsNotEmpty({ message: 'Administrator password is required' })
  @IsString({ message: 'Administrator password must be a string' })
  @MinLength(8, { message: 'Administrator password must be at least 8 characters long' })
  @MaxLength(255, { message: 'Administrator password must not exceed 255 characters' })
  adminPassword: string;

  @ApiProperty({
    description: 'Administrator phone number',
    example: '+1234567890',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Administrator phone must be a string' })
  @MaxLength(20, { message: 'Administrator phone must not exceed 20 characters' })
  adminPhoneNumber?: string;
}