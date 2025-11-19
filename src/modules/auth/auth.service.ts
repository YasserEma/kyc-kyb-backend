import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IsNull, QueryFailedError } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { SubscriberRepository } from '../subscribers/repositories/subscriber.repository';
import { SubscriberUserRepository } from '../subscriber-users/repositories/subscriber-user.repository';
import { EmailService } from './email/email.service';
import { RegisterSubscriberDto } from './dto/register-subscriber.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TokenPayload, GoogleProfile } from './interfaces/token-payload.interface';
import {
  RegisterResponseDto,
  LoginResponseDto,
  RefreshTokenResponseDto,
  MessageResponseDto,
} from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private subscriberRepository: SubscriberRepository,
    private subscriberUserRepository: SubscriberUserRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async registerSubscriber(dto: RegisterSubscriberDto): Promise<RegisterResponseDto> {
    try {
      // Check if admin email already exists
      const normalizedEmail = dto.adminEmail.toLowerCase();
      const existingUser = await this.subscriberUserRepository.findByEmail(normalizedEmail);
      if (existingUser) {
        throw new ConflictException('A user with this email already exists');
      }

      // Check for existing subscriber by company name (username) or email
      const [existingSubscriberByUsername, existingSubscriberByEmail] = await Promise.all([
        this.subscriberRepository.findByUsername(dto.companyName),
        this.subscriberRepository.findByEmail(normalizedEmail),
      ]);
      if (existingSubscriberByUsername) {
        throw new ConflictException('A subscriber with this company name already exists');
      }
      if (existingSubscriberByEmail) {
        throw new ConflictException('A subscriber with this email already exists');
      }

      // Hash the admin password
      const hashedPassword = await bcrypt.hash(dto.adminPassword, 12);

      // Split admin name into first and last name
      const nameParts = dto.adminName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      // Create subscriber entity
      const subscriber = this.subscriberRepository.create({
        username: dto.companyName,
        email: normalizedEmail,
        password: hashedPassword,
        type: dto.companyType,
        company_name: dto.companyName,
        contact_person_phone: dto.companyContactPhone,
        jurisdiction: dto.jurisdiction,
      });

      const savedSubscriber = await this.subscriberRepository.save(subscriber);

      // Create admin user
      const adminUser = this.subscriberUserRepository.create({
        subscriber_id: savedSubscriber.id,
        first_name: firstName,
        last_name: lastName,
        email: normalizedEmail,
        password_hash: hashedPassword,
        role: 'admin',
        status: 'active',
      });

      const savedAdminUser = await this.subscriberUserRepository.save(adminUser);

      // Send welcome email to admin user
      try {
        await this.emailService.sendWelcomeEmail(savedAdminUser.email, firstName);
        this.logger.log(`Welcome email sent to admin: ${savedAdminUser.email}`);
      } catch (emailError) {
        this.logger.error(`Failed to send welcome email to ${savedAdminUser.email}`, emailError);
        // Do not re-throw; registration should still succeed
      }

      this.logger.log(`New subscriber registered: ${savedSubscriber.id} with admin user: ${savedAdminUser.id}`);

      return {
        message: 'Subscriber registered successfully',
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      // Handle unique constraint violations gracefully (TypeORM / Postgres)
      if (error instanceof QueryFailedError) {
        const code: string | undefined = (error.driverError as any)?.code;
        const constraint: string | undefined = (error.driverError as any)?.constraint;
        if (code === '23505') {
          if (constraint === 'subscribers_username_key') {
            throw new ConflictException('Subscriber company name already exists');
          }
          if (constraint === 'subscribers_email_key') {
            throw new ConflictException('Subscriber email already exists');
          }
          if (constraint === 'subscriber_users_email_key') {
            throw new ConflictException('User email already exists');
          }
          throw new ConflictException('Duplicate value violates a unique constraint');
        }
      }
      this.logger.error('Error during subscriber registration', (error as Error)?.stack);
      throw new InternalServerErrorException('Failed to register subscriber');
    }
  }

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    try {
      // Find user by email
      const user = await this.subscriberUserRepository.findByEmail(dto.email);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if user status is active
      if (user.status !== 'active') {
        throw new ForbiddenException('User account is not active');
      }

      // Check if user is locked
      if (user.is_locked) {
        throw new ForbiddenException('User account is locked due to too many failed login attempts');
      }

      // Compare password
      const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
      if (!isPasswordValid) {
        // Increment failed login attempts
        await this.subscriberUserRepository.incrementFailedLoginAttempts(user.id);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Reset failed attempts and update last login
      await this.subscriberUserRepository.updateLastLogin(user.id);

      // Generate tokens
      const payload: TokenPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        subscriberId: user.subscriber_id,
      };

      const accessToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION') as any,
      });

      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') as any,
      });

      // Hash and store refresh token
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);
      await this.subscriberUserRepository.update(user.id, {
        hashed_refresh_token: hashedRefreshToken,
      });

      // Fetch subscriber details
      const subscriber = await this.subscriberRepository.findOne({
        where: { id: user.subscriber_id }
      });

      if (!subscriber) {
        throw new NotFoundException('Subscriber not found');
      }

      const expiresIn = this.parseExpirationTime(this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '1h');

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: expiresIn,
        token_type: 'Bearer',
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          subscriber: {
            id: subscriber.id,
            company_name: subscriber.company_name || subscriber.username,
            type: subscriber.type,
          },
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException || error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('Error during login', error);
      throw new InternalServerErrorException('Login failed');
    }
  }

  async refreshToken(dto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    try {
      // Verify refresh token signature and expiration
      const payload = this.jwtService.verify(dto.refresh_token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      }) as TokenPayload;

      // Find user by ID from token payload
      const user = await this.subscriberUserRepository.findOne({
        where: { 
          id: payload.sub,
          is_active: true,
          deleted_at: IsNull()
        }
      });
      
      if (!user || !user.hashed_refresh_token) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Compare the provided refresh token with the stored hash
      const isValidRefreshToken = await bcrypt.compare(dto.refresh_token, user.hashed_refresh_token);
      if (!isValidRefreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check user status
      if (user.status !== 'active' || user.is_locked) {
        throw new UnauthorizedException('User account is not active or locked');
      }

      // Invalidate old refresh token
      await this.subscriberUserRepository.update(user.id, {
        hashed_refresh_token: null,
      });

      // Generate new tokens
      const newPayload: TokenPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        subscriberId: user.subscriber_id,
      };

      const newAccessToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION') as any,
      });

      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') as any,
      });

      // Hash and store new refresh token
      const newHashedRefreshToken = await bcrypt.hash(newRefreshToken, 12);
      await this.subscriberUserRepository.update(user.id, {
        hashed_refresh_token: newHashedRefreshToken,
      });

      const expiresIn = this.parseExpirationTime(this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '1h');

      return {
        access_token: newAccessToken,
      };
    } catch (error) {
      if (error instanceof Error && (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('Error during token refresh', error);
      throw new InternalServerErrorException('Token refresh failed');
    }
  }

  async logout(userId: string, refreshToken?: string): Promise<MessageResponseDto> {
    try {
      // If refresh token is provided, verify it belongs to the user
      if (refreshToken) {
        try {
          // Verify and decode the JWT refresh token
          const payload = this.jwtService.verify(refreshToken, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          });

          // Check if the token belongs to the current user
          if (payload.sub !== userId) {
            throw new UnauthorizedException('Invalid refresh token');
          }

          // Find the user and verify the refresh token hash
          const user = await this.subscriberUserRepository.findOne({
            where: { 
              id: userId,
              is_active: true,
              deleted_at: IsNull()
            }
          });
          
          if (!user || !user.hashed_refresh_token) {
            throw new UnauthorizedException('Invalid refresh token');
          }

          // Compare the refresh token with the stored hash
          const isValidRefreshToken = await bcrypt.compare(refreshToken, user.hashed_refresh_token);
          if (!isValidRefreshToken) {
            throw new UnauthorizedException('Invalid refresh token');
          }
        } catch (error) {
          if (error instanceof Error && (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')) {
            throw new UnauthorizedException('Invalid or expired refresh token');
          }
          throw error;
        }
      }

      // Invalidate refresh token
      await this.subscriberUserRepository.update(userId, {
        hashed_refresh_token: null,
      });

      this.logger.log(`User ${userId} logged out successfully`);

      return {
        message: 'Logged out successfully',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('Error during logout', error);
      throw new InternalServerErrorException('Logout failed');
    }
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<MessageResponseDto> {
    try {
      const user = await this.subscriberUserRepository.findByEmail(dto.email);
      
      // Always return success message for security
      const successMessage = 'If an account with this email exists, a password reset link has been sent';

      if (user) {
        // Generate secure reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Store the PLAINTEXT token directly. This is secure enough for a 
        // short-lived, single-use, unguessable token and allows for a fast lookup.
        await this.subscriberUserRepository.update(user.id, {
          reset_token: resetToken, // Save the plaintext token
          reset_token_expires: resetTokenExpires,
        });

        // Send email
        try {
          await this.emailService.sendPasswordResetEmail(user.email, resetToken);
          this.logger.log(`Password reset email sent to ${user.email}`);
        } catch (emailError) {
          this.logger.error(`Failed to send password reset email to ${user.email}`, emailError);
          // Don't throw error to maintain security
        }
      }

      return {
        message: successMessage,
      };
    } catch (error) {
      this.logger.error('Error during forgot password', error);
      // Always return success message for security
      return {
        message: 'If an account with this email exists, a password reset link has been sent',
      };
    }
  }

  async resetPassword(dto: ResetPasswordDto): Promise<MessageResponseDto> {
    try {
      // Find the user DIRECTLY using the plaintext token.
      // This repository method already exists and checks for expiry.
      const user = await this.subscriberUserRepository.findByResetToken(dto.token);

      // Check if user was found.
      if (!user) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(dto.password, 12);

      // Update password and clear reset token
      await this.subscriberUserRepository.updatePassword(user.id, hashedPassword);
      await this.subscriberUserRepository.update(user.id, {
        reset_token: null,
        reset_token_expires: null,
        hashed_refresh_token: null, // Invalidate all sessions
      });

      this.logger.log(`Password reset successfully for user ${user.id}`);

      return {
        message: 'Password reset successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error during password reset', error);
      throw new InternalServerErrorException('Password reset failed');
    }
  }

  async googleLogin(profile: GoogleProfile): Promise<LoginResponseDto> {
    try {
      // Find user by email
      const user = await this.subscriberUserRepository.findByEmail(profile.email);

      if (!user) {
        throw new NotFoundException(
          'User not found. Please register first or contact administrator to link your Google account.',
        );
      }

      // Check user status
      if (user.status !== 'active') {
        throw new ForbiddenException('User account is not active');
      }

      if (user.is_locked) {
        throw new ForbiddenException('User account is locked');
      }

      // Update user with Google ID if not already present
      if (!user.google_id) {
        await this.subscriberUserRepository.update(user.id, {
          google_id: profile.googleId,
        });
      }

      // Update last login
      await this.subscriberUserRepository.updateLastLogin(user.id);

      // Generate tokens
      const payload: TokenPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        subscriberId: user.subscriber_id,
      };

      const accessToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION') as any,
      });

      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') as any,
      });

      // Hash and store refresh token
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);
      await this.subscriberUserRepository.update(user.id, {
        hashed_refresh_token: hashedRefreshToken,
      });

      // Fetch subscriber details
      const subscriber = await this.subscriberRepository.findOne({
        where: { id: user.subscriber_id }
      });

      if (!subscriber) {
        throw new NotFoundException('Subscriber not found');
      }

      const expiresIn = this.parseExpirationTime(this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '1h');

      this.logger.log(`Google login successful for user ${user.id}`);

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: expiresIn,
        token_type: 'Bearer',
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          subscriber: {
            id: subscriber.id,
            company_name: subscriber.company_name || subscriber.username,
            type: subscriber.type,
          },
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error('Error during Google login', error);
      throw new InternalServerErrorException('Google login failed');
    }
  }

  private parseExpirationTime(expiration: string): number {
    // Parse expiration string like '1h', '15m', '7d' to seconds
    const unit = expiration.slice(-1);
    const value = parseInt(expiration.slice(0, -1));

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 3600; // Default to 1 hour
    }
  }
}