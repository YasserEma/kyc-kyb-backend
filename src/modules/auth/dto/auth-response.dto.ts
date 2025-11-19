import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({ example: 'Verification email sent' })
  message: string;
}

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Bad Request' })
  message: string;

  @ApiProperty({ example: 'Invalid input' })
  error: string;
}

export class RegisterResponseDto {
  @ApiProperty({ example: 'Verification email sent' })
  message: string;
}

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refresh_token: string;

  @ApiProperty({ example: 3600, required: false })
  expires_in?: number;

  @ApiProperty({ example: 'Bearer', required: false })
  token_type?: string;

  @ApiProperty({ required: false })
  user?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role: string;
    subscriber?: {
      id: string;
      company_name?: string;
      type?: string;
    };
  };
}

export class RefreshTokenResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;
}
