import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { RegisterSubscriberDto } from './dto/register-subscriber.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  RegisterResponseDto,
  LoginResponseDto,
  RefreshTokenResponseDto,
  MessageResponseDto,
  ErrorResponseDto,
} from './dto/auth-response.dto';
import { TokenPayload } from './interfaces/token-payload.interface';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('health')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 3, ttl: 1000 } }) // 3 requests per second
  @Throttle({ medium: { limit: 20, ttl: 10000 } }) // 20 requests per 10 seconds
  @Throttle({ long: { limit: 100, ttl: 60000 } }) // 100 requests per minute
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns the health status of the authentication service',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2023-10-27T12:00:00.000Z' },
        service: { type: 'string', example: 'auth' },
      },
    },
  })
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'auth',
    };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ short: { limit: 1, ttl: 1000 } }) // 1 request per second
  @Throttle({ medium: { limit: 3, ttl: 10000 } }) // 3 requests per 10 seconds
  @Throttle({ long: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @ApiOperation({
    summary: 'Register a new subscriber with admin user',
    description: 'Creates a new subscriber organization and its admin user account',
  })
  @ApiBody({ type: RegisterSubscriberDto })
  @ApiResponse({
    status: 201,
    description: 'Subscriber registered successfully',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Email already exists',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
    type: ErrorResponseDto,
  })
  async register(@Body() registerDto: RegisterSubscriberDto): Promise<RegisterResponseDto> {
    this.logger.log(`Registration attempt for company: ${registerDto.companyName}`);
    return this.authService.registerSubscriber(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 3, ttl: 1000 } }) // 3 requests per second
  @Throttle({ medium: { limit: 5, ttl: 10000 } }) // 5 requests per 10 seconds
  @Throttle({ long: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @ApiOperation({
    summary: 'User login with email and password',
    description: 'Authenticates user and returns access and refresh tokens',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Account locked or inactive',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
    type: ErrorResponseDto,
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    this.logger.log(`Login attempt for email: ${loginDto.email}`);
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 3, ttl: 1000 } }) // 3 requests per second
  @Throttle({ medium: { limit: 10, ttl: 10000 } }) // 10 requests per 10 seconds
  @Throttle({ long: { limit: 20, ttl: 60000 } }) // 20 requests per minute
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Generates a new access token using a valid refresh token',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
    type: ErrorResponseDto,
  })
  async refreshToken(@Body() refreshDto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    this.logger.log('Token refresh attempt');
    return this.authService.refreshToken(refreshDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'User logout',
    description: 'Invalidates the refresh token and logs out the user',
  })
  @ApiBody({ type: LogoutDto, required: false })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  async logout(
    @Req() req: Request & { user: TokenPayload },
    @Body() logoutDto?: LogoutDto,
  ): Promise<MessageResponseDto> {
    return this.authService.logout(req.user.sub, logoutDto?.refresh_token);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 1, ttl: 1000 } }) // 1 request per second
  @Throttle({ medium: { limit: 2, ttl: 10000 } }) // 2 requests per 10 seconds
  @Throttle({ long: { limit: 3, ttl: 60000 } }) // 3 requests per minute
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Sends a password reset email to the user if the email exists',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent (if email exists)',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
    type: ErrorResponseDto,
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<MessageResponseDto> {
    this.logger.log(`Password reset request for email: ${forgotPasswordDto.email}`);
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 2, ttl: 1000 } }) // 2 requests per second
  @Throttle({ medium: { limit: 3, ttl: 10000 } }) // 3 requests per 10 seconds
  @Throttle({ long: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @ApiOperation({
    summary: 'Reset password with token',
    description: 'Resets user password using a valid reset token',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset successful',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired reset token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
    type: ErrorResponseDto,
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<MessageResponseDto> {
    this.logger.log('Password reset attempt with token');
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({
    summary: 'Initiate Google OAuth login',
    description: 'Redirects to Google OAuth consent screen',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to Google OAuth',
  })
  @ApiExcludeEndpoint() // Exclude from Swagger as it's a redirect
  async googleAuth() {
    // This endpoint initiates Google OAuth flow
    // The actual logic is handled by GoogleOauthGuard
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({
    summary: 'Google OAuth callback',
    description: 'Handles Google OAuth callback and returns tokens',
  })
  @ApiResponse({
    status: 200,
    description: 'Google login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Google authentication failed',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found - registration required',
    type: ErrorResponseDto,
  })
  @ApiExcludeEndpoint() // Exclude from Swagger as it's a callback
  async googleAuthCallback(
    @Req() req: Request & { user: any },
    @Res() res: Response,
  ) {
    try {
      this.logger.log(`Google OAuth callback for email: ${req.user.email}`);
      
      const result = await this.authService.googleLogin({
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        googleId: req.user.googleId,
      });

      // In a real application, you might want to redirect to a frontend URL
      // with the tokens as query parameters or set them as secure cookies
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/auth/callback?access_token=${result.access_token}&refresh_token=${result.refresh_token}`;
      
      return res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error('Google OAuth callback error', error);
      
      // Redirect to frontend with error
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      const errorUrl = `${frontendUrl}/auth/error?message=${encodeURIComponent(errorMessage)}`;
      
      return res.redirect(errorUrl);
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns the authenticated user profile information',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        first_name: { type: 'string' },
        last_name: { type: 'string' },
        role: { type: 'string' },
        subscriber: {
          type: 'object',
          additionalProperties: false,
          properties: {
            id: { type: 'string' },
            company_name: { type: 'string' },
            type: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  async getProfile(@Req() req: Request & { user: TokenPayload }) {
    this.logger.log(`Profile request for user: ${req.user.sub}`);
    
    // The user information is already available from the JWT token
    // In a real application, you might want to fetch fresh data from the database
    return {
      id: req.user.sub,
      email: req.user.email,
      role: req.user.role,
      subscriberId: req.user.subscriberId,
    };
  }
}