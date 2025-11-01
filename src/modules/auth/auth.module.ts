import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailService } from './email/email.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { SubscribersModule } from '../subscribers/subscribers.module';
import { SubscriberUsersModule } from '../subscriber-users/subscriber-users.module';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_ACCESS_EXPIRATION') || '1h';
        return {
          secret: configService.get<string>('JWT_ACCESS_SECRET') || 'default-secret',
          signOptions: {
            expiresIn: expiresIn as any, // Cast to any to handle string format
          },
        };
      },
      inject: [ConfigService],
    }),
    SubscribersModule,
    SubscriberUsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailService,
    JwtStrategy,
    GoogleStrategy,
    JwtAuthGuard,
    GoogleOAuthGuard,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    GoogleOAuthGuard,
    PassportModule,
    JwtModule,
  ],
})
export class AuthModule {}