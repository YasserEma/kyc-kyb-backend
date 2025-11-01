import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({
    description: 'Subscriber ID',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  subscriberId: string;

  @ApiProperty({
    description: 'Admin user ID',
    example: '550e8400-e29b-41d4-a716-446655440002'
  })
  adminUserId: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  access_token: string;

  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  refresh_token: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 3600
  })
  expires_in: number;

  @ApiProperty({
    description: 'Token type',
    example: 'Bearer'
  })
  token_type: string;

  @ApiProperty({
    description: 'User information',
    type: 'object',
    additionalProperties: false
  })
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    subscriber: {
      id: string;
      company_name: string;
      type: string;
    };
  };
}

export class RefreshResponseDto {
  @ApiProperty({
    description: 'New access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  access_token: string;

  @ApiProperty({
    description: 'New refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  refresh_token: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 3600
  })
  expires_in: number;

  @ApiProperty({
    description: 'Token type',
    example: 'Bearer'
  })
  token_type: string;
}

export class MessageResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Operation completed successfully'
  })
  message: string;
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'Error message',
    example: 'Invalid credentials'
  })
  message: string;

  @ApiProperty({
    description: 'Error code',
    example: 'INVALID_CREDENTIALS'
  })
  error?: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 400
  })
  statusCode: number;
}